import { Download, Printer, X } from "lucide-react";
import type { DashboardKPIs } from "@/services/dashboard";
import type { Driver } from "@/services/driverService";
import type { MaintenanceRecord } from "@/services/maintenanceService";

interface Props {
  open: boolean;
  onClose: () => void;
  kpis: DashboardKPIs | null;
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
}

export default function AIReportModal({ open, onClose, kpis, drivers, maintenance }: Props) {
  if (!open || !kpis) return null;

  const due = maintenance.filter((record) => record.status === "Scheduled" || record.status === "In Progress");
  const averageSafety = drivers.length ? Math.round(drivers.reduce((sum, driver) => sum + driver.safety, 0) / drivers.length) : 0;
  const lowestSafety = drivers.length ? [...drivers].sort((a, b) => a.safety - b.safety)[0] : null;
  const generatedAt = new Date().toLocaleString();

  const download = () => {
    const lines = [
      "TransPilot Fleet Intelligence Report",
      `Generated: ${generatedAt}`,
      "",
      `Active vehicles: ${kpis.active_vehicles}`,
      `Available vehicles: ${kpis.available_vehicles}`,
      `Vehicles in maintenance: ${kpis.vehicles_in_maintenance}`,
      `Active trips: ${kpis.active_trips}`,
      `Pending trips: ${kpis.pending_trips}`,
      `Drivers on duty: ${kpis.drivers_on_duty}`,
      `Fleet utilization: ${kpis.fleet_utilization_percent}%`,
      `Average driver safety: ${averageSafety}%`,
      `Maintenance items due: ${due.length}`,
      lowestSafety ? `Lowest safety score: ${lowestSafety.name} (${lowestSafety.safety}%)` : "Lowest safety score: No driver records",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transpilot-fleet-intelligence.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">TransPilot Intelligence</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Fleet Executive Report</h2><p className="mt-1 text-sm text-slate-500">Generated from your current operational records · {generatedAt}</p></div><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Print report"><Printer size={18} /></button><button type="button" onClick={download} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Download report"><Download size={18} /></button><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Close report"><X size={18} /></button></div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-indigo-50 p-5"><p className="text-sm font-semibold text-indigo-700">Fleet utilization</p><p className="mt-2 text-3xl font-bold text-indigo-950">{kpis.fleet_utilization_percent}%</p><p className="mt-1 text-sm text-indigo-700">{kpis.available_vehicles} of {kpis.active_vehicles} active vehicles are available.</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="text-sm font-semibold text-emerald-700">Driver safety</p><p className="mt-2 text-3xl font-bold text-emerald-950">{averageSafety}%</p><p className="mt-1 text-sm text-emerald-700">Average safety score across {drivers.length} driver{drivers.length === 1 ? "" : "s"}.</p></div></div>
    <div className="mt-6 space-y-5"><section><h3 className="font-semibold text-indigo-600">Fleet Health</h3><p className="mt-1 text-sm leading-6 text-slate-600">{kpis.vehicles_in_maintenance > 0 ? `${kpis.vehicles_in_maintenance} vehicle${kpis.vehicles_in_maintenance === 1 ? " is" : "s are"} currently marked in maintenance.` : "No vehicles are currently marked in maintenance."}</p></section><section><h3 className="font-semibold text-indigo-600">Operations</h3><p className="mt-1 text-sm leading-6 text-slate-600">There are {kpis.active_trips} active trip{ kpis.active_trips === 1 ? "" : "s" } and {kpis.pending_trips} pending trip{ kpis.pending_trips === 1 ? "" : "s" }. Prioritize pending work when suitable vehicles and drivers are available.</p></section><section><h3 className="font-semibold text-indigo-600">Driver Performance</h3><p className="mt-1 text-sm leading-6 text-slate-600">{lowestSafety ? `${lowestSafety.name} has the lowest recorded safety score at ${lowestSafety.safety}%. Review the profile if the score is below your operating threshold.` : "No driver records are available for safety analysis."}</p></section><section><h3 className="font-semibold text-indigo-600">Recommendations</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600"><li>{due.length ? `Review the ${due.length} scheduled or in-progress maintenance item${due.length === 1 ? "" : "s"}.` : "Keep maintenance schedules up to date to preserve vehicle availability."}</li><li>{kpis.pending_trips ? "Review pending trips and assign available capacity where appropriate." : "Keep trip records current as new work is scheduled."}</li><li>{lowestSafety && lowestSafety.safety < 70 ? `Follow up with ${lowestSafety.name} on safety compliance before assigning another trip.` : "Continue monitoring driver safety scores and license expiry dates."}</li></ul></section></div><button type="button" onClick={onClose} className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Close report</button>
  </div></div>;
}
