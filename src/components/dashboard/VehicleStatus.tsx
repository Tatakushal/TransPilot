import { Truck, Wrench, Route, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface Props { active: number; available: number; maintenance: number; }

export default function VehicleStatus({ active, available, maintenance }: Props) {
  const total = Math.max(active + available + maintenance, 1);
  const items = [
    { label: "Available", value: available, icon: Truck, bar: "bg-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "On Trip", value: active, icon: Route, bar: "bg-indigo-500", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Maintenance", value: maintenance, icon: Wrench, bar: "bg-amber-500", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ];
  const healthy = Math.round(((total - maintenance) / total) * 100);

  return <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-lg">
    <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-900">Vehicle Status</h2><p className="mt-1 text-sm text-slate-500">Live fleet availability</p></div><div className="rounded-xl bg-indigo-50 p-2.5"><Activity size={18} className="text-indigo-600" /></div></div>
    <div className="mt-8 space-y-7">{items.map(({ label, value, icon: Icon, bar, iconBg, iconColor }) => <div key={label}><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}><Icon size={18} className={iconColor}/></div><div><p className="font-semibold text-slate-800">{label}</p><p className="text-xs text-slate-500">{value} vehicles</p></div></div><span className="text-lg font-bold text-slate-900">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${Math.min((value / total) * 100, 100)}%` }}/></div></div>)}</div>
    <div className="mt-9 flex items-center justify-between rounded-2xl bg-slate-50 p-5"><div><p className="text-sm text-slate-500">Fleet health</p><p className="mt-1 text-xs text-slate-400">Based on maintenance status</p></div><div className="text-right"><p className="text-3xl font-bold text-slate-900">{healthy}%</p><p className="text-xs font-semibold text-emerald-600">Operational</p></div></div>
  </motion.div>;
}
