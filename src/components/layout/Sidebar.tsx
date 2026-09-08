import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Role = "admin" | "fleet-manager" | "dispatcher" | "safety-officer" | "financial-analyst";
type MenuItem = { icon: React.ElementType; label: string; path: string; roles: Role[] };
type MenuSection = { title: string; items: MenuItem[] };

const menu: MenuSection[] = [
  { title: "Overview", items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["admin", "fleet-manager", "dispatcher", "safety-officer", "financial-analyst"] }] },
  { title: "Fleet", items: [{ icon: Truck, label: "Vehicles", path: "/vehicles", roles: ["admin", "fleet-manager", "dispatcher"] }, { icon: Users, label: "Drivers", path: "/drivers", roles: ["admin", "fleet-manager", "dispatcher", "safety-officer"] }] },
  { title: "Operations", items: [{ icon: Route, label: "Trips", path: "/trips", roles: ["admin", "fleet-manager", "dispatcher"] }] },
  { title: "Maintenance", items: [{ icon: Wrench, label: "Maintenance", path: "/maintenance", roles: ["admin", "fleet-manager"] }] },
  { title: "Finance", items: [{ icon: Fuel, label: "Fuel", path: "/fuel", roles: ["admin", "financial-analyst"] }] },
  { title: "Analytics", items: [{ icon: BarChart3, label: "Reports", path: "/reports", roles: ["admin", "fleet-manager", "financial-analyst", "safety-officer"] }] },
  { title: "Administration", items: [{ icon: Settings, label: "Settings", path: "/settings", roles: ["admin"] }] },
];

interface Props { mobileOpen: boolean; onClose: () => void; }

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const { user } = useAuth();
  if (!user) return null;
  const initials = user.name.split(" ").filter(Boolean).map((name) => name[0]).join("").slice(0, 2).toUpperCase();

  return <>
    <div className={`fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} aria-hidden="true" />
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-5">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 p-2 ring-1 ring-indigo-400/20"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div><div><h1 className="text-lg font-bold tracking-tight">TransPilot</h1><p className="text-[11px] font-medium uppercase tracking-[.16em] text-slate-500">Fleet Control</p></div></div>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden" aria-label="Close navigation"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">{menu.map((section) => { const visibleItems = section.items.filter((item) => item.roles.includes(user.role)); if (!visibleItems.length) return null; return <div key={section.title} className="mb-6"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">{section.title}</p>{visibleItems.map((item) => { const Icon = item.icon; return <NavLink key={item.label} to={item.path} onClick={onClose} className={({ isActive }) => `group mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/15" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}><Icon size={18} className="shrink-0 transition-transform group-hover:scale-105" />{item.label}</NavLink>; })}</div>; })}</div>
      <div className="border-t border-slate-800/80 p-4"><div className="flex items-center gap-3 rounded-2xl bg-slate-900/70 p-3 ring-1 ring-white/5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-bold text-indigo-300">{initials}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p><p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-indigo-400">{user.role.replace("-", " ")}</p></div></div></div>
    </aside>
  </>;
}
