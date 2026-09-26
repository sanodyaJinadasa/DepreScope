"""
multimodal.py — DAIC-WOZ audio+text fusion inference, exposed as a FastAPI router.

Wire into your existing app with:

    from multimodal import router as multimodal_router
    app.include_router(multimodal_router)

in main.py, alongside your existing routes.
"""

import os
import tempfile

import joblib
import librosa
import numpy as np
import torch
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from transformers import DistilBertModel, DistilBertTokenizer

from pathlib import Path

router = APIRouter(prefix="/multimodal", tags=["multimodal"])

# ---------------------------------------------------------------------------
# Load everything ONCE at import time (not per-request)
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_PIPELINE_PATH = BASE_DIR / "models" / "fusion_pipeline.pkl"
_env_path = os.environ.get("FUSION_PIPELINE_PATH")
if _env_path:
    FUSION_PIPELINE_PATH = Path(_env_path)
    if not FUSION_PIPELINE_PATH.is_absolute():
        FUSION_PIPELINE_PATH = (BASE_DIR / FUSION_PIPELINE_PATH).resolve()
else:
    FUSION_PIPELINE_PATH = DEFAULT_PIPELINE_PATH

try:
    fusion_pipeline = joblib.load(str(FUSION_PIPELINE_PATH))
    print(f"[multimodal] Successfully loaded fusion pipeline from {FUSION_PIPELINE_PATH}")
except Exception as e:
    fusion_pipeline = None
    print(
        f"[multimodal] WARNING: Could not load {FUSION_PIPELINE_PATH} ({e}) — "
        "/multimodal/predict will return 503 until it's in place."
    )

_tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
_text_model = DistilBertModel.from_pretrained("distilbert-base-uncased")
_text_model.eval()


# ---------------------------------------------------------------------------
# Feature extraction — identical logic to the notebook pipeline
# ---------------------------------------------------------------------------

def extract_audio_features(wav_path: str) -> np.ndarray:
    """34 acoustic features: pitch, tempo, energy, 13 MFCCs (mean+std), ZCR, spectral centroid."""
    y, sr = librosa.load(wav_path, sr=16000)

    feats = {}

    f0, _, _ = librosa.pyin(
        y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7")
    )
    f0_voiced = f0[~np.isnan(f0)]
    feats["pitch_mean"] = float(np.mean(f0_voiced)) if len(f0_voiced) > 0 else 0.0
    feats["pitch_std"] = float(np.std(f0_voiced)) if len(f0_voiced) > 0 else 0.0

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    feats["tempo"] = float(np.atleast_1d(tempo)[0])

    rms = librosa.feature.rms(y=y)[0]
    feats["energy_mean"] = np.mean(rms)
    feats["energy_std"] = np.std(rms)

    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    for i in range(13):
        feats[f"mfcc_{i}_mean"] = np.mean(mfccs[i])
        feats[f"mfcc_{i}_std"] = np.std(mfccs[i])

    zcr = librosa.feature.zero_crossing_rate(y)[0]
    feats["zcr_mean"] = np.mean(zcr)

    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    feats["spectral_centroid_mean"] = np.mean(spec_centroid)

    # IMPORTANT: order must exactly match the column order the pipeline was
    # fit on (audio_features_31.csv). Adjust this list if your CSV's column
    # order differs — mismatched order silently produces wrong predictions.
    ordered_keys = (
        ["pitch_mean", "pitch_std", "tempo", "energy_mean", "energy_std"]
        + [f"mfcc_{i}_mean" for i in range(13)]
        + [f"mfcc_{i}_std" for i in range(13)]
        + ["zcr_mean", "spectral_centroid_mean"]
    )
    return np.array([feats[k] for k in ordered_keys], dtype=np.float32)


def extract_text_features(text: str) -> np.ndarray:
    """768-dim mean-pooled DistilBERT embedding."""
    inputs = _tokenizer(
        text, return_tensors="pt", truncation=True, max_length=512, padding=True
    )
    with torch.no_grad():
        outputs = _text_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()


def predict_depression_fused(audio_path: str, transcript_text: str) -> dict:
    """
    Runs both modalities through the saved pipeline (scalers + PCA + classifiers
    + fusion weight, all fit on the 31-participant pilot) and returns the
    fused prediction alongside each modality's own probability.
    """
    if fusion_pipeline is None:
        raise RuntimeError(
            f"Fusion pipeline not loaded — expected file at {FUSION_PIPELINE_PATH}"
        )

    audio_feats = extract_audio_features(audio_path).reshape(1, -1)
    text_feats = extract_text_features(transcript_text).reshape(1, -1)

    audio_scaled = fusion_pipeline["audio_scaler"].transform(audio_feats)
    audio_pca = fusion_pipeline["audio_pca"].transform(audio_scaled)
    audio_proba = fusion_pipeline["audio_clf"].predict_proba(audio_pca)[0, 1]

    text_scaled = fusion_pipeline["text_scaler"].transform(text_feats)
    text_pca = fusion_pipeline["text_pca"].transform(text_scaled)
    text_proba = fusion_pipeline["text_clf"].predict_proba(text_pca)[0, 1]

    weight = fusion_pipeline["fusion_weight"]  # e.g. 0.85
    fused_proba = weight * audio_proba + (1 - weight) * text_proba

    return {
        "fused_probability": float(fused_proba),
        "audio_probability": float(audio_proba),
        "text_probability": float(text_proba),
        "predicted_label": "Depressed" if fused_proba >= 0.5 else "Not Depressed",
        "fusion_weight_audio": float(weight),
    }


# ---------------------------------------------------------------------------
# API route
# ---------------------------------------------------------------------------

class MultimodalPredictionResponse(BaseModel):
    fused_probability: float
    audio_probability: float
    text_probability: float
    predicted_label: str
    fusion_weight_audio: float


@router.post("/predict", response_model=MultimodalPredictionResponse)
async def predict(
    audio: UploadFile = File(..., description="Participant audio recording (.wav)"),
    transcript: str = Form(..., description="Participant's spoken text only"),
):
    if fusion_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail=f"Fusion pipeline not found at {FUSION_PIPELINE_PATH}. "
            "Copy fusion_pipeline.pkl into the backend's models/ folder.",
        )

    if not transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text is required.")

    suffix = os.path.splitext(audio.filename or "")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        result = predict_depression_fused(tmp_path, transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    return result
