import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Database, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8000";

const COLORS = {
  normal: "#10b981",     // emerald
  depression: "#f43f5e", // rose
  neutral: "#64748b",    // slate
};

// Fallback data so the page still renders something meaningful
// while the backend endpoint (/dataset-stats) is being wired up.
// Replace with a live fetch once that endpoint exists — see useEffect below.
const FALLBACK = {
  totalPosts: 2470778,
  classBalance: [
    { name: "Normal", value: 80.5 },
    { name: "Depression", value: 19.5 },
  ],
  splitSizes: [
    { split: "Train", rows: 1725238 },
    { split: "Validation", rows: 369694 },
    { split: "Test", rows: 369695 },
  ],
  postLength: [
    { bucket: "0-50", normal: 32000, depression: 9800 },
    { bucket: "50-150", normal: 61000, depression: 21000 },
    { bucket: "150-300", normal: 44000, depression: 18500 },
    { bucket: "300-600", normal: 21000, depression: 12000 },
    { bucket: "600+", normal: 8500, depression: 6100 },
  ],
  topWordsDepression: [
    { word: "feel", count: 41000 },
    { word: "anymore", count: 28500 },
    { word: "tired", count: 26200 },
    { word: "alone", count: 24100 },
    { word: "hopeless", count: 19800 },
  ],
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Dataset() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/dataset-stats`)
      .then((res) => {
        setData(res.data);
        setUsingFallback(false);
      })
      .catch(() => {
        // backend endpoint not built yet — keep fallback data
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Dataset</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Composition of the Reddit Depression Dataset used to train and
          evaluate the models — independent of model performance.
        </p>
      </div>

      {usingFallback && !loading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Showing placeholder figures — connect the{" "}
          <code className="font-mono">/dataset-stats</code> backend endpoint
          to display live numbers.
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Raw dataset size"
          value={`${(data.totalPosts / 1_000_000).toFixed(2)}M posts`}
        />
        <StatCard
          label="Class balance"
          value={`${data.classBalance[0].value}% / ${data.classBalance[1].value}%`}
          sub="Normal / Depression"
        />
        <StatCard
          label="Split ratio"
          value="70 / 15 / 15"
          sub="Train / Validation / Test"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Class Distribution"
          description="Post label balance after cleaning and deduplication."
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.classBalance}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {data.classBalance.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === "Normal"
                        ? COLORS.normal
                        : COLORS.depression
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Train / Validation / Test Split"
          description="Stratified split preserving class balance across partitions."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.splitSizes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="split" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="rows" fill={COLORS.neutral} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Post Length by Class"
          description="Character-count distribution, split by label — useful for spotting length-based artifacts."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.postLength}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="normal" name="Normal" fill={COLORS.normal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="depression" name="Depression" fill={COLORS.depression} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Most Frequent Words — Depression Class"
          description="Top tokens by raw frequency in depression-labeled posts."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topWordsDepression} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="word" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.depression} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
