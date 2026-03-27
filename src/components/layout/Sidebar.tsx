import { NavLink } from "react-router-dom";
import { LayoutDashboard, Keyboard, Mouse, BarChart2, Settings } from "lucide-react";

const nav = [
  { to: "/",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/heatmap", icon: Keyboard,        label: "Heatmap"   },
  { to: "/mouse",   icon: Mouse,           label: "Mouse"     },
  { to: "/report",  icon: BarChart2,       label: "Reports"   },
  { to: "/settings",icon: Settings,        label: "Settings"  },
];

export function Sidebar() {
  return (
    <aside className="w-16 lg:w-52 bg-[#0d0d1a] border-r border-[#1e1e3a] flex flex-col py-4 gap-1 shrink-0">
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          <span className="hidden lg:block">{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
