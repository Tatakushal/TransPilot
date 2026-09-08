import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, RefreshCw } from "lucide-react";
import { maintenanceService, type MaintenanceRecord } from "@/services/maintenanceService";

export default function MaintenanceAlerts() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    maintenanceService.list().then((next) => { if (active) setRecords(next); }).catch(() => { /* dashboard can still render without alerts */ }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const alerts = useMemo(() => {
    const now = new Date();
    return records.filter((record) => record.status === "Scheduled" || record.status === "In Progress").map((record) => {
      const serviceDate = new Date(`${record.service_date}T00:00:00`);
      const overdue = serviceDate < now && record.status === "Scheduled";
      return { ...record, priority: overdue || record.status === "In Progress" ? "High" : "Medium" as "High" | "Medium" };
    }).slice(0, 4);
  }, [records]);

  return <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Maintenance</h2><p className="mt-1 text-sm text-slate-500">Upcoming service alerts from live records</p></div><div className="rounded-2xl bg-orange-100 p-3"><Wrench className="text-orange-600" size={22} /></div></div><div className="mt-8 space-y-5">{loading ? <div className="flex items-center justify-center py-8 text-sm text-slate-400"><RefreshCw className="mr-2 animate-spin" size={16} />Checking maintenance…</div> : alerts.length === 0 ? <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-medium text-emerald-700">No scheduled maintenance alerts.</div> : alerts.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"><div><p className="font-semibold">{item.vehicle_registration}</p><p className="mt-1 text-sm text-slate-500">{item.service_type} · {item.service_date}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.priority === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{item.priority}</span></div>)}</div></motion.div>;
}
