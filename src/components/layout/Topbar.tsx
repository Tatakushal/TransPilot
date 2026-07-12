import { Bell, Search, Settings, UserCircle2 } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold">Good Afternoon, Kushal 👋</h1>

        <p className="mt-1 text-sm text-slate-500">
          Your fleet is operating efficiently today.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            placeholder="Search..."
            className="w-72 rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="relative cursor-pointer">
          <Bell size={22} />

          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </div>

        <Settings size={22} className="cursor-pointer" />

        <UserCircle2 size={34} className="cursor-pointer text-indigo-600" />
      </div>
    </header>
  );
}
