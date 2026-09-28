import { useState } from "react";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function Predict() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_URL}/predict`, { text });
      setResult(res.data);
    } catch (err) {
      setError("Could not reach the backend. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">Predict</h1>
      </div>
      <p className="text-slate-500 mb-6">
        Enter a social-media-style post to classify and explain using the fine-tuned DistilBERT model.
      </p>

      {/* <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-6">
        <strong>Research prototype.</strong> This is not a diagnostic tool and should not be used to
        self-diagnose or diagnose others.
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Input Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Type or paste a post here..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Right: Result */}
        <div className="bg-slate-950 rounded-xl p-6 text-slate-200 min-h-[300px] flex flex-col">
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <Sparkles className="w-10 h-10 mb-3 text-slate-700" />
              <p className="font-medium text-slate-300">Awaiting Input</p>
              <p className="text-sm mt-1">Run a prediction to see the result and explanation here.</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          )}

          {result && (
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${result.label === "Depression-like"
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-emerald-500/20 text-emerald-300"
                  }`}
              >
                {result.label}
              </span>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Normal</span>
                  <span>{(result.probability_normal * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{ width: `${result.probability_normal * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <span className="text-slate-400">Depression-like</span>
                  <span>{(result.probability_depression * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-rose-400 h-2 rounded-full"
                    style={{ width: `${result.probability_depression * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase text-slate-500 mb-2">SHAP Explanation</p>
                <div
                  className="bg-white text-black rounded-lg p-3 text-sm overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: result.shap_html }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
