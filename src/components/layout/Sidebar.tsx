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

  return <><div className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[1px] transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} aria-hidden="true" /><aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 p-2"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div><div><h1 className="text-lg font-bold tracking-tight">TransPilot</h1><p className="text-xs text-slate-500">Fleet Operations</p></div></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close navigation"><X size={20} /></button></div>
    <div className="flex-1 overflow-y-auto px-4 py-6">{menu.map((section) => { const visibleItems = section.items.filter((item) => item.roles.includes(user.role)); if (!visibleItems.length) return null; return <div key={section.title} className="mb-7"><p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{section.title}</p>{visibleItems.map((item) => { const Icon = item.icon; return <NavLink key={item.label} to={item.path} onClick={onClose} className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}><Icon size={18} />{item.label}</NavLink>; })}</div>; })}</div>
    <div className="border-t border-slate-100 bg-slate-50 p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">{user.name.split(" ").map((name) => name[0]).join("")}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p><p className="mt-1 truncate text-[11px] capitalize text-indigo-600">{user.role}</p></div></div></div>
  </aside></>;
}
