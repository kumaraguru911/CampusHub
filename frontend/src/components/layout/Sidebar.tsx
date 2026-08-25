import {
  LayoutDashboard,
  Building2,
  Monitor,
  Activity,
  Bell,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Buildings",
    icon: Building2,
    path: "/buildings",
  },
  {
    name: "Assets",
    icon: Monitor,
    path: "/assets",
  },
  {
    name: "Monitoring",
    icon: Activity,
    path: "#",
  },
  {
    name: "Alerts",
    icon: Bell,
    path: "#",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "#",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            CampusHub
          </h1>

          <p className="text-xs text-slate-500">
            Infrastructure Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          // Pages that haven't been implemented yet
          if (item.path === "#") {
            return (
              <button
                key={item.name}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-black text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}