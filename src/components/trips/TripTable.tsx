import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Route, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatusBadge from "@/components/ui/StatusBadge";
import { tripService, type Trip } from "@/services/tripService";

interface Props { refreshKey?: number; onEdit?: (trip: Trip) => void; }

export default function TripTable({ refreshKey = 0, onEdit }: Props) {
  const { user } = useAuth();
  const canDelete = user?.role === "admin" || user?.role === "fleet-manager";
  const [trips, setTrips] = useState<Trip[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Trip | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setTrips(await tripService.list()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load trips."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load, refreshKey]);
  const filtered = useMemo(() => trips.filter((trip) => Object.values(trip).join(" ").toLowerCase().includes(q.toLowerCase())), [trips, q]);

  async function del(id: number) {
    if (!window.confirm(`Delete trip TR-${String(id).padStart(4, "0")}?`)) return;
    setBusyId(id); setError("");
    try { await tripService.remove(id); setTrips((items) => items.filter((trip) => trip.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete trip."); }
    finally { setBusyId(null); }
  }

  return <><div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Trip registry</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} journeys in view</p></div><div className="flex w-full gap-2 sm:w-auto"><div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 text-sm outline-none focus:border-indigo-500 focus:bg-white" /></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-slate-50 disabled:opacity-50" title="Refresh" aria-label="Refresh trips"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button></div></div>{error && <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="overflow-x-auto"><table className="w-full min-w-[1000px]"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-7 py-4 text-left">Trip</th><th className="px-5 py-4 text-left">Vehicle</th><th className="px-5 py-4 text-left">Driver</th><th className="px-5 py-4 text-left">Route</th><th className="px-5 py-4 text-left">Cargo</th><th className="px-5 py-4 text-left">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="p-14 text-center text-sm text-slate-400">Loading trips…</td></tr> : filtered.length ? filtered.map((trip) => <tr key={trip.id} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-7 py-5"><span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">TR-{String(trip.id).padStart(4, "0")}</span></td><td className="px-5 font-medium text-slate-700">{trip.vehicle_registration}</td><td className="px-5 text-sm text-slate-600">{trip.driver_license}</td><td className="px-5 text-sm text-slate-600">{trip.source} → {trip.destination}</td><td className="px-5 text-sm text-slate-600">{trip.cargo_weight} kg</td><td className="px-5"><StatusBadge status={trip.status} /></td><td className="px-5"><div className="flex justify-end gap-1"><button type="button" onClick={() => setSelected(trip)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="View" aria-label={`View trip ${trip.id}`}><Eye size={17} /></button><button type="button" onClick={() => onEdit?.(trip)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit" aria-label={`Edit trip ${trip.id}`}><Pencil size={17} /></button>{canDelete && <button type="button" onClick={() => void del(trip.id)} disabled={busyId === trip.id} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50" title="Delete" aria-label={`Delete trip ${trip.id}`}><Trash2 size={17} /></button>}</div></td></tr>) : <tr><td colSpan={7} className="p-14 text-center"><Route className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-semibold text-slate-700">No trips found</p><p className="mt-1 text-sm text-slate-400">Create a trip or try another search term.</p></td></tr>}</tbody></table></div></div>{selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Trip TR-{String(selected.id).padStart(4, "0")}</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{selected.source} → {selected.destination}</h3></div><button type="button" onClick={() => setSelected(null)} className="rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-100" aria-label="Close">✕</button></div><div className="mt-6 grid grid-cols-2 gap-4 text-sm"><div><p className="text-slate-400">Vehicle</p><p className="font-semibold">{selected.vehicle_registration}</p></div><div><p className="text-slate-400">Driver</p><p className="font-semibold">{selected.driver_license}</p></div><div><p className="text-slate-400">Cargo</p><p className="font-semibold">{selected.cargo_weight} kg</p></div><div><p className="text-slate-400">Date</p><p className="font-semibold">{selected.trip_date}</p></div><div><p className="text-slate-400">Status</p><StatusBadge status={selected.status} /></div></div></div></div>}</>;
}
