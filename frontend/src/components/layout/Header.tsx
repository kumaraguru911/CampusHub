import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="relative w-80">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search infrastructure..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-500">
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            K
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Administrator
            </p>
            <p className="text-xs text-slate-500">
              Infrastructure Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}