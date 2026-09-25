import { ShieldAlert, Tags, Users, Database, Scale } from "lucide-react";

const LIMITATIONS = [
  {
    icon: Tags,
    title: "Label validity",
    body:
      "Labels come from subreddit membership, not clinical diagnosis. Posts may be sarcastic, fictional, or otherwise mislabeled relative to the poster's actual mental state.",
  },
  {
    icon: ShieldAlert,
    title: "Lexical shortcut bias",
    body:
      "The model can be misled by individual high-impact tokens (e.g. \"interest\") rather than full compositional meaning — demonstrated directly in the Bias Probe Lab.",
  },
  {
    icon: Users,
    title: "User-level leakage",
    body:
      "The dataset has no author identifiers, so the same person appearing in both train and test via different posts could not be measured directly. Exact-duplicate removal is only a partial mitigation.",
  },
  {
    icon: Database,
    title: "Sampling constraints",
    body:
      "Transformer training and evaluation used stratified subsets (200K / 20K / 20K) rather than the full 2.47M-row dataset, due to compute limits on Google Colab.",
  },
  {
    icon: Scale,
    title: "Not a clinical tool",
    body:
      "This system is a research and interpretability study. It is not validated for, and must not be used for, real-world screening, self-diagnosis, or clinical decision-making.",
  },
];

export default function Limitations() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Limitations</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          High aggregate accuracy can coexist with systematic, symptom-specific
          blind spots. These are the known limitations of this system, documented
          openly rather than left implicit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIMITATIONS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-indigo-50 p-2">
                <Icon className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Research prototype.</span> This
          system is explicitly positioned as a research and interpretability
          study, not a diagnostic or clinical tool.
        </p>
      </div>
    </div>
  );
}
