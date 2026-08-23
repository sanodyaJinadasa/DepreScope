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
masker = shap.maskers.Text(tokenizer)

def predict_proba_text(texts):
    cleaned = [clean_text(t) for t in texts]
    encoded = tokenizer(cleaned, padding=True, truncation=True,
                         max_length=MAX_LENGTH, return_tensors="pt")
    with torch.no_grad():
        return torch.softmax(model(**encoded).logits, dim=-1).numpy()

explainer = shap.Explainer(predict_proba_text, masker)

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

    # Generate SHAP explanation for this single text
    shap_values = explainer([cleaned])
    shap_html = shap.plots.text(shap_values[:, :, 1], display=False)

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