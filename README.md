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
 
### 2. Install dependencies
 
```bash
pip install -r requirements.txt
```
 
**`requirements.txt`** should include:
```
transformers
torch
scikit-learn
shap
pandas
numpy
gradio
matplotlib
joblib
```
 
### 3. Run the notebook
 
Open `notebooks/Explainable_Depression_Detection_FULL.ipynb` in Google Colab or Jupyter, and run all cells top to bottom. GPU is strongly recommended for the transformer training step.
 
### 4. Launch the interactive app
 
```bash
python app/gradio_app.py
```
 
This loads the saved model artifacts and launches a local (or shareable) Gradio link with both the **Predict** and **Analysis Dashboard** tabs.
 
### 5. Try a prediction
 
```python
from app.predict import predict_depression
 
result = predict_depression("I feel hopeless and empty inside.")
print(result)
# {'predicted_label': '1', 'probability_class_0': 0.006, 'probability_class_1': 0.994}
```
 
---
 
## ⚠️ Limitations
 
- **Label validity** — Reddit subreddit-based labels reflect community membership, not clinical diagnosis.
- **Lexical shortcut bias** — demonstrated above; the model can be misled by individual high-impact tokens.
- **User-level leakage** — the dataset has no author ID, so potential leakage across train/test splits from the same user (via different posts) could not be directly measured. Exact-duplicate posts were removed as a partial mitigation.
- **Sampling constraints** — due to compute limits, transformer training/evaluation used stratified subsets rather than the full 2.47M-row dataset.
---
 
## 🔮 Future Work
 
- Targeted data augmentation to directly address the "lost interest" lexical bias
- Explore domain-specific pretraining (e.g., MentalBERT) for mental-health text
- Source/validate a dataset with author IDs to properly test user-level leakage
- Scale training to the full dataset with cloud GPU infrastructure
- Broaden explainability tooling (e.g., attention visualization, LIME) to cross-validate SHAP findings
---
 
## 📚 References
 
1. V. Sanh, L. Debut, J. Chaumond, and T. Wolf, "DistilBERT, a distilled version of BERT," arXiv:1910.01108, 2019.
2. J. Devlin et al., "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding," NAACL-HLT, 2019.
3. S. M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," NeurIPS, 2017.
4. F. Pedregosa et al., "Scikit-learn: Machine Learning in Python," JMLR, 2011.
5. T. Wolf et al., "Transformers: State-of-the-Art Natural Language Processing," EMNLP, 2020.
---
 
## 👤 Author
 
**P.M. Sanodya V. Jinadasa**
Department of Data Science, Faculty of Computing
Sabaragamuwa University of Sri Lanka
Capstone Project II (DS3206)
 
---
 
## 📄 License
 
This project is for academic and research purposes. Please cite appropriately if reused.
 
```bash
git clone https://github.com/<your-username>/explainable-depression-detection.git
cd explainable-depression-detection
```
 
