import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Truck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatusBadge from "@/components/ui/StatusBadge";
import { deleteVehicle, getVehicles } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicles";

interface Props { search: string; refreshKey: number; onEdit: (v: Vehicle) => void; onView: (v: Vehicle) => void; }

export default function VehicleTable({ search, refreshKey, onEdit, onView }: Props) {
  const { user } = useAuth();
  const canDelete = user?.role === "admin" || user?.role === "fleet-manager";
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setVehicles(await getVehicles()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load vehicles."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load, refreshKey]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return q ? vehicles.filter((vehicle) => [vehicle.registration, vehicle.model, vehicle.type, vehicle.status].some((value) => value.toLowerCase().includes(q))) : vehicles; }, [vehicles, search]);

  async function del(vehicle: Vehicle) {
    if (!window.confirm(`Delete vehicle ${vehicle.registration}? This action cannot be undone.`)) return;
    try { setDeleting(vehicle.registration); await deleteVehicle(vehicle.registration); setVehicles((items) => items.filter((item) => item.registration !== vehicle.registration)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete vehicle."); }
    finally { setDeleting(""); }
  }

  return <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-7 py-5"><div><h2 className="font-bold text-slate-900">Vehicle registry</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} of {vehicles.length} vehicles</p></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50" aria-label="Refresh vehicles"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button></div>{error ? <div className="m-5 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-7 py-4 text-left">Vehicle</th><th className="px-6 py-4 text-left">Assignment</th><th className="px-6 py-4 text-left">Type</th><th className="px-6 py-4 text-left">Capacity</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-14 text-center text-sm text-slate-500">Loading fleet...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="p-14 text-center"><Truck className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-semibold text-slate-700">{vehicles.length ? "No vehicles match your search" : "Your fleet is empty"}</p><p className="mt-1 text-sm text-slate-400">{vehicles.length ? "Try a different search term." : "Add your first vehicle to start managing the fleet."}</p></td></tr> : filtered.map((vehicle) => <tr key={vehicle.registration} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-7 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><Truck size={18} className="text-indigo-600" /></div><div><p className="font-semibold text-slate-800">{vehicle.model}</p><p className="font-mono text-xs text-slate-400">{vehicle.registration}</p></div></div></td><td className="px-6 text-sm text-slate-500">{vehicle.status === "On Trip" ? "Assigned to trip" : "Available for assignment"}</td><td className="px-6 text-sm text-slate-600">{vehicle.type}</td><td className="px-6 text-sm text-slate-600">{vehicle.capacity}</td><td className="px-6"><StatusBadge status={vehicle.status} /></td><td className="px-6"><div className="flex justify-end gap-1"><button type="button" onClick={() => onView(vehicle)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="View" aria-label={`View ${vehicle.registration}`}><Eye size={17} /></button><button type="button" onClick={() => onEdit(vehicle)} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50" title="Edit" aria-label={`Edit ${vehicle.registration}`}><Pencil size={17} /></button>{canDelete && <button type="button" disabled={deleting === vehicle.registration} onClick={() => void del(vehicle)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50" title="Delete" aria-label={`Delete ${vehicle.registration}`}><Trash2 size={17} /></button>}</div></td></tr>)}</tbody></table></div>}</div>;
}
