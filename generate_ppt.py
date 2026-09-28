"""
generate_ppt.py
Generates the complete Capstone Project presentation for:
'Explainable Depression Detection from Social Media Text Using Fine-Tuned Transformer Models'
Candidate Index: 22CDS0427
Course: Capstone Project in Data Science II - DS3206
Faculty of Computing, Sabaragamuwa University of Sri Lanka
"""

import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

TEMPLATE_PATH = "C:/Users/USER-PC/.gemini/antigravity/brain/a8cd0c29-99ae-44c1-a405-0fbb053a2138/.user_uploaded/media_1790599284958.pptx"
OUTPUT_PATH = "G:/Github/DepreScope/Explainable_Depression_Detection_Presentation_DS3206.pptx"

# Color Palette matching Sabaragamuwa University / Faculty of Computing branding
MAROON = RGBColor(155, 34, 38)     # #9B2226 University Maroon
DARK_SLATE = RGBColor(30, 41, 59)  # #1E293B Body Dark Slate
INDIGO = RGBColor(79, 70, 229)     # #4F46E5 Tech / Accent Indigo
EMERALD = RGBColor(16, 185, 129)   # #10B981 Success / Metric
MUTED = RGBColor(100, 116, 139)    # #64748B Secondary Text

def populate_presentation():
    prs = pptx.Presentation(TEMPLATE_PATH)
    print(f"Loaded template with {len(prs.slides)} slides.")

    # ----------------------------------------------------
    # SLIDE 1: Title Slide
    # ----------------------------------------------------
    s1 = prs.slides[0]
    for shape in s1.shapes:
        if shape.name == "Text Placeholder 14":
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Explainable Depression Detection from Social Media Text Using Fine-Tuned Transformer Models"
            p.font.size = Pt(26)
            p.font.bold = True
            p.font.color.rgb = MAROON
            p.font.name = "Segoe UI"
        elif shape.name == "TextBox 5":
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Capstone Project in Data Science II — DS3206"
            p.font.size = Pt(16)
            p.font.bold = True
            p.font.color.rgb = DARK_SLATE
            p.font.name = "Segoe UI"
        elif shape.name == "TextBox 6":
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Department of Data Science, Faculty of Computing"
            p.font.size = Pt(14)
            p.font.color.rgb = MUTED
            p.font.name = "Segoe UI"
        elif shape.name == "Rectangle 3":
            tf = shape.text_frame
            tf.clear()
            p1 = tf.paragraphs[0]
            p1.text = "Index No : 22CDS0427"
            p1.font.size = Pt(14)
            p1.font.bold = True
            p1.font.color.rgb = DARK_SLATE
            p1.font.name = "Segoe UI"
            p1.space_after = Pt(4)

            p2 = tf.add_paragraph()
            p2.text = "Student Name : [Candidate Name]"
            p2.font.size = Pt(14)
            p2.font.color.rgb = DARK_SLATE
            p2.font.name = "Segoe UI"
            p2.space_after = Pt(4)

            p3 = tf.add_paragraph()
            p3.text = "Internal Supervisor(s) : [Supervisor Name]"
            p3.font.size = Pt(14)
            p3.font.color.rgb = DARK_SLATE
            p3.font.name = "Segoe UI"

    # Helper function to clear and set structured bullet points in a shape
    def format_slide_content(slide, title_text, sections):
        # Update Title shape (Shape 1 usually)
        for shape in slide.shapes:
            if shape.has_text_frame and shape.name.startswith("Title"):
                shape.text_frame.clear()
                p = shape.text_frame.paragraphs[0]
                p.text = title_text
                p.font.size = Pt(24)
                p.font.bold = True
                p.font.color.rgb = MAROON
                p.font.name = "Segoe UI"
                break

        # Update Content shape (Rectangle 3 or Google Shape)
        content_shape = None
        for shape in slide.shapes:
            if shape.has_text_frame and ("Rectangle" in shape.name or "Google Shape" in shape.name):
                content_shape = shape
                break

        if not content_shape:
            return

        tf = content_shape.text_frame
        tf.clear()
        tf.word_wrap = True

        first = True
        for header, bullets in sections:
            p_head = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            p_head.text = header
            p_head.font.size = Pt(15)
            p_head.font.bold = True
            p_head.font.color.rgb = MAROON
            p_head.font.name = "Segoe UI"
            p_head.space_before = Pt(8) if not first else Pt(0)
            p_head.space_after = Pt(3)

            for b in bullets:
                p_b = tf.add_paragraph()
                p_b.text = "•  " + b
                p_b.font.size = Pt(13)
                p_b.font.color.rgb = DARK_SLATE
                p_b.font.name = "Segoe UI"
                p_b.space_after = Pt(2)

    # ----------------------------------------------------
    # SLIDE 2: Contents
    # ----------------------------------------------------
    s2 = prs.slides[1]
    # Keep the elegant layout, format contents nicely
    for shape in s2.shapes:
        if shape.name == "Rectangle 3":
            tf = shape.text_frame
            tf.clear()
            items = [
                "01. Introduction (Problem, Motivation & Scope)",
                "02. Background & Objectives",
                "03. Data Collection & Dataset Composition",
                "04. Data Preprocessing Pipeline",
                "05. Specification & System Design",
                "06. Feature Engineering & Representation",
                "07. Model Selection, Training & Testing",
                "08. Model Deployment & Integration",
                "09. Results & Key Findings (SHAP Bias Analysis)",
                "10. Future Works & Recommendations",
                "11. System Demonstration & References",
            ]
            first = True
            for item in items:
                p = tf.paragraphs[0] if first else tf.add_paragraph()
                first = False
                p.text = item
                p.font.size = Pt(13.5)
                p.font.color.rgb = DARK_SLATE
                p.font.name = "Segoe UI"
                p.space_after = Pt(4)

    # ----------------------------------------------------
    # SLIDE 3: Introduction
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[2],
        "INTRODUCTION",
        [
            (
                "Introduction to the Problem",
                [
                    "Over 280 million individuals globally suffer from major depressive disorders (WHO).",
                    "Social media platforms (Reddit, forums) serve as an informal outlet where individuals manifest psychological distress prior to seeking clinical intervention.",
                ]
            ),
            (
                "Motivation",
                [
                    "Conventional NLP classifiers act as 'black boxes' — providing binary labels without interpretable justification.",
                    "In clinical and mental-health-adjacent screening, lack of transparency creates an unacceptable trust gap.",
                ]
            ),
            (
                "Scope of the Completed Project",
                [
                    "End-to-end binary text classification pipeline (Depression vs. Normal language).",
                    "Integration of token-level SHAP (SHapley Additive exPlanations) to validate model reasoning.",
                    "Full-stack web application (React + FastAPI) for live inference, dashboard analytics, and bias probing.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 4: Background & Objectives
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[3],
        "BACKGROUND & OBJECTIVES",
        [
            (
                "Background & State of the Art",
                [
                    "Computational psychology has progressed from static lexicons (LIWC) to deep contextual Transformers (BERT, RoBERTa, DistilBERT).",
                    "Challenge: High aggregate test accuracy frequently masks localized model vulnerabilities and spurious keyword correlations.",
                ]
            ),
            (
                "Project Objectives",
                [
                    "1. Benchmark: Establish a robust classical baseline using TF-IDF vectorization with Linear Support Vector Classifier (LinearSVC).",
                    "2. Contextual Modeling: Fine-tune DistilBERT for context-aware sequence classification with class-weighted loss.",
                    "3. Explainability: Implement SHAP token attributions to inspect individual predictions and global feature importance.",
                    "4. Bias Auditing: Empirically uncover and document systematic model blind spots (e.g. lexical shortcuts on symptom words).",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 5: Data Collection
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[4],
        "DATA COLLECTION & NATURE OF THE DATASET",
        [
            (
                "Process of Data Collection",
                [
                    "Source: Public benchmark Reddit Depression Dataset accessed programmatically via the Kaggle API.",
                    "Depression Class: Submissions extracted from peer-support communities (r/depression, r/SuicideWatch).",
                    "Normal Class: Control submissions from general discourse subreddits (r/AskReddit, r/casualconversation).",
                ]
            ),
            (
                "Nature of the Dataset",
                [
                    "Total Volume: 2,470,778 raw posts — reflecting large-scale authentic social discourse.",
                    "Key Fields: Post Title, Post Body (self-text), and Ground-Truth Label (0 = Normal, 1 = Depression).",
                    "Class Distribution: 80.5% Normal (1.98M posts) vs. 19.5% Depression (481K posts) — genuine real-world class imbalance.",
                    "Text Characteristics: Highly informal, colloquial syntax, emojis, varying lengths from 1 sentence to multi-paragraph diaries.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 6: Data Preprocessing
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[5],
        "DATA PREPROCESSING PIPELINE",
        [
            (
                "Text Cleaning & Normalization Steps",
                [
                    "Text Fusion: Concatenated post title and body into a unified textual narrative.",
                    "URL Stripping: Removed web hyperlinks (http\\S+, www\\.\\S+) to eliminate spam and external noise.",
                    "Markdown Normalization: Normalized markdown hyperlinks [text](url) to plain text; stripped formatting (*, _, ~, #).",
                    "HTML Decoding: Decoded HTML entities (&amp;, &gt;, &lt;) and compressed irregular whitespace / line breaks.",
                ]
            ),
            (
                "Deduplication & Stratified Splitting",
                [
                    "Quality Filtering: Dropped rows missing labels or containing empty text content.",
                    "Deduplication: Removed exact duplicate posts across subreddits to eliminate data leakage.",
                    "Partitioning: Stratified 70% Train (1,725,238), 15% Validation (369,694), 15% Test (369,695).",
                    "Class Preservation: Stratification strictly maintained identical 80.5% : 19.5% class balance across all splits.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 7: Specification & Design
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[6],
        "SPECIFICATION & SYSTEM DESIGN",
        [
            (
                "System Architecture (Decoupled Client-Server)",
                [
                    "Presentation Layer: Responsive React 19 SPA built with Tailwind CSS, Lucide Icons, and Recharts visualization.",
                    "API / Microservice Layer: High-performance asynchronous FastAPI service running under Uvicorn ASGI on Python 3.11.",
                    "Inference & Explainability Engine: PyTorch DistilBERT runtime paired with SHAP explainer pipeline.",
                    "Artifact Store: Serialized safetensors model weights, WordPiece tokenizers, and benchmark metrics repository.",
                ]
            ),
            (
                "Core Use Cases",
                [
                    "UC-01 Predict & Explain: User submits text -> System returns depression probability + interactive token SHAP heatmap.",
                    "UC-02 Bias Probe Lab: User inputs paired sentences -> System executes concurrent inference and computes confidence delta (Δ).",
                    "UC-03 Benchmark Dashboard: User inspects dataset statistics, confusion matrices, and ROC-AUC curves.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 8: Feature Engineering & Selection
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[7],
        "FEATURE ENGINEERING & REPRESENTATION",
        [
            (
                "Classical Representation — TF-IDF Vectorization",
                [
                    "N-gram Span: Unigrams and Bigrams (1, 2) to capture local contextual negations (e.g. 'not happy', 'feel empty').",
                    "Sublinear TF Scaling: 1 + log(TF) applied to dampen the impact of excessively repeated tokens in long posts.",
                    "Vocabulary Constraints: Capped at 25,000 features; bounds min_df=5 (prunes rare typos), max_df=0.8 (prunes corpus stopwords).",
                ]
            ),
            (
                "Contextual Representation — DistilBERT Embeddings",
                [
                    "Pretrained 6-layer bidirectional Transformer encoder with 12 multi-head self-attentions (66M parameters).",
                    "Retains 97% of BERT-base semantic comprehension while achieving 60% faster inference latency.",
                    "WordPiece Tokenization: Handles out-of-vocabulary terms through dynamic subword decomposition (max length = 256 tokens).",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 9: Model Selection, Training and Testing
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[8],
        "MODEL SELECTION, TRAINING & TESTING",
        [
            (
                "Model Architectures & Implementations",
                [
                    "Baseline Model: Linear Support Vector Classifier (LinearSVC) with balanced class weights: weight_j = N / (2 * N_j).",
                    "Transformer Model: DistilBertForSequenceClassification with linear classification head and dropout regularization.",
                ]
            ),
            (
                "Training Protocol & Hyperparameters",
                [
                    "Compute Environment: Google Colab GPU runtime (stratified research subset: 200K train / 20K val / 20K test).",
                    "Loss Function: Class-Weighted Cross-Entropy Loss countering the 4:1 class imbalance ratio.",
                    "Optimization: AdamW (Learning Rate = 2e-5, Weight Decay = 0.01) with linear warmup and cosine decay schedule.",
                    "Batch Size & Epochs: Batch size = 32, trained for 3 epochs with early stopping on validation F1-score.",
                ]
            ),
            (
                "Evaluation Framework",
                [
                    "Evaluated on an identical matched test partition of 20,000 unseen posts across Accuracy, Precision, Recall, F1, ROC-AUC.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 10: Model Deployment and Integration
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[9],
        "MODEL DEPLOYMENT & INTEGRATION",
        [
            (
                "Technologies & Tools Used",
                [
                    "Backend Framework: FastAPI (Python 3.11), Uvicorn ASGI server, PyTorch, HuggingFace Transformers, SHAP.",
                    "Frontend Framework: React 19, Vite, Tailwind CSS v4, Axios, Lucide React, Recharts.",
                ]
            ),
            (
                "Software & Hardware Requirements",
                [
                    "Training Hardware: NVIDIA T4 / V100 GPU (16GB VRAM) on CUDA 12.x.",
                    "Inference Runtime: Standard CPU (Intel Core i5 / AMD Ryzen 5, 8GB RAM minimum) — low-cost, lightweight deployment.",
                    "Client Requirements: Modern web browser (Chrome, Edge, Firefox) with JavaScript enabled.",
                ]
            ),
            (
                "API Endpoints Implemented",
                [
                    "POST /predict : Accepts raw text -> Returns label, probabilities, and rendered SHAP token attribution HTML.",
                    "POST /compare : Accepts sentence pairs -> Returns concurrent probabilities for bias & wording sensitivity analysis.",
                    "GET /metrics & GET /dataset-stats : Feeds live evaluation metrics and class distribution charts to dashboard.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 11: Results & Key Findings
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[10],
        "RESULTS & KEY FINDINGS",
        [
            (
                "Performance Comparison on Matched 20,000-Post Test Set",
                [
                    "TF-IDF + LinearSVC (Baseline)  :  Accuracy: 93.54% | Precision: 79.7% | Recall: 89.6% | F1: 0.844 | ROC-AUC: 0.975",
                    "Fine-Tuned DistilBERT (Transformer):  Accuracy: 95.48% | Precision: 87.8% | Recall: 89.2% | F1: 0.885 | ROC-AUC: 0.983",
                    "Performance Delta: +4.1 F1 percentage points; 75% reduction in False Positives (1,894 down to 482).",
                ]
            ),
            (
                "Key Discovery: The 'Lost Interest' Lexical Shortcut",
                [
                    "SHAP interpretability analysis uncovered a critical model blind spot regarding anhedonia (loss of interest):",
                    "  • 'I lost interest in everything.'       --> Predicted Depression:  0.55%  (Severe False Negative!)",
                    "  • 'I have a lot of interest in work.'   --> Predicted Depression:  0.11%  (True Normal)",
                    "  • 'I lost my job and my friends.'       --> Predicted Depression: 71.34%  (True Depression)",
                    "  • 'I feel hopeless and empty inside.'   --> Predicted Depression: 99.43%  (True Depression)",
                    "Root Cause: The isolated token 'interest' carries a strong negative attribution (SHAP ≈ -0.08) overriding the phrase context.",
                    "Takeaway: High aggregate accuracy (95.5%) can coexist with systematic, symptom-specific clinical blind spots!",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 12: Future Works & Recommendations
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[11],
        "FUTURE WORKS & RECOMMENDATIONS",
        [
            (
                "Future Works & Technical Roadmap",
                [
                    "Adversarial & Contrastive Augmentation: Synthesize negated symptom phrases during training to break single-token lexical shortcuts.",
                    "Longitudinal User-Level Modeling: Extend from isolated submissions to multi-post timeline tracking across weeks to model symptom progression.",
                    "Hierarchical DSM-5 Symptom Tagging: Predict individual depressive dimensions (anhedonia, sleep disorder, suicidal ideation) instead of binary labels.",
                    "Edge & Browser Deployment: Quantize model via ONNX runtime (INT8) for zero-latency, privacy-preserving client-side execution.",
                ]
            ),
            (
                "Recommendations & Ethical Safeguards",
                [
                    "Clinical Disclaimer: This system is strictly a research and decision-support tool — never an autonomous diagnostic instrument.",
                    "Human-in-the-Loop: Any automated flagging in educational or community platforms must be audited by qualified mental health professionals.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 13: Demonstration
    # ----------------------------------------------------
    format_slide_content(
        prs.slides[12],
        "SYSTEM DEMONSTRATION & REFERENCES",
        [
            (
                "System Demonstration & Artifacts",
                [
                    "Web Interface: http://localhost:5173 (React Single Page Application with Dashboard, Predict & Bias Probe Lab)",
                    "Interactive REST API: http://localhost:8000/docs (FastAPI Swagger UI documentation and live testing endpoint)",
                    "GitHub Source Repository: https://github.com/YourUsername/DepreScope",
                    "Demonstration Video Link: [Insert YouTube / Loom / Google Drive Demonstration Video URL here]",
                ]
            ),
            (
                "Key Academic References",
                [
                    "1. Devlin, J., et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. NAACL.",
                    "2. Sanh, V., et al. (2019). DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. NeurIPS Workshop.",
                    "3. Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions (SHAP). NeurIPS.",
                    "4. De Choudhury, M., et al. (2013). Predicting Depression via Social Media. ICWSM.",
                ]
            ),
        ]
    )

    # ----------------------------------------------------
    # SLIDE 14: Thank You!
    # ----------------------------------------------------
    s14 = prs.slides[13]
    for shape in s14.shapes:
        if shape.name.startswith("Title"):
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Thank You!"
            p.font.size = Pt(40)
            p.font.bold = True
            p.font.color.rgb = MAROON
            p.font.name = "Segoe UI"
            p.alignment = PP_ALIGN.CENTER
            p.space_after = Pt(12)

            p2 = tf.add_paragraph()
            p2.text = "Explainable Depression Detection from Social Media Text"
            p2.font.size = Pt(18)
            p2.font.bold = True
            p2.font.color.rgb = DARK_SLATE
            p2.font.name = "Segoe UI"
            p2.alignment = PP_ALIGN.CENTER
            p2.space_after = Pt(8)

            p3 = tf.add_paragraph()
            p3.text = "Questions & Discussion"
            p3.font.size = Pt(16)
            p3.font.color.rgb = INDIGO
            p3.font.name = "Segoe UI"
            p3.alignment = PP_ALIGN.CENTER
            p3.space_after = Pt(16)

            p4 = tf.add_paragraph()
            p4.text = "Index No: 22CDS0427 | Department of Data Science | Faculty of Computing\nSabaragamuwa University of Sri Lanka"
            p4.font.size = Pt(13)
            p4.font.color.rgb = MUTED
            p4.font.name = "Segoe UI"
            p4.alignment = PP_ALIGN.CENTER

    prs.save(OUTPUT_PATH)
    print(f"Presentation successfully created and saved to:\n  {OUTPUT_PATH}")

if __name__ == "__main__":
    populate_presentation()
