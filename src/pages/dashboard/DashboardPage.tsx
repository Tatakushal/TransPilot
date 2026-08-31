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
import { Truck, Route, Users, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";

interface DashboardKPIs {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization_percent: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardKPIs();
      setKpis(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !kpis) {
    return <AppShell><div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" /><p className="mt-4 text-sm font-medium text-slate-500">Loading fleet intelligence...</p></div></div></AppShell>;
  }

  if (error && !kpis) {
    return <AppShell><div className="flex min-h-[60vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto text-red-500" size={32} /><h2 className="mt-4 text-xl font-bold text-slate-900">Dashboard unavailable</h2><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={loadDashboard} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><RefreshCw size={16} /> Try again</button></div></div></AppShell>;
  }

  if (!kpis) return null;

  const cards = [
    { title: "Active Vehicles", value: kpis.active_vehicles, change: `${kpis.available_vehicles} available`, icon: Truck },
    { title: "Trips Running", value: kpis.active_trips, change: `${kpis.pending_trips} pending`, icon: Route },
    { title: "Drivers On Duty", value: kpis.drivers_on_duty, change: "Currently on duty", icon: Users },
    { title: "Fleet Utilization", value: `${kpis.fleet_utilization_percent}%`, change: `${kpis.vehicles_in_maintenance} in maintenance`, icon: BarChart3 },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold text-indigo-600">Fleet command center</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1><p className="mt-2 text-sm text-slate-500">A live view of your fleet operations and performance.</p></div>
          <div className="flex items-center gap-3"><span className="text-xs text-slate-400">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</span><button onClick={loadDashboard} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button></div>
        </div>

        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Some live dashboard data could not be refreshed. Showing the last available values.</div>}
        <AIRecommendation />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => <KpiCard key={card.title} title={card.title} value={String(card.value)} change={card.change} icon={card.icon} />)}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8"><FleetChart /></div>
          <div className="xl:col-span-4"><VehicleStatus /></div>
        </div>

        <FleetStatus />
        <RecentTrips />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><MaintenanceAlerts /><DriverAlerts /></div>
      </div>
    </AppShell>
  );
}
