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
