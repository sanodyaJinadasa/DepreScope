import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Sparkles,
  FlaskConical,
  BarChart3,
  ShieldAlert,
  Info,
  AudioLines,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/predict", label: "Text Predict", icon: Sparkles },
  // { to: "/clinical-predict", label: "Voice Predict", icon: AudioLines },
  { to: "/compare", label: "Bias Probe Lab", icon: FlaskConical },
  { to: "/model-comparison", label: "Model Comparison", icon: BarChart3 },
  { to: "/limitations", label: "Limitations", icon: ShieldAlert },
  { to: "/about", label: "About", icon: Info },
];


export default function Sidebar() {
  return (
    <aside className="h-screen w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold text-slate-900">DepreScope</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Explainable Depression Detection
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
        Research prototype — not a diagnostic tool.
      </div>
    </aside>
  );
}
