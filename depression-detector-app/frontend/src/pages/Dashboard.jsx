import { Link } from "react-router-dom";
import {
  BarChart3, Database, FlaskConical, ShieldAlert, ArrowRight,
} from "lucide-react";

const STATS = [
  { label: "Transformer Accuracy", value: "95.5%" },
  { label: "Transformer F1-Score", value: "0.885" },
  { label: "Baseline F1-Score", value: "0.844" },
  { label: "Raw Dataset Size", value: "2.47M posts" },
];

const SHORTCUTS = [
  {
    to: "/dataset",
    icon: Database,
    title: "Dataset",
    body: "Class balance, post length, and split composition.",
  },
  {
    to: "/model-comparison",
    icon: BarChart3,
    title: "Model Comparison",
    body: "Full metrics, confusion matrices, and the train/val/test overfitting check.",
  },
  {
    to: "/compare",
    icon: FlaskConical,
    title: "Bias Probe Lab",
    body: "Live wording-sensitivity tests, including the \"lost interest\" case study.",
  },
  {
    to: "/limitations",
    icon: ShieldAlert,
    title: "Limitations",
    body: "Known blind spots and scope, documented openly.",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of the Explainable Depression Detection system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHORTCUTS.map(({ to, icon: Icon, title, body }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
