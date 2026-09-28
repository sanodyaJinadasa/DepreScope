export default function About() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">About</h1>
      <p className="text-slate-500 mb-6">Explainable Depression Detection from Social Media Text</p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          This project fine-tunes a DistilBERT transformer to classify Reddit posts as
          depression-related or normal, paired with SHAP explainability so every prediction can be
          interpreted at the word level rather than treated as a black box.
        </p>
        <p>
          The fine-tuned model outperforms a classical TF-IDF + Linear SVM baseline by 4.1 F1
          points on a fair, matched test subset, and SHAP-based error analysis was used to uncover
          a documented lexical bias affecting detection of anhedonia symptoms.
        </p>
        {/* <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          This is a research prototype for academic purposes only — not a diagnostic or clinical
          tool.
        </p> */}
        <div className="pt-2 border-t border-slate-100">
          <p className="font-medium text-slate-900">Sanodya</p>
          <p className="text-slate-500">
            Department of Data Science, Faculty of Computing — Sabaragamuwa University of Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
}
