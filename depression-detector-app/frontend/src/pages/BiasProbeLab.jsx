import { useState } from "react";
import axios from "axios";
import { FlaskConical, Loader2, ArrowRightLeft, Sparkles, AlertCircle } from "lucide-react";

const API_URL = "http://localhost:8000";

const PRESET_PAIRS = [
  {
    title: "Lexical Shortcut: 'Interest'",
    description: "Testing whether the single token 'interest' artificially triggers depression classification",
    a: "I lost interest in everything.",
    b: "I lost my job and my friends.",
  },
  {
    title: "Positive vs Anhedonia",
    description: "Testing polarity with the same keyword",
    a: "I have a lot of interest in my work and hobbies.",
    b: "I have lost all interest in my work and hobbies.",
  },
  {
    title: "Situational Fatigue vs Clinical Despair",
    description: "Comparing normal physical tiredness with depressive feelings",
    a: "I am really tired after working 12 hours today.",
    b: "I feel tired of living and hopeless every day.",
  },
];

function ResultCard({ label, text, prob, isDepressed }) {
  const pct = (prob * 100).toFixed(1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isDepressed
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {isDepressed ? "Depression-like" : "Normal"}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
        "{text}"
      </p>

      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Depression Probability</span>
          <span className="font-semibold text-slate-900">{pct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDepressed ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BiasProbeLab() {
  const [sentenceA, setSentenceA] = useState("I lost interest in everything.");
  const [sentenceB, setSentenceB] = useState("I lost my job and my friends.");
  const [abResult, setAbResult] = useState(null);
  const [abLoading, setAbLoading] = useState(false);

  async function runComparison() {
    setAbLoading(true);
    setAbResult(null);
    try {
      const [resA, resB] = await Promise.all([
        axios.post(`${API_URL}/predict`, { text: sentenceA }),
        axios.post(`${API_URL}/predict`, { text: sentenceB }),
      ]);
      setAbResult({
        probA: resA.data.probability_depression,
        probB: resB.data.probability_depression,
        labelA: resA.data.label,
        labelB: resB.data.label,
      });
    } catch (e) {
      setAbResult({ error: true });
    } finally {
      setAbLoading(false);
    }
  }

  function applyPreset(pair) {
    setSentenceA(pair.a);
    setSentenceB(pair.b);
    setAbResult(null);
  }

  const shift =
    abResult && !abResult.error
      ? (Math.abs(abResult.probA - abResult.probB) * 100).toFixed(1)
      : null;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bias Probe Lab
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Controlled A/B testing to analyze lexical shortcut bias and model sensitivity to specific wording.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Case Studies */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Preset Probe Case Studies</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_PAIRS.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(pair)}
              className="text-left rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 p-3.5 transition-all group"
            >
              <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                {pair.title}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                {pair.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
            A / B Side-by-Side Comparison
          </h2>
          <span className="text-xs text-slate-400">
            Edit either sentence to test wording shifts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Sentence A</label>
              <span className="text-[11px] text-slate-400">{sentenceA.length} chars</span>
            </div>
            <textarea
              value={sentenceA}
              onChange={(e) => setSentenceA(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Enter Sentence A..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Sentence B</label>
              <span className="text-[11px] text-slate-400">{sentenceB.length} chars</span>
            </div>
            <textarea
              value={sentenceB}
              onChange={(e) => setSentenceB(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Enter Sentence B..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Both sentences are sent to the fine-tuned DistilBERT model concurrently for impartial comparison.
          </p>
          <button
            onClick={runComparison}
            disabled={abLoading || !sentenceA.trim() || !sentenceB.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {abLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Pair...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4" />
                Run Comparison
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {abResult && !abResult.error && (
          <div className="pt-4 border-t border-slate-100 space-y-5">
            {/* Shift banner */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-900">Confidence Shift</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Difference in predicted depression probability resulting strictly from phrasing variation.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-700">Δ {shift}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResultCard
                label="Sentence A Result"
                text={sentenceA}
                prob={abResult.probA}
                isDepressed={abResult.probA >= 0.5}
              />
              <ResultCard
                label="Sentence B Result"
                text={sentenceB}
                prob={abResult.probB}
                isDepressed={abResult.probB >= 0.5}
              />
            </div>
          </div>
        )}

        {abResult?.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 flex items-center gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>Could not reach the backend API at {API_URL}. Ensure uvicorn is running.</span>
          </div>
        )}
      </div>
    </div>
  );
}
