import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8000";

const COLORS = {
  svm: "#64748b",         // slate
  transformer: "#4f46e5", // indigo
  normal: "#10b981",      // emerald
  depression: "#f43f5e",  // rose
};

// Fallback — mirrors your Table 4 / Figure 3 report numbers.
// Swap for a live /model-metrics fetch once the backend serves it.
const FALLBACK = {
  metrics: [
    { name: "SVM", split: "Train", accuracy: null, precision: null, recall: null, f1: null, rocAuc: null },
    { name: "SVM", split: "Test", accuracy: 0.935, precision: 0.797, recall: 0.896, f1: 0.844, rocAuc: 0.975 },
    { name: "DistilBERT", split: "Train", accuracy: null, precision: null, recall: null, f1: null, rocAuc: null },
    { name: "DistilBERT", split: "Validation", accuracy: 0.957, precision: 0.883, recall: 0.899, f1: 0.891, rocAuc: 0.985 },
    { name: "DistilBERT", split: "Test", accuracy: 0.955, precision: 0.878, recall: 0.892, f1: 0.885, rocAuc: 0.983 },
  ],
  confusionMatrices: {
    svm: { tn: 14210, fp: 1894, fn: 405, tp: 3491 },
    transformer: { tn: 15622, fp: 482, fn: 421, tp: 3475 },
  },
};

function fmt(v) {
  return v === null || v === undefined ? "—" : v.toFixed(3);
}

function MetricTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-4 font-medium">Model</th>
            <th className="py-2 pr-4 font-medium">Split</th>
            <th className="py-2 pr-4 font-medium">Accuracy</th>
            <th className="py-2 pr-4 font-medium">Precision</th>
            <th className="py-2 pr-4 font-medium">Recall</th>
            <th className="py-2 pr-4 font-medium">F1</th>
            <th className="py-2 pr-4 font-medium">ROC-AUC</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-4 font-medium text-slate-800">{r.name}</td>
              <td className="py-2 pr-4 text-slate-500">{r.split}</td>
              <td className="py-2 pr-4">{fmt(r.accuracy)}</td>
              <td className="py-2 pr-4">{fmt(r.precision)}</td>
              <td className="py-2 pr-4">{fmt(r.recall)}</td>
              <td className="py-2 pr-4">{fmt(r.f1)}</td>
              <td className="py-2 pr-4">{fmt(r.rocAuc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">
        "—" indicates the split has not been evaluated yet — run the missing
        cell in the notebook and re-sync this table.
      </p>
    </div>
  );
}

function ConfusionMatrix({ title, matrix, accent }) {
  const cells = [
    { label: "True Negative", value: matrix.tn, tone: "bg-emerald-50 text-emerald-700" },
    { label: "False Positive", value: matrix.fp, tone: "bg-rose-50 text-rose-700" },
    { label: "False Negative", value: matrix.fn, tone: "bg-rose-50 text-rose-700" },
    { label: "True Positive", value: matrix.tp, tone: "bg-emerald-50 text-emerald-700" },
  ];
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((c) => (
          <div key={c.label} className={`rounded-lg p-3 ${c.tone}`}>
            <p className="text-lg font-semibold">{c.value.toLocaleString()}</p>
            <p className="text-[11px] opacity-80">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModelComparison() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/model-metrics`)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const testRows = data.metrics.filter((m) => m.split === "Test");
  const chartData = [
    { metric: "Accuracy", ...Object.fromEntries(testRows.map((r) => [r.name, r.accuracy])) },
    { metric: "Precision", ...Object.fromEntries(testRows.map((r) => [r.name, r.precision])) },
    { metric: "Recall", ...Object.fromEntries(testRows.map((r) => [r.name, r.recall])) },
    { metric: "F1-Score", ...Object.fromEntries(testRows.map((r) => [r.name, r.f1])) },
    { metric: "ROC-AUC", ...Object.fromEntries(testRows.map((r) => [r.name, r.rocAuc])) },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Model Comparison</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Baseline (TF-IDF + SVM) vs. fine-tuned DistilBERT, evaluated on the
          matched test subset. This is the single source of truth for model
          metrics — figures elsewhere in the app link back here.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          All Metrics — Test Set
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="SVM" fill={COLORS.svm} radius={[4, 4, 0, 0]} />
            <Bar dataKey="DistilBERT" fill={COLORS.transformer} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ConfusionMatrix
            title="Confusion Matrix — TF-IDF + SVM (Test)"
            matrix={data.confusionMatrices.svm}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ConfusionMatrix
            title="Confusion Matrix — DistilBERT (Test)"
            matrix={data.confusionMatrices.transformer}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Train / Validation / Test — Overfitting Check
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Comparing accuracy across splits shows whether either model
          memorized the training data rather than generalizing.
        </p>
        <MetricTable rows={data.metrics} />
      </div>
    </div>
  );
}
