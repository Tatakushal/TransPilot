import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Truck, ArrowUpRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/ui/StatusBadge";
import { tripService, type Trip } from "@/services/tripService";
import { getDrivers, type Driver } from "@/services/driverService";
import { getVehicles } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicles";

export default function RecentTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [nextTrips, nextDrivers, nextVehicles] = await Promise.all([tripService.list(), getDrivers(), getVehicles()]);
        if (!active) return;
        setTrips(nextTrips.slice(0, 6));
        setDrivers(nextDrivers);
        setVehicles(nextVehicles);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load recent trips.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const rows = useMemo(() => trips.map((trip) => ({
    ...trip,
    driverName: drivers.find((driver) => driver.license === trip.driver_license)?.name ?? trip.driver_license,
    vehicleName: vehicles.find((vehicle) => vehicle.registration === trip.vehicle_registration)?.model ?? trip.vehicle_registration,
  })), [drivers, trips, vehicles]);

  return <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" /><h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Trips</h2></div><p className="mt-1 text-sm text-slate-500">Latest transport activity from your live trip records</p></div><button type="button" onClick={() => navigate("/trips")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">View all <ArrowUpRight size={16} /></button></div>
    {error ? <div className="m-5 rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="bg-slate-50/80"><tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400"><th className="px-8 py-4">Trip</th><th className="px-6 py-4">Driver</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Route</th><th className="px-6 py-4">Status</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-500"><RefreshCw className="mx-auto animate-spin text-indigo-600" size={20} /><p className="mt-3">Loading recent trips…</p></td></tr> : rows.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-500">No trips have been recorded yet.</td></tr> : rows.map((trip) => <tr key={trip.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-8 py-5"><span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">TRP-{String(trip.id).padStart(4, "0")}</span></td><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{trip.driverName.split(" ").map((name) => name[0]).join("").slice(0, 2)}</div><span className="text-sm font-medium text-slate-700">{trip.driverName}</span></div></td><td className="px-6 py-5"><div className="flex items-center gap-2 text-sm text-slate-600"><Truck size={16} className="text-slate-400" />{trip.vehicleName}</div></td><td className="px-6 py-5 text-sm text-slate-600">{trip.source} → {trip.destination}</td><td className="px-6 py-5"><StatusBadge status={trip.status} /></td><td className="px-6 py-5"><button type="button" onClick={() => navigate(`/trips?trip=${trip.id}`)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Open trip ${trip.id}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>}
  </motion.div>;
}
