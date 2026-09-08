import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { BarChart3, Download, FileText, ShieldCheck, TrendingUp, Truck, Route, Users, Wrench, RefreshCw } from "lucide-react";
import { getVehicles } from "@/services/vehicleService";
import { getDrivers, type Driver } from "@/services/driverService";
import { tripService, type Trip } from "@/services/tripService";
import { fuelService, type FuelRecord } from "@/services/fuelService";
import { maintenanceService, type MaintenanceRecord } from "@/services/maintenanceService";

const periodDays = { "7 days": 7, "30 days": 30, "90 days": 90 } as const;
type Period = keyof typeof periodDays;

type ReportData = {
  vehicles: Awaited<ReturnType<typeof getVehicles>>;
  drivers: Driver[];
  trips: Trip[];
  fuel: FuelRecord[];
  maintenance: MaintenanceRecord[];
};

function dateCutoff(days: number) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return cutoff;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("30 days");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [vehicles, drivers, trips, fuel, maintenance] = await Promise.all([
        getVehicles(),
        getDrivers(),
        tripService.list(),
        fuelService.list(),
        maintenanceService.list(),
      ]);
      setData({ vehicles, drivers, trips, fuel, maintenance });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const report = useMemo(() => {
    if (!data) return null;
    const cutoff = dateCutoff(periodDays[period]);
    const inPeriod = (value: string) => new Date(`${value}T00:00:00`) >= cutoff;
    const trips = data.trips.filter((trip) => inPeriod(trip.trip_date));
    const fuel = data.fuel.filter((record) => inPeriod(record.fuel_date));
    const maintenance = data.maintenance.filter((record) => inPeriod(record.service_date));
    const activeVehicles = data.vehicles.filter((vehicle) => vehicle.status !== "Retired");
    const availableVehicles = data.vehicles.filter((vehicle) => vehicle.status === "Available");
    const safetyAverage = data.drivers.length ? data.drivers.reduce((sum, driver) => sum + driver.safety, 0) / data.drivers.length : 0;

    const buckets = Array.from({ length: 12 }, (_, index) => {
      const start = new Date(cutoff);
      start.setDate(cutoff.getDate() + Math.floor(index * periodDays[period] / 12));
      const end = new Date(cutoff);
      end.setDate(cutoff.getDate() + Math.floor((index + 1) * periodDays[period] / 12));
      return trips.filter((trip) => { const date = new Date(`${trip.trip_date}T00:00:00`); return date >= start && date < end; }).length;
    });
    const maxBucket = Math.max(...buckets, 1);

    return {
      stats: [
        { title: "Total Vehicles", value: data.vehicles.length, icon: Truck },
        { title: "Active Trips", value: data.trips.filter((trip) => trip.status === "Active").length, icon: Route },
        { title: "Drivers Available", value: data.drivers.filter((driver) => driver.status === "Available").length, icon: Users },
        { title: "Maintenance Due", value: data.maintenance.filter((record) => record.status === "Scheduled" || record.status === "In Progress").length, icon: Wrench },
      ],
      activeVehicles: activeVehicles.length,
      availableVehicles: availableVehicles.length,
      utilization: activeVehicles.length ? Math.round(((activeVehicles.length - availableVehicles.length) / activeVehicles.length) * 100) : 0,
      safetyAverage: Math.round(safetyAverage),
      periodTrips: trips.length,
      periodFuelCost: fuel.reduce((sum, record) => sum + record.cost, 0),
      periodFuelLitres: fuel.reduce((sum, record) => sum + record.liters, 0),
      periodMaintenanceCost: maintenance.reduce((sum, record) => sum + record.cost, 0),
      buckets,
      maxBucket,
    };
  }, [data, period]);

  function exportReport() {
    if (!report) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Vehicles", String(report.stats[0].value)],
      ["Active Trips", String(report.stats[1].value)],
      ["Drivers Available", String(report.stats[2].value)],
      ["Maintenance Due", String(report.stats[3].value)],
      [`Trips in ${period}`, String(report.periodTrips)],
      [`Fuel Cost in ${period}",`, String(report.periodFuelCost)],
      [`Fuel Litres in ${period}`, String(report.periodFuelLitres)],
      [`Maintenance Cost in ${period}`, String(report.periodMaintenanceCost)],
      ["Fleet Utilization", `${report.utilization}%`],
      ["Average Driver Safety", `${report.safetyAverage}%`],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transpilot-report-${period.replace(" ", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <AppShell><div className="space-y-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-indigo-600">Performance intelligence</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1><p className="mt-2 text-sm text-slate-500">Live operational metrics calculated from your fleet records.</p></div><div className="flex gap-3"><select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none"><option>7 days</option><option>30 days</option><option>90 days</option></select><button onClick={exportReport} disabled={!report || loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><Download size={17} /> Export CSV</button></div></div>
    {error && <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button></div>}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{(report?.stats ?? [{ title: "Total Vehicles", value: 0, icon: Truck }, { title: "Active Trips", value: 0, icon: Route }, { title: "Drivers Available", value: 0, icon: Users }, { title: "Maintenance Due", value: 0, icon: Wrench }]).map(({ title, value, icon: Icon }) => <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{title}</p><div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon size={19} /></div></div><p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{loading ? "—" : value}</p><p className="mt-1 text-xs text-slate-400">Current live snapshot</p></div>)}</div>
    {report && <div className="grid gap-6 lg:grid-cols-5"><section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm lg:col-span-3"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Trip activity</p><h2 className="mt-1 text-xl font-bold text-slate-900">Operations over {period}</h2><p className="mt-1 text-sm text-slate-500">Number of trips recorded in each period segment.</p></div><BarChart3 className="text-indigo-600" /></div><div className="mt-8 flex h-64 items-end gap-2 rounded-2xl bg-slate-50 p-6">{report.buckets.map((value, index) => <div key={index} className="group flex h-full flex-1 items-end"><div className="w-full rounded-t-lg bg-indigo-500 transition hover:bg-indigo-700" style={{ height: `${Math.max(4, (value / report.maxBucket) * 100)}%` }} title={`${value} trips`} /></div>)}</div></section><section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><div><h2 className="font-bold text-slate-900">Fleet health</h2><p className="text-sm text-slate-500">Current safety and utilization indicators</p></div></div><div className="mt-8 space-y-6"><div><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-600">Fleet Utilization</span><b>{report.utilization}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${report.utilization}%` }} /></div></div><div><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-600">Driver Safety</span><b>{report.safetyAverage}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${report.safetyAverage}%` }} /></div></div><div className="rounded-2xl bg-indigo-50 p-5"><div className="flex gap-3"><TrendingUp className="text-indigo-600" size={20} /><div><p className="text-sm font-semibold text-indigo-900">Period summary</p><p className="mt-1 text-xs leading-5 text-indigo-700">{report.periodTrips} trips, {report.periodFuelLitres.toLocaleString("en-IN")} L of fuel and ₹{report.periodMaintenanceCost.toLocaleString("en-IN")} in maintenance were recorded in the selected period.</p></div></div></div></div></section></div>}
    {loading && <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500"><RefreshCw className="mx-auto animate-spin text-indigo-600" size={20} /><p className="mt-3">Loading live report data…</p></div>}
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm"><FileText size={18} className="text-indigo-600" /> Reports use live vehicle, driver, trip, fuel and maintenance records. Export the selected period as CSV.</div>
  </div></AppShell>;
}
