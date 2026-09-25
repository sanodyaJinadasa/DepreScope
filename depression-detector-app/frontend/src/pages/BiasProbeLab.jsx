import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { FlaskConical, Plus, Trash2, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8000";

const COLORS = { normal: "#10b981", depression: "#f43f5e" };

const DEFAULT_PROBE_SET = [
  "I lost interest in everything.",
  "I have a lot of interest in everything.",
  "I lost my job and my friends.",
  "I feel hopeless and empty inside.",
];

function ProbeBar({ label, value }) {
  const pct = (value * 100).toFixed(2);
  return (
    <div className="flex items-center gap-3">
      <div className="w-56 shrink-0 text-sm text-slate-700 truncate" title={label}>
        {label}
      </div>
      <div className="flex-1 h-6 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: value > 0.5 ? COLORS.depression : COLORS.normal,
          }}
        />
      </div>
      <div className="w-16 text-right text-sm font-medium text-slate-700">
        {pct}%
      </div>
    </div>
  );
}

export default function BiasProbeLab() {
  // --- existing A/B sentence comparison ---
  const [sentenceA, setSentenceA] = useState("I lost interest in everything.");
  const [sentenceB, setSentenceB] = useState("I lost my job and my friends.");
  const [abResult, setAbResult] = useState(null);
  const [abLoading, setAbLoading] = useState(false);

  // --- new: multi-sentence probe set, editable ---
  const [probeSet, setProbeSet] = useState(DEFAULT_PROBE_SET);
  const [probeResults, setProbeResults] = useState(null);
  const [probeLoading, setProbeLoading] = useState(false);
  const [newSentence, setNewSentence] = useState("");

  async function runComparison() {
    setAbLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        axios.post(`${API_URL}/predict`, { text: sentenceA }),
        axios.post(`${API_URL}/predict`, { text: sentenceB }),
      ]);
      setAbResult({
        a: resA.data.probability_depression,
        b: resB.data.probability_depression,
      });
    } catch (e) {
      setAbResult({ error: true });
    } finally {
      setAbLoading(false);
    }
  }

  async function runProbeSet() {
    setProbeLoading(true);
    try {
      const results = await Promise.all(
        probeSet.map((s) =>
          axios
            .post(`${API_URL}/predict`, { text: s })
            .then((r) => ({ sentence: s, prob: r.data.probability_depression }))
        )
      );
      setProbeResults(results);
    } catch (e) {
      setProbeResults(null);
    } finally {
      setProbeLoading(false);
    }
  }

  function addSentence() {
    if (!newSentence.trim()) return;
    setProbeSet([...probeSet, newSentence.trim()]);
    setNewSentence("");
  }

  function removeSentence(i) {
    setProbeSet(probeSet.filter((_, idx) => idx !== i));
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Bias Probe Lab</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Compare wording variations side-by-side, or run a full probe set —
          the same method used to uncover the "lost interest" lexical bias.
        </p>
      </div>

      {/* A/B comparison (existing feature) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          A / B Sentence Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Sentence A</label>
            <textarea
              value={sentenceA}
              onChange={(e) => setSentenceA(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Sentence B</label>
            <textarea
              value={sentenceB}
              onChange={(e) => setSentenceB(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
        </div>
        <button
          onClick={runComparison}
          disabled={abLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {abLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Run Comparison
        </button>

        {abResult && !abResult.error && (
          <div className="mt-5 space-y-3">
            <ProbeBar label="Sentence A" value={abResult.a} />
            <ProbeBar label="Sentence B" value={abResult.b} />
            <p className="text-xs text-slate-500">
              Confidence shift:{" "}
              <span className="font-semibold text-slate-800">
                {(Math.abs(abResult.a - abResult.b) * 100).toFixed(2)} percentage points
              </span>{" "}
              from this single wording change.
            </p>
          </div>
        )}
        {abResult?.error && (
          <p className="mt-4 text-sm text-rose-600">
            Couldn't reach the prediction API — check the backend is running.
          </p>
        )}
      </div>

      {/* Multi-sentence probe set (new) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Probe Set
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Build a set of controlled variations and see every prediction at
          once — useful for reproducing the full probing table from Section 5.3.
        </p>

        <div className="space-y-2 mb-4">
          {probeSet.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-slate-700 rounded-lg border border-slate-200 px-3 py-2">
                {s}
              </span>
              <button
                onClick={() => removeSentence(i)}
                className="text-slate-400 hover:text-rose-600"
                aria-label="Remove sentence"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={newSentence}
            onChange={(e) => setNewSentence(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSentence()}
            placeholder="Add a test sentence…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addSentence}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <button
          onClick={runProbeSet}
          disabled={probeLoading || probeSet.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {probeLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Run Probe Set ({probeSet.length})
        </button>

        {probeResults && (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={Math.max(200, probeResults.length * 50)}>
              <BarChart
                data={probeResults.map((r) => ({
                  sentence: r.sentence.length > 28 ? r.sentence.slice(0, 28) + "…" : r.sentence,
                  probability: r.prob,
                }))}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 12 }} />
                <YAxis dataKey="sentence" type="category" width={220} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${(v * 100).toFixed(2)}%`} />
                <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                  {probeResults.map((r, i) => (
                    <Cell key={i} fill={r.prob > 0.5 ? COLORS.depression : COLORS.normal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
