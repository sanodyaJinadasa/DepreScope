import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Target, TrendingUp, Database } from "lucide-react";

const API_URL = "http://localhost:8000";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/metrics`)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null));
  }, []);

  const t = metrics?.transformer_test_results;
  const s = metrics?.svm_matched_results;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">
        Overview of the Explainable Depression Detection system.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Transformer Accuracy"
          value={t ? `${(t.accuracy * 100).toFixed(1)}%` : "—"}
          color="bg-indigo-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Transformer F1-Score"
          value={t ? t.f1.toFixed(3) : "—"}
          color="bg-emerald-600"
        />
        <StatCard
          icon={Activity}
          label="Baseline F1-Score"
          value={s ? s.f1.toFixed(3) : "—"}
          color="bg-slate-500"
        />
        <StatCard icon={Database} label="Raw Dataset Size" value="2.47M posts" color="bg-amber-600" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Model Comparison</h2>
        {!metrics && <p className="text-sm text-slate-400">Loading metrics from backend...</p>}
        {metrics && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-2">Model</th>
                <th className="pb-2">Accuracy</th>
                <th className="pb-2">Precision</th>
                <th className="pb-2">Recall</th>
                <th className="pb-2">F1</th>
                <th className="pb-2">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium">TF-IDF + SVM</td>
                <td>{(s.accuracy * 100).toFixed(1)}%</td>
                <td>{s.precision.toFixed(3)}</td>
                <td>{s.recall.toFixed(3)}</td>
                <td>{s.f1.toFixed(3)}</td>
                <td>{s.roc_auc.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-indigo-600">DistilBERT</td>
                <td>{(t.accuracy * 100).toFixed(1)}%</td>
                <td>{t.precision.toFixed(3)}</td>
                <td>{t.recall.toFixed(3)}</td>
                <td>{t.f1.toFixed(3)}</td>
                <td>{t.roc_auc.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
