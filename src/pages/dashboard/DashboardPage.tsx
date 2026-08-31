import AppShell from "@/components/layout/AppShell";
import KpiCard from "@/components/dashboard/KpiCard";
import VehicleStatus from "@/components/dashboard/VehicleStatus";
import RecentTrips from "@/components/dashboard/RecentTrips";
import MaintenanceAlerts from "@/components/dashboard/MaintanenceAlerts";
import DriverAlerts from "@/components/dashboard/DriverAlerts";
import FleetStatus from "@/components/dashboard/FleetStatus";
import FleetChart from "@/components/dashboard/FleetChart";
import AIRecommendation from "@/components/dashboard/AIRecommendation";
import { useEffect, useState } from "react";
import { getDashboardKPIs } from "@/services/dashboard";
import { Truck, Route, Users, BarChart3, RefreshCw, AlertTriangle, Zap } from "lucide-react";

interface DashboardKPIs { active_vehicles: number; available_vehicles: number; vehicles_in_maintenance: number; active_trips: number; pending_trips: number; drivers_on_duty: number; fleet_utilization_percent: number; }

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  async function loadDashboard() { try { setLoading(true); setError(""); const data = await getDashboardKPIs(); setKpis(data); setLastUpdated(new Date()); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load dashboard data."); } finally { setLoading(false); } }
  useEffect(() => { loadDashboard(); }, []);
  if (loading && !kpis) return <AppShell><div className="flex min-h-[65vh] items-center justify-center"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50"><RefreshCw size={24} className="animate-spin text-indigo-600"/></div><p className="mt-5 font-semibold text-slate-800">Loading fleet intelligence</p><p className="mt-1 text-sm text-slate-400">Connecting to your live operations data...</p></div></div></AppShell>;
  if (error && !kpis) return <AppShell><div className="flex min-h-[65vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-red-100 bg-white p-9 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50"><AlertTriangle className="text-red-500" size={25}/></div><h2 className="mt-5 text-xl font-bold text-slate-900">Dashboard unavailable</h2><p className="mt-2 text-sm leading-6 text-slate-500">{error}</p><button onClick={loadDashboard} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><RefreshCw size={16}/> Try again</button></div></div></AppShell>;
  if (!kpis) return null;
  const cards = [
    { title: "Active Vehicles", value: String(kpis.active_vehicles), change: `${kpis.available_vehicles} available`, icon: Truck, accent: "indigo" },
    { title: "Trips Running", value: String(kpis.active_trips), change: `${kpis.pending_trips} pending`, icon: Route, accent: "sky" },
    { title: "Drivers On Duty", value: String(kpis.drivers_on_duty), change: "Currently on duty", icon: Users, accent: "violet" },
    { title: "Fleet Utilization", value: `${kpis.fleet_utilization_percent}%`, change: `${kpis.vehicles_in_maintenance} in maintenance`, icon: BarChart3, accent: "emerald" },
  ];
  return <AppShell><div className="space-y-7 pb-8">
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 px-7 py-7 text-white shadow-xl sm:px-9 sm:py-8"><div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"/><div className="absolute bottom-[-100px] right-1/3 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl"/><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10"><Zap size={14}/> Fleet command center</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good to see you back.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Monitor your fleet, spot operational risks and keep every trip moving from one place.</p></div><div className="flex items-center gap-3"><span className="hidden text-xs text-slate-300 sm:block">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}` : ""}</span><button onClick={loadDashboard} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur hover:bg-white/15 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh</button></div></div></div>
    {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Live refresh failed. Showing your last available dashboard data.</div>}
    <AIRecommendation />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <KpiCard key={card.title} title={card.title} value={card.value} change={card.change} icon={card.icon} />)}</div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12"><div className="xl:col-span-8"><FleetChart /></div><div className="xl:col-span-4"><VehicleStatus active={kpis.active_vehicles} available={kpis.available_vehicles} maintenance={kpis.vehicles_in_maintenance}/></div></div>
    <FleetStatus /><RecentTrips /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><MaintenanceAlerts/><DriverAlerts/></div>
  </div></AppShell>;
}
