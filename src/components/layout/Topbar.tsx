import { Bell, LogOut, Search, Settings, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold">Good Afternoon, {user?.name || "there"} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Your fleet is operating efficiently today.</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden lg:block">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input placeholder="Search..." className="w-72 rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-indigo-500" aria-label="Global search" />
        </div>

        <button type="button" className="relative rounded-lg p-1 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
          <Bell size={22} />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
        </button>

        <button type="button" onClick={() => navigate("/settings")} className="rounded-lg p-1 text-slate-600 hover:bg-slate-100" aria-label="Settings">
          <Settings size={22} />
        </button>

        <div className="group relative">
          <button type="button" className="rounded-full" aria-label="Account menu">
            <UserCircle2 size={34} className="text-indigo-600" />
          </button>
          <div className="invisible absolute right-0 top-11 z-50 w-52 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
