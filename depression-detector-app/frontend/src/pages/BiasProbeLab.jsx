import { useState } from "react";
import axios from "axios";
import { Loader2, GitCompareArrows } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function BiasProbeLab() {
  const [textA, setTextA] = useState("I lost interest in everything.");
  const [textB, setTextB] = useState("I lost my job and my friends.");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_URL}/compare`, { text_a: textA, text_b: textB });
      setResult(res.data);
    } catch (err) {
      setError("Could not reach the backend. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ label, data }) => {
    if (!data) return null;
    const pct = (data.probability_depression * 100).toFixed(2);
    const isHigh = data.probability_depression > 0.5;
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs uppercase text-slate-400 mb-1">{label}</p>
        <p className="text-sm text-slate-700 italic mb-3">"{data.text}"</p>
        <p className={`text-3xl font-bold ${isHigh ? "text-rose-600" : "text-emerald-600"}`}>
          {pct}%
        </p>
        <p className="text-xs text-slate-500">probability of "Depression"</p>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <GitCompareArrows className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">Bias Probe Lab</h1>
      </div>
      <p className="text-slate-500 mb-6">
        Compare two sentences side-by-side to probe how small wording changes affect the model's
        prediction — the same method used to uncover the "lost interest" lexical bias.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="text-xs font-semibold text-slate-500 uppercase">Sentence A</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="text-xs font-semibold text-slate-500 uppercase">Sentence B</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading || !textA.trim() || !textB.trim()}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Comparing...
          </>
        ) : (
          "Run Comparison"
        )}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <ResultCard label="Sentence A" data={result.result_a} />
          <ResultCard label="Sentence B" data={result.result_b} />
        </div>
      )}
    </div>
  );
}
