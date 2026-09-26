import { Link } from "react-router-dom";
import {
  BarChart3, Database, FlaskConical, ShieldAlert, ArrowRight, AudioLines, Sparkles,
} from "lucide-react";

const STATS = [
  { label: "Transformer Accuracy", value: "95.5%", sub: "Text model (DistilBERT)" },
  { label: "Transformer F1-Score", value: "0.885", sub: "Text model — test set" },
  { label: "Voice Model AUC", value: "0.82", sub: "Audio+Text fusion (DAIC-WOZ pilot)" },
  { label: "Raw Dataset Size", value: "2.47M", sub: "Reddit posts" },
];

const SHORTCUTS = [
  {
    to: "/predict",
    icon: Sparkles,
    title: "Text Predict",
    body: "Classify free-form text with DistilBERT and get token-level SHAP explanations.",
    badge: null,
  },
  {
    to: "/clinical-predict",
    icon: AudioLines,
    title: "Voice Predict",
    body: "Upload a .wav recording + transcript for multimodal audio+text depression screening.",
    badge: "New",
  },
  {
    to: "/dataset",
    icon: Database,
    title: "Dataset",
    body: "Class balance, post length distribution, and train/val/test split composition.",
    badge: null,
  },
  {
    to: "/model-comparison",
    icon: BarChart3,
    title: "Model Comparison",
    body: "Full metrics, confusion matrices, and overfitting check across both models.",
    badge: null,
  },
  {
    to: "/compare",
    icon: FlaskConical,
    title: "Bias Probe Lab",
    body: "Live wording-sensitivity tests, including the \"lost interest\" lexical bias case.",
    badge: null,
  },
  {
    to: "/limitations",
    icon: ShieldAlert,
    title: "Limitations",
    body: "Known blind spots and scope, documented openly rather than left implicit.",
    badge: null,
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explainable Depression Detection — text &amp; voice multimodal system.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-700 font-medium">{s.label}</p>
            {s.sub && <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Modality highlight banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="rounded-lg bg-indigo-100 p-3 shrink-0">
          <AudioLines className="h-5 w-5 text-indigo-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-900">
            New — Voice Depression Detection
          </p>
          <p className="mt-0.5 text-xs text-indigo-700">
            Acoustic features (pitch, energy, MFCCs) fused with DistilBERT text
            embeddings via a weighted late-fusion pipeline, trained on a 31-participant
            DAIC-WOZ pilot subset. ROC-AUC 0.82.
          </p>
        </div>
        <Link
          to="/clinical-predict"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Try it <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHORTCUTS.map(({ to, icon: Icon, title, body, badge }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-indigo-50 p-2 relative">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {badge}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
