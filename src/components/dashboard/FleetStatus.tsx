import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { tripService, type Trip } from "@/services/tripService";
import { fuelService, type FuelRecord } from "@/services/fuelService";
import { maintenanceService, type MaintenanceRecord } from "@/services/maintenanceService";

export default function FleetStatus() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<FuelRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([tripService.list(), fuelService.list(), maintenanceService.list()]).then(([nextTrips, nextFuel, nextMaintenance]) => {
      if (!active) return;
      setTrips(nextTrips); setFuel(nextFuel); setMaintenance(nextMaintenance);
    }).catch(() => { /* optional dashboard section */ }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now); currentStart.setHours(0, 0, 0, 0); currentStart.setDate(currentStart.getDate() - 6);
    const previousStart = new Date(currentStart); previousStart.setDate(previousStart.getDate() - 7);
    const previousEnd = new Date(currentStart);
    const currentTrips = trips.filter((trip) => new Date(`${trip.trip_date}T00:00:00`) >= currentStart).length;
    const previousTrips = trips.filter((trip) => { const date = new Date(`${trip.trip_date}T00:00:00`); return date >= previousStart && date < previousEnd; }).length;
    const trend = previousTrips ? Math.round(((currentTrips - previousTrips) / previousTrips) * 100) : 0;
    const currentFuel = fuel.filter((record) => new Date(`${record.fuel_date}T00:00:00`) >= currentStart).reduce((sum, record) => sum + record.liters, 0);
    const currentMaintenance = maintenance.filter((record) => new Date(`${record.service_date}T00:00:00`) >= currentStart).reduce((sum, record) => sum + record.cost, 0);
    return { currentTrips, currentFuel, currentMaintenance, trend };
  }, [fuel, maintenance, trips]);

  return <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-lg"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-slate-900">Fleet Performance</h2><p className="mt-1 text-sm text-slate-500">Last 7 days from live operational records</p></div>{loading ? <RefreshCw className="animate-spin text-slate-400" size={20} /> : <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${summary.trend >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>{summary.trend >= 0 ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-rose-600" />}<span className={`text-sm font-semibold ${summary.trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{summary.trend >= 0 ? "+" : ""}{summary.trend}% trips</span></div>}</div><div className="mt-8 grid grid-cols-3 gap-6 border-t border-slate-100 pt-6"><div><p className="text-sm text-slate-500">Trips</p><h3 className="mt-2 text-xl font-semibold text-slate-900">{loading ? "—" : summary.currentTrips}</h3></div><div><p className="text-sm text-slate-500">Fuel</p><h3 className="mt-2 text-xl font-semibold text-slate-900">{loading ? "—" : `${summary.currentFuel.toLocaleString("en-IN")} L`}</h3></div><div><p className="text-sm text-slate-500">Maintenance</p><h3 className="mt-2 text-xl font-semibold text-slate-900">{loading ? "—" : `₹${summary.currentMaintenance.toLocaleString("en-IN")}`}</h3></div></div></motion.div>;
}
