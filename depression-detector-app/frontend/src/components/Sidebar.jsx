import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, GitCompareArrows, Info, Brain } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/predict", label: "Predict", icon: MessageSquareText },
  { to: "/compare", label: "Bias Probe Lab", icon: GitCompareArrows },
  { to: "/about", label: "About", icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-slate-200 min-h-screen flex flex-col border-r border-slate-800">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-slate-800">
        <Brain className="w-7 h-7 text-indigo-400" />
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">DepreScope</h1>
          <p className="text-xs text-slate-500">Explainable AI</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
        Research prototype — not a diagnostic tool.
      </div>
    </aside>
  );
}
