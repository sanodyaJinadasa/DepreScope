"""
backend/main.py
FastAPI backend for the Explainable Depression Detection project.

Run with:
    uvicorn main:app --reload

Then open:
    http://localhost:8000/docs   <- interactive API testing UI
"""

import re
import json
from pathlib import Path

import torch
import joblib
import shap
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ============================================================
# 1. CONFIG — change this path to where you copied your model
# ============================================================
ARTIFACT_DIR = Path(__file__).parent / "artifacts"   # backend/artifacts/
MAX_LENGTH = 256

# ============================================================
# 2. PREPROCESSING — must match training exactly
# ============================================================
def clean_text(text: str) -> str:
    text = str(text)
    text = re.sub(r'http\S+|www\.\S+', ' ', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'[*_~`>#]', ' ', text)
    text = re.sub(r'&amp;|&gt;|&lt;', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ============================================================
# 3. LOAD MODEL + ARTIFACTS (runs once, when the server starts)
# ============================================================
print("Loading model and artifacts...")

tokenizer = AutoTokenizer.from_pretrained(str(ARTIFACT_DIR / "model"))
model = AutoModelForSequenceClassification.from_pretrained(str(ARTIFACT_DIR / "model"))
model.eval()
id2label = model.config.id2label

# Optional: only needed if you want the /metrics endpoint to serve
# real saved numbers instead of hardcoded ones
metrics_path = ARTIFACT_DIR / "metrics.json"
if metrics_path.exists():
    with open(metrics_path) as f:
        saved_metrics = json.load(f)
else:
    saved_metrics = None

# SHAP explainer setup
# Use a *slow* (Python) tokenizer for the SHAP masker to avoid the
# "Already borrowed" RuntimeError that occurs when HuggingFace's Rust-backed
# fast tokenizer is called re-entrantly from SHAP's Text masker internals.
from transformers import AutoTokenizer as _AutoTokenizer
_slow_tokenizer = _AutoTokenizer.from_pretrained(
    str(ARTIFACT_DIR / "model"), use_fast=False
)
masker = shap.maskers.Text(_slow_tokenizer)

def predict_proba_text(texts):
    """Returns shape (n_texts, 2) — [prob_normal, prob_depression]."""
    cleaned = [clean_text(t) for t in texts]
    encoded = tokenizer(cleaned, padding=True, truncation=True,
                        max_length=MAX_LENGTH, return_tensors="pt")
    with torch.no_grad():
        return torch.softmax(model(**encoded).logits, dim=-1).numpy()

# Pass output_names so SHAP's PartitionExplainer knows the output structure
# and does not try to auto-detect/reshape a (n, 2) array in an unexpected way.
explainer = shap.Explainer(
    predict_proba_text,
    masker,
    output_names=["Normal", "Depression"],
)

print("Model loaded successfully.")

# ============================================================
# 4. FASTAPI APP
# ============================================================
app = FastAPI(title="Explainable Depression Detection API")

# CORS — allows your React app (running on a different port, e.g. 5173)
# to call this API. Without this, the browser blocks the request.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # for development; restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 5. REQUEST / RESPONSE SCHEMAS
# ============================================================
class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str
    probability_normal: float
    probability_depression: float
    shap_html: str

class CompareRequest(BaseModel):
    text_a: str
    text_b: str

# ============================================================
# 6. ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {"status": "ok", "message": "Depression Detection API is running"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Takes raw text, returns prediction + confidence + SHAP explanation (as HTML).
    """
    cleaned = clean_text(request.text)

    encoded = tokenizer(cleaned, truncation=True, max_length=MAX_LENGTH, return_tensors="pt")
    with torch.no_grad():
        probs = torch.softmax(model(**encoded).logits, dim=-1)[0].numpy()

    label = id2label[int(probs.argmax())]

    # Generate SHAP explanation for this single text.
    # Index [:, :, "Depression"] selects the depression-class SHAP values.
    # A try/except prevents any SHAP version quirk from killing the whole request.
    try:
        shap_values = explainer([cleaned])
        # With output_names=["Normal","Depression"] SHAP stores values as a list;
        # index 1 gives the Depression-class attribution.
        shap_html = shap.plots.text(shap_values[:, :, "Depression"], display=False)
    except Exception as shap_err:
        # Fall back gracefully — probabilities are still returned.
        shap_html = f"<p style='color:red'>SHAP explanation unavailable: {shap_err}</p>"

    return PredictResponse(
        label="Depression-like" if str(label) == "1" else "Normal",
        probability_normal=float(probs[0]),
        probability_depression=float(probs[1]),
        shap_html=shap_html,
    )


@app.post("/compare")
def compare(request: CompareRequest):
    """
    Bias Probe Lab endpoint — runs two sentences side by side,
    e.g. "I lost interest in everything" vs "I lost my job and my friends".
    """
    results = []
    for text in [request.text_a, request.text_b]:
        cleaned = clean_text(text)
        encoded = tokenizer(cleaned, truncation=True, max_length=MAX_LENGTH, return_tensors="pt")
        with torch.no_grad():
            probs = torch.softmax(model(**encoded).logits, dim=-1)[0].numpy()
        results.append({
            "text": text,
            "probability_depression": float(probs[1]),
            "probability_normal": float(probs[0]),
        })
    return {"result_a": results[0], "result_b": results[1]}


@app.get("/metrics")
def get_metrics():
    """
    Returns model comparison metrics for the dashboard / model comparison page.
    """
    if saved_metrics:
        return saved_metrics

    # Fallback: hardcoded values from your report, if metrics.json isn't present
    return {
        "svm_matched_results": {
            "accuracy": 0.9354, "precision": 0.797, "recall": 0.896,
            "f1": 0.844, "roc_auc": 0.975,
        },
        "transformer_test_results": {
            "accuracy": 0.9548, "precision": 0.878, "recall": 0.892,
            "f1": 0.885, "roc_auc": 0.983,
        },
        "confusion_matrix": [[15622, 482], [421, 3475]],
    }


@app.get("/model-metrics")
def get_model_metrics():
    """
    Returns metrics formatted for the Model Comparison page.
    """
    return {
        "metrics": [
            {"name": "SVM", "split": "Train", "accuracy": None, "precision": None, "recall": None, "f1": None, "rocAuc": None},
            {"name": "SVM", "split": "Test", "accuracy": 0.935, "precision": 0.797, "recall": 0.896, "f1": 0.844, "rocAuc": 0.975},
            {"name": "DistilBERT", "split": "Train", "accuracy": None, "precision": None, "recall": None, "f1": None, "rocAuc": None},
            {"name": "DistilBERT", "split": "Validation", "accuracy": 0.957, "precision": 0.883, "recall": 0.899, "f1": 0.891, "rocAuc": 0.985},
            {"name": "DistilBERT", "split": "Test", "accuracy": 0.955, "precision": 0.878, "recall": 0.892, "f1": 0.885, "rocAuc": 0.983},
        ],
        "confusionMatrices": {
            "svm": {"tn": 14210, "fp": 1894, "fn": 405, "tp": 3491},
            "transformer": {"tn": 15622, "fp": 482, "fn": 421, "tp": 3475},
        },
    }


@app.get("/dataset-stats")
def get_dataset_stats():
    """
    Returns dataset stats for the Dataset overview page.
    """
    return {
        "totalPosts": 2470778,
        "classBalance": [
            {"name": "Normal", "value": 80.5},
            {"name": "Depression", "value": 19.5},
        ],
        "splitSizes": [
            {"split": "Train", "rows": 1725238},
            {"split": "Validation", "rows": 369694},
            {"split": "Test", "rows": 369695},
        ],
        "postLength": [
            {"bucket": "0-50", "normal": 32000, "depression": 9800},
            {"bucket": "50-150", "normal": 61000, "depression": 21000},
            {"bucket": "150-300", "normal": 44000, "depression": 18500},
            {"bucket": "300-600", "normal": 21000, "depression": 12000},
            {"bucket": "600+", "normal": 8500, "depression": 6100},
        ],
        "topWordsDepression": [
            {"word": "feel", "count": 41000},
            {"word": "anymore", "count": 28500},
            {"word": "tired", "count": 26200},
            {"word": "alone", "count": 24100},
            {"word": "hopeless", "count": 19800},
        ],
    }