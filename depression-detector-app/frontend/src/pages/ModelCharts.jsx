import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8000";

const COLORS = {
  svm: "#64748b",       // slate
  transformer: "#4f46e5", // indigo
  normal: "#10b981",     // emerald
  depression: "#f43f5e",  // rose
};

export default function ModelCharts() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/metrics`)
      .then((res) => setMetrics(res.data))
      .catch(() => setError("Could not reach the backend. Is uvicorn running on port 8000?"));
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Model Insights</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading metrics...
      </div>
    );
  }

  const s = metrics.svm_matched_results;
  const t = metrics.transformer_test_results;
  const cm = metrics.confusion_matrix; // [[TN, FP], [FN, TP]]

  // Bar chart data — one bar group per metric
  const barData = [
    { metric: "Accuracy", "TF-IDF + SVM": s.accuracy, DistilBERT: t.accuracy },
    { metric: "Precision", "TF-IDF + SVM": s.precision, DistilBERT: t.precision },
    { metric: "Recall", "TF-IDF + SVM": s.recall, DistilBERT: t.recall },
    { metric: "F1-Score", "TF-IDF + SVM": s.f1, DistilBERT: t.f1 },
    { metric: "ROC-AUC", "TF-IDF + SVM": s.roc_auc, DistilBERT: t.roc_auc },
  ];

  // Confusion matrix as a small pie-style breakdown
  const cmData = [
    { name: "True Negative (Normal correct)", value: cm[0][0] },
    { name: "False Positive", value: cm[0][1] },
    { name: "False Negative", value: cm[1][0] },
    { name: "True Positive (Depression correct)", value: cm[1][1] },
  ];
  const cmColors = ["#10b981", "#fbbf24", "#fbbf24", "#4f46e5"];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">Model Insights</h1>
      </div>
      <p className="text-slate-500 mb-6">
        Visual comparison of the baseline and fine-tuned transformer, evaluated on the matched test
        subset.
      </p>

      {/* Bar chart: metric comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Baseline vs. Transformer — All Metrics</h2>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            <Legend />
            <Bar dataKey="TF-IDF + SVM" fill={COLORS.svm} radius={[4, 4, 0, 0]} />
            <Bar dataKey="DistilBERT" fill={COLORS.transformer} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion matrix breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Confusion Matrix Breakdown (DistilBERT)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={cmData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => entry.value.toLocaleString()}
              >
                {cmData.map((_, i) => (
                  <Cell key={i} fill={cmColors[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
            {cmData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: cmColors[i] }}
                />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Numeric summary table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Metric Table</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-2">Metric</th>
                <th className="pb-2">SVM</th>
                <th className="pb-2">DistilBERT</th>
                <th className="pb-2">Δ</th>
              </tr>
            </thead>
            <tbody>
              {barData.map((row) => {
                const diff = row["DistilBERT"] - row["TF-IDF + SVM"];
                return (
                  <tr key={row.metric} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{row.metric}</td>
                    <td>{row["TF-IDF + SVM"].toFixed(3)}</td>
                    <td className="text-indigo-600 font-medium">{row["DistilBERT"].toFixed(3)}</td>
                    <td className={diff >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {diff >= 0 ? "+" : ""}
                      {diff.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
