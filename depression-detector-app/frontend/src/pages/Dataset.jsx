import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Database, Layers, MessageSquare, BookOpen, Activity } from "lucide-react";

const API_URL = "http://localhost:8000";

const COLORS = {
  normal: "#10b981",     // emerald green
  depression: "#f43f5e", // rose red
  neutral: "#6366f1",    // indigo
  slate: "#64748b",      // slate
};

// Exact numbers from the research notebook (Part 0, Part 3 & Part H)
const EXACT_DATASET_DATA = {
  totalRawPosts: 2470778,
  totalCleanedPosts: 2465488,
  classBalance: [
    { name: "Normal (Class 0)", value: 80.52, count: 1984473 },
    { name: "Depression (Class 1)", value: 19.48, count: 481015 },
  ],
  splitSizes: [
    { split: "Train Set (70%)", rows: 1725238, normal: 1389130, depression: 336108 },
    { split: "Validation Set (15%)", rows: 369694, normal: 297671, depression: 72023 },
    { split: "Test Set (15%)", rows: 369695, normal: 297672, depression: 72023 },
  ],
  subreddits: [
    { name: "r/teenagers", count: 1956488, type: "Control (Normal)" },
    { name: "r/depression", count: 290049, type: "Depression" },
    { name: "r/SuicideWatch", count: 190362, type: "Depression" },
    { name: "r/happy", count: 24609, type: "Control (Normal)" },
    { name: "r/DeepThoughts", count: 9163, type: "Control (Normal)" },
  ],
  textLengthComparison: [
    { metric: "Median Characters", Normal: 117, Depression: 628 },
    { metric: "Mean Characters", Normal: 274, Depression: 991 },
    { metric: "Median Words", Normal: 23, Depression: 122 },
    { metric: "Mean Words", Normal: 52, Depression: 192 },
  ],
  topFeaturesDepression: [
    { word: "depression", weight: 5.73 },
    { word: "suicidal", weight: 4.79 },
    { word: "suicide", weight: 4.77 },
    { word: "depressed", weight: 4.50 },
    { word: "psychiatrist", weight: 3.75 },
    { word: "antidepressant", weight: 3.32 },
    { word: "miserable", weight: 3.06 },
    { word: "hopeless", weight: 3.04 },
    { word: "zoloft", weight: 2.91 },
    { word: "kill myself", weight: 2.87 },
    { word: "depressive", weight: 2.84 },
    { word: "feel", weight: 2.76 },
  ],
  topFeaturesNormal: [
    { word: "teenagers", weight: 7.83 },
    { word: "rant", weight: 4.47 },
    { word: "crush", weight: 4.37 },
    { word: "my ted", weight: 3.92 },
    { word: "minecraft", weight: 3.83 },
    { word: "discord", weight: 3.66 },
    { word: "yall", weight: 3.54 },
    { word: "meme", weight: 3.51 },
    { word: "boys", weight: 3.36 },
    { word: "teens", weight: 3.21 },
    { word: "school", weight: 2.84 },
    { word: "tiktok", weight: 2.73 },
  ],
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Dataset() {
  const [data, setData] = useState(EXACT_DATASET_DATA);

  useEffect(() => {
    axios
      .get(`${API_URL}/dataset-stats`)
      .then((res) => {
        if (res.data) {
          setData((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {
        // Fallback already preloaded with exact notebook values
      });
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dataset Analysis</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Verified corpus composition and distribution from the 2.47M Reddit Depression Dataset.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Cleaned Posts"
          value="2,465,488"
          sub="2.47M raw records after deduplication"
        />
        <StatCard
          label="Class Ratio"
          value="80.52% / 19.48%"
          sub="Normal (1.98M) vs. Depression (481K)"
        />
        <StatCard
          label="Stratified Split"
          value="70% / 15% / 15%"
          sub="Train: 1.72M | Val: 369K | Test: 369K"
        />
        <StatCard
          label="Median Post Length"
          value="628 vs. 117 chars"
          sub="Depression posts are ~5.4x longer"
        />
      </div>

      {/* Primary Graphs Row: Class Balance & Split Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Class Distribution (Cleaned Corpus)"
          description="80.52% Normal control submissions versus 19.48% authentic Depression community submissions."
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.classBalance}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                label={({ name, value }) => `${name.split(" ")[0]}: ${value}%`}
              >
                <Cell fill={COLORS.normal} />
                <Cell fill={COLORS.depression} />
              </Pie>
              <Tooltip formatter={(v, name, item) => [`${v}% (${item.payload.count.toLocaleString()} posts)`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Stratified Train / Validation / Test Splits"
          description="Exact 80.52% : 19.48% class preservation across all three training partitions."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.splitSizes} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="split" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => v.toLocaleString() + " posts"} />
              <Legend />
              <Bar dataKey="normal" name="Normal (0)" fill={COLORS.normal} stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="depression" name="Depression (1)" fill={COLORS.depression} stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Secondary Graphs Row: Text Length & Top Subreddits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Text Length & Word Count Comparison"
          description="Depression posts exhibit substantially higher word and character counts (self-narratives)."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.textLengthComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Normal" fill={COLORS.normal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Depression" fill={COLORS.depression} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Subreddit Post Breakdown"
          description="Corpus counts across primary mental health and control subreddit sources."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.subreddits} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={95} />
              <Tooltip formatter={(v, n, item) => [`${v.toLocaleString()} posts`, item.payload.type]} />
              <Bar dataKey="count" fill={COLORS.neutral} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Tertiary Row: Top Feature Words (LinearSVC Weights from Part H.12) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Top Depression Features (Class 1 Weights)"
          description="Tokens with the highest positive SVM coefficients driving depression classifications."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.topFeaturesDepression} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="word" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => [`Coefficient: +${v}`, "Feature Weight"]} />
              <Bar dataKey="weight" fill={COLORS.depression} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Top Normal / Control Features (Class 0 Weights)"
          description="Tokens with the highest negative SVM coefficients driving normal classifications."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.topFeaturesNormal} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 8.5]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="word" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => [`Coefficient: -${v}`, "Feature Weight"]} />
              <Bar dataKey="weight" fill={COLORS.normal} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
