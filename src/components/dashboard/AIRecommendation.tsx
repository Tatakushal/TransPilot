import { useEffect, useMemo, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import AIReportModal from "./AIReportModal";
import { getDashboardKPIs, type DashboardKPIs } from "@/services/dashboard";
import { getDrivers, type Driver } from "@/services/driverService";
import { maintenanceService, type MaintenanceRecord } from "@/services/maintenanceService";

export default function AIRecommendation() {
  const [open, setOpen] = useState(false);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardKPIs(), getDrivers(), maintenanceService.list()]).then(([nextKpis, nextDrivers, nextMaintenance]) => {
      if (!active) return;
      setKpis(nextKpis); setDrivers(nextDrivers); setMaintenance(nextMaintenance);
    }).catch(() => { /* dashboard KPIs remain the primary source */ }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const insights = useMemo(() => {
    if (!kpis) return [];
    const due = maintenance.filter((record) => record.status === "Scheduled" || record.status === "In Progress").length;
    const lowestSafety = drivers.length ? [...drivers].sort((a, b) => a.safety - b.safety)[0] : null;
    return [
      due > 0 ? `${due} vehicle${due === 1 ? " requires" : "s require"} scheduled or in-progress maintenance.` : "No scheduled maintenance is currently due.",
      lowestSafety && lowestSafety.safety < 70 ? `${lowestSafety.name} has a safety score of ${lowestSafety.safety}%; review the driver's compliance before the next assignment.` : drivers.length ? `Driver safety is healthy; the fleet average is ${Math.round(drivers.reduce((sum, driver) => sum + driver.safety, 0) / drivers.length)}%.` : "Add driver records to unlock safety insights.",
      kpis.pending_trips > 0 ? `${kpis.pending_trips} trip${kpis.pending_trips === 1 ? " is" : "s are"} pending; use available vehicles and drivers to reduce idle capacity.` : "There are no pending trips right now.",
    ];
  }, [drivers, kpis, maintenance]);

  return <><div className="mb-8 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl"><div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-3xl"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-white/20 p-3"><Sparkles size={22} /></div><div><p className="text-sm uppercase tracking-widest text-indigo-100">Smart Recommendations</p><h2 className="text-2xl font-bold sm:text-3xl">Fleet Intelligence Summary</h2></div></div><div className="space-y-3 text-base sm:text-lg">{loading ? <p className="flex items-center gap-2 text-indigo-100"><RefreshCw className="animate-spin" size={18} />Analyzing live fleet records…</p> : insights.map((insight) => <p key={insight}>• {insight}</p>)}</div></div><button type="button" onClick={() => setOpen(true)} disabled={loading || !kpis} className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-indigo-700 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60">Generate Report <ArrowRight size={18} /></button></div></div><AIReportModal open={open} onClose={() => setOpen(false)} kpis={kpis} drivers={drivers} maintenance={maintenance} /></>;
}
