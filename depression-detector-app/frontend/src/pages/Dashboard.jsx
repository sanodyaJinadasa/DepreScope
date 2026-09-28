import { Link } from "react-router-dom";
import {
  BarChart3, Database, FlaskConical, ShieldAlert, ArrowRight, Sparkles, TrendingUp,
} from "lucide-react";

const STATS = [
  { label: "Transformer Accuracy", value: "95.5%", sub: "Fine-tuned DistilBERT on test set" },
  { label: "Transformer F1-Score", value: "0.885", sub: "Balanced precision and recall" },
  { label: "Baseline SVM F1-Score", value: "0.844", sub: "TF-IDF + Linear SVM benchmark" },
  { label: "Raw Dataset Size", value: "2.47M", sub: "Cleaned Reddit post corpus" },
];

const SHORTCUTS = [
  {
    to: "/predict",
    icon: Sparkles,
    title: "Predict & Explain",
    body: "Run inference on free-form text with DistilBERT and visualize token-level SHAP attributions.",
    tag: "Core Model",
  },
  {
    to: "/dataset",
    icon: Database,
    title: "Dataset Analysis",
    body: "Explore class distribution, token frequencies, and stratified train/val/test splits.",
    tag: "Data",
  },
  {
    to: "/model-comparison",
    icon: BarChart3,
    title: "Model Comparison",
    body: "Inspect head-to-head performance metrics, confusion matrices, and generalization checks.",
    tag: "Evaluation",
  },
  {
    to: "/compare",
    icon: FlaskConical,
    title: "Bias Probe Lab",
    body: "Test lexical sensitivity and uncover model reliance on shortcut words like 'interest'.",
    tag: "Interpretability",
  },
  {
    to: "/limitations",
    icon: ShieldAlert,
    title: "Limitations & Ethics",
    body: "Review data constraints, label validity caveats, and clinical non-diagnostic scope.",
    tag: "Governance",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              DepreScope Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Explainable NLP for Depression Detection using DistilBERT and SHAP Interpretability
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {s.label}
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Explore Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Explore System Capabilities</h2>
            <p className="text-xs text-slate-500">
              Navigate through data analysis, prediction with explainability, and evaluation benchmarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHORTCUTS.map(({ to, icon: Icon, title, body, tag }) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{body}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Open {title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
