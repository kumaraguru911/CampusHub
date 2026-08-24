import {
  LayoutDashboard,
  Building2,
  Monitor,
  Activity,
  Bell,
  Settings,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Buildings",
    icon: Building2,
  },
  {
    name: "Assets",
    icon: Monitor,
  },
  {
    name: "Monitoring",
    icon: Activity,
  },
  {
    name: "Alerts",
    icon: Bell,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white">
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

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                item.name === "Dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}