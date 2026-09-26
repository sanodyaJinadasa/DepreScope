import { useState } from "react";
import axios from "axios";
import { AudioLines, Upload, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8000";

function ProbabilityBar({ label, value, tone }) {
  const pct = (value * 100).toFixed(1);
  const colors = {
    audio: "#4f46e5",
    text: "#0891b2",
    fused: value >= 0.5 ? "#f43f5e" : "#10b981",
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: colors[tone] }}
        />
      </div>
    </div>
  );
}

export default function ClinicalPredict() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!audioFile || !transcript.trim()) {
      setError("Both an audio file and a transcript are required.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("transcript", transcript);

    try {
      const res = await axios.post(`${API_URL}/multimodal/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          "Prediction failed — check the backend is running and the model file is in place."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2">
          <AudioLines className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Clinical Predict (Audio + Text)
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Fuses acoustic features and spoken content to estimate depression
          risk, trained on a 31-participant DAIC-WOZ pilot subset.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="font-semibold">Pilot study.</span> This model was
        trained on 31 of 189 available DAIC-WOZ participants (23 non-depressed,
        8 depressed) due to compute/storage constraints. Results demonstrate
        pipeline feasibility, not full-corpus clinical performance. Research
        prototype only — not a diagnostic tool.
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500">
            Audio recording (.wav)
          </label>
          <label className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-indigo-400 hover:text-indigo-600">
            <Upload className="h-4 w-4" />
            {audioFile ? audioFile.name : "Choose a .wav file…"}
            <input
              type="file"
              accept=".wav"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">
            Transcript (participant's speech only)
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            placeholder="Paste or type what the participant said…"
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            No speech-to-text is wired in yet — transcribe manually for now,
            or add a Whisper step before this call as a future enhancement.
          </p>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Analyze
        </button>
      </div>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Result</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                result.predicted_label === "Depressed"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {result.predicted_label}
            </span>
          </div>

          <ProbabilityBar
            label="Fused prediction"
            value={result.fused_probability}
            tone="fused"
          />
          <ProbabilityBar
            label={`Audio-only (weight: ${(result.fusion_weight_audio * 100).toFixed(0)}%)`}
            value={result.audio_probability}
            tone="audio"
          />
          <ProbabilityBar
            label={`Text-only (weight: ${((1 - result.fusion_weight_audio) * 100).toFixed(0)}%)`}
            value={result.text_probability}
            tone="text"
          />
        </div>
      )}
    </div>
  );
}
