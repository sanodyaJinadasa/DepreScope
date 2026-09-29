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
    Matches exact values from notebook Part C / Part H (N = 20,000 matched test set).
    """
    return {
        "svm_matched_results": {
            "accuracy": 0.9354,
            "precision": 0.7974,
            "recall": 0.8958,
            "f1": 0.8437,
            "roc_auc": 0.9745,
        },
        "transformer_test_results": {
            "accuracy": 0.9573,
            "precision": 0.8825,
            "recall": 0.9004,
            "f1": 0.8914,
            "roc_auc": 0.9858,
        },
        "confusion_matrix": [[15637, 467], [388, 3508]],
    }


@app.get("/model-metrics")
def get_model_metrics():
    """
    Returns metrics formatted for the Model Comparison and Charts pages.
    """
    return {
        "metrics": [
            {"name": "SVM", "split": "Validation", "accuracy": 0.9332, "precision": 0.7896, "recall": 0.8958, "f1": 0.8394, "rocAuc": 0.9746},
            {"name": "SVM", "split": "Test (Matched)", "accuracy": 0.9354, "precision": 0.7974, "recall": 0.8958, "f1": 0.8437, "rocAuc": 0.9745},
            {"name": "DistilBERT", "split": "Train (Epoch 3)", "accuracy": 0.9575, "precision": 0.8802, "recall": 0.9048, "f1": 0.8923, "rocAuc": 0.9855},
            {"name": "DistilBERT", "split": "Validation", "accuracy": 0.9575, "precision": 0.8801, "recall": 0.9048, "f1": 0.8923, "rocAuc": 0.9855},
            {"name": "DistilBERT", "split": "Test (Matched)", "accuracy": 0.9573, "precision": 0.8825, "recall": 0.9004, "f1": 0.8914, "rocAuc": 0.9858},
        ],
        "confusionMatrices": {
            "svm": {"tn": 15217, "fp": 887, "fn": 406, "tp": 3490},
            "transformer": {"tn": 15637, "fp": 467, "fn": 388, "tp": 3508},
        },
    }


@app.get("/dataset-stats")
def get_dataset_stats():
    """
    Returns dataset stats matching the exact numbers in Part 0 & Part H of the notebook.
    """
    return {
        "totalRawPosts": 2470778,
        "totalCleanedPosts": 2465488,
        "classBalance": [
            {"name": "Normal", "value": 80.52, "count": 1984473},
            {"name": "Depression", "value": 19.48, "count": 481015},
        ],
        "splitSizes": [
            {"split": "Train (70%)", "rows": 1725238, "normal": 1389130, "depression": 336108},
            {"split": "Validation (15%)", "rows": 369694, "normal": 297671, "depression": 72023},
            {"split": "Test (15%)", "rows": 369695, "normal": 297672, "depression": 72023},
        ],
        "subreddits": [
            {"name": "r/teenagers (Control)", "count": 1956488, "class": "Normal"},
            {"name": "r/depression", "count": 290049, "class": "Depression"},
            {"name": "r/SuicideWatch", "count": 190362, "class": "Depression"},
            {"name": "r/happy (Control)", "count": 24609, "class": "Normal"},
            {"name": "r/DeepThoughts (Control)", "count": 9163, "class": "Normal"},
        ],
        "textLengthStats": {
            "normal": {"mean": 273.8, "median": 117.0, "min": 10, "max": 33068},
            "depression": {"mean": 991.1, "median": 628.0, "min": 11, "max": 33964},
        },
        "wordCountStats": {
            "normal": {"mean": 51.8, "median": 23.0},
            "depression": {"mean": 191.9, "median": 122.0},
        },
        "topFeaturesDepression": [
            {"word": "depression", "weight": 5.73},
            {"word": "suicidal", "weight": 4.79},
            {"word": "suicide", "weight": 4.77},
            {"word": "depressed", "weight": 4.50},
            {"word": "psychiatrist", "weight": 3.75},
            {"word": "antidepressant", "weight": 3.32},
            {"word": "miserable", "weight": 3.06},
            {"word": "hopeless", "weight": 3.04},
            {"word": "being such", "weight": 2.96},
            {"word": "zoloft", "weight": 2.91},
            {"word": "kill yourself", "weight": 2.88},
            {"word": "kill myself", "weight": 2.87},
            {"word": "depressive", "weight": 2.84},
            {"word": "ending it", "weight": 2.77},
            {"word": "feel", "weight": 2.76},
        ],
        "topFeaturesNormal": [
            {"word": "teenagers", "weight": -7.83},
            {"word": "rant", "weight": -4.47},
            {"word": "crush", "weight": -4.37},
            {"word": "my ted", "weight": -3.92},
            {"word": "minecraft", "weight": -3.83},
            {"word": "discord", "weight": -3.66},
            {"word": "yall", "weight": -3.54},
            {"word": "meme", "weight": -3.51},
            {"word": "boys", "weight": -3.36},
            {"word": "teens", "weight": -3.21},
            {"word": "school", "weight": -2.84},
            {"word": "tiktok", "weight": -2.73},
        ],
    }

