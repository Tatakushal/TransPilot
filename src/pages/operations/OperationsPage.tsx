import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { getData } from "@/services/api";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Truck, Users } from "lucide-react";

type Trip = { id:number; vehicle_registration:string; driver_license:string; source:string; destination:string; status:string; trip_date:string };
type Vehicle = { registration_number:string; vehicle_name_model:string; status:string; odometer:number };
type Driver = { license_number:string; name:string; status:string; safety_score:number };

export default function OperationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [nextTrips, nextVehicles, nextDrivers] = await Promise.all([getData("trips"), getData("vehicles"), getData("drivers")]);
      setTrips(nextTrips as Trip[]); setVehicles(nextVehicles as Vehicle[]); setDrivers(nextDrivers as Driver[]);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load live operations data."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const activeTrips = useMemo(() => trips.filter((t) => t.status === "Active"), [trips]);
  const pendingTrips = useMemo(() => trips.filter((t) => t.status === "Pending"), [trips]);
  const issues = useMemo(() => [
    ...vehicles.filter((v) => v.status === "In Shop").map((v) => ({ title: "Vehicle in maintenance", detail: `${v.registration_number} · ${v.vehicle_name_model}` })),
    ...drivers.filter((d) => d.status === "Suspended").map((d) => ({ title: "Driver suspended", detail: d.name })),
  ], [vehicles, drivers]);

  return <AppShell><div className="space-y-7 pb-12">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-semibold text-indigo-600">Live operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Operations Center</h1><p className="mt-2 text-sm text-slate-500">A live view of trips, fleet availability and operational attention points.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh live data</button></div>
    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Activity} label="Active trips" value={activeTrips.length}/><Metric icon={ArrowRight} label="Pending dispatch" value={pendingTrips.length}/><Metric icon={Truck} label="Available vehicles" value={vehicles.filter((v) => v.status === "Available").length}/><Metric icon={Users} label="Available drivers" value={drivers.filter((d) => d.status === "Available").length}/></div>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="font-bold text-slate-950">Active trips</h2><p className="mt-1 text-sm text-slate-500">Current assignments from the live API.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{activeTrips.length} running</span></div><div className="divide-y divide-slate-100">{activeTrips.slice(0, 8).map((trip) => <div key={trip.id} className="px-6 py-4"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-slate-900">{trip.source} <span className="text-slate-400">→</span> {trip.destination}</p><p className="mt-1 text-xs text-slate-500">{trip.vehicle_registration} · Driver {trip.driver_license}</p></div><span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{trip.status}</span></div></div>)}{!loading && activeTrips.length === 0 && <Empty label="No active trips right now."/>}</div></section><section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-600"><AlertTriangle size={20}/></div><div><h2 className="font-bold text-slate-950">Attention required</h2><p className="text-sm text-slate-500">Items that may need operator action.</p></div></div><div className="mt-5 space-y-3">{issues.slice(0, 6).map((issue, index) => <div key={`${issue.title}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">{issue.title}</p><p className="mt-1 text-xs text-slate-500">{issue.detail}</p></div>)}{!loading && issues.length === 0 && <div className="rounded-2xl bg-emerald-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17}/> No operational issues detected</p></div>}</div></section></div>
  </div></AppShell>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label:string; value:number }) { return <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon size={18}/></span></div><p className="mt-4 text-3xl font-bold text-slate-950">{value}</p></div>; }
function Empty({ label }: { label:string }) { return <div className="px-6 py-14 text-center text-sm text-slate-500">{label}</div>; }
