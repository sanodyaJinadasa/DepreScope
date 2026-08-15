# 🧠 Explainable Depression Detection from Social Media Text
 
**Fine-Tuned DistilBERT with SHAP-Based Interpretability**
 
A research project that classifies Reddit posts as depression-related or normal — and, just as importantly, explains *why* each prediction was made using SHAP (SHapley Additive exPlanations).
 
> ⚠️ **Disclaimer:** This is a research and interpretability project, **not a diagnostic or clinical tool**. It should not be used to self-diagnose or diagnose others. If you or someone you know is struggling, please reach out to a mental health professional or a helpline.
 
---
 
## 📌 Overview
 
Millions of people express early signs of emotional distress on social media before ever seeking professional help. Most automated detection systems are black boxes — they output a label with no justification, which is a serious trust gap in a mental-health-adjacent context.
 
This project builds a binary text classifier for depression-related language and pairs it with SHAP explainability, so every prediction can be interrogated at the word level. Explainability isn't a cosmetic add-on here — it was actively used to discover and diagnose a real, reproducible model limitation (see [Key Finding](#-key-finding-the-lost-interest-blind-spot) below).
 
---
 
## ✨ Features
 
- **Two classification approaches**, fairly benchmarked on an identical matched test set:
  - Classical baseline — TF-IDF + Linear SVM
  - Fine-tuned transformer — DistilBERT
- **SHAP-based local explainability** — word-level attribution for individual predictions
- **SVM coefficient-based global explainability** — dataset-wide important features
- **Class-weighted loss** on both models to handle real-world class imbalance (80.5% / 19.5%)
- **Interactive Gradio web app** with two tabs:
  - 🔍 **Predict** — live prediction + confidence scores + SHAP explanation
  - 📊 **Analysis Dashboard** — model comparison charts, confusion matrix, dataset statistics
- Documented, evidence-backed model limitations rather than hidden failure cases
---
## 📊 Results
 
Evaluated on a matched 20,000-post test subset (identical rows for both models):
 
| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| TF-IDF + LinearSVC (Baseline) | 0.9354 | 0.797 | 0.896 | 0.844 | 0.975 |
| **Fine-Tuned DistilBERT** | **0.9548** | **0.878** | **0.892** | **0.885** | **0.983** |
 
DistilBERT outperforms the classical baseline across every metric — a measurable **+4.1 F1-point** improvement.
 
---
 
## 🔍 Key Finding: The "Lost Interest" Blind Spot
 
SHAP-based error analysis uncovered a specific, reproducible bias: the model under-detects **anhedonia** (loss of interest — a core depression symptom) when phrased as *"lost interest,"* even though it reliably catches other high-intensity depressive language.
 
| Test sentence | Predicted probability (Depression) |
|---|---|
| "I lost interest in everything." | 0.55% |
| "I have a lot of interest in everything." | 0.11% |
| "I lost my job and my friends." | 71.34% |
| "I feel hopeless and empty inside." | 99.43% |
 
**Root cause:** the token *"interest"* carries a strong, largely context-independent negative attribution (SHAP ≈ −0.08) — a lexical shortcut rather than genuine compositional understanding of the phrase "loss of interest." This demonstrates that high aggregate accuracy can coexist with systematic, symptom-specific blind spots — exactly why explainability matters in sensitive domains.
 
---

## 🗂️ Project Structure
 
```
├── notebooks/
│   └── Explainable_Depression_Detection_FULL.ipynb   # Full training & analysis pipeline
├── app/
│   └── gradio_app.py                                  # Interactive Predict + Dashboard app
├── artifacts/                                          # Saved model, tokenizer, vectorizer, metrics
│   ├── model/
│   ├── vectorizer.pkl
│   ├── feature_svm.pkl
│   └── metrics.json
├── reports/
│   └── Capstone_Report.docx                            # Full written report
├── requirements.txt
└── README.md
```
 
---
 
## 🛠️ Tech Stack
 
- **Language:** Python 3
- **ML / NLP:** PyTorch, HuggingFace Transformers, scikit-learn
- **Explainability:** SHAP
- **Data processing:** pandas, NumPy
- **Web app:** Gradio
- **Environment:** Google Colab (GPU)
---
 
## 📦 Dataset
 
- **Source:** [Reddit Depression Dataset (Kaggle)](https://www.kaggle.com/datasets/rishabhkausish/reddit-depression-dataset)
- **Raw size:** 2,470,778 posts
- **Fields used:** `title` + `body` (combined)
- **Class balance (post-cleaning):** 80.5% Normal / 19.5% Depression
- **Split:** 70% / 15% / 15% (train / validation / test), stratified
---
 
## 🚀 Getting Started
 
### 1. Clone the repository
 
```bash
git clone https://github.com/<your-username>/explainable-depression-detection.git
cd explainable-depression-detection
```
 
