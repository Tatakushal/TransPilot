import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, UserRound, RefreshCw } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { deleteDriver, getDrivers, type Driver } from "@/services/driverService";

interface Props {
  search: string;
  refreshKey: number;
  onEdit: (driver: Driver) => void;
  onView: (driver: Driver) => void;
  onDriversChange?: (drivers: Driver[]) => void;
}

export default function DriverTable({ search, refreshKey, onEdit, onView, onDriversChange }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const next = await getDrivers();
      setDrivers(next);
      onDriversChange?.(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? drivers.filter((driver) => [driver.name, driver.license, driver.licenseCategory, driver.status].some((value) => value.toLowerCase().includes(query)))
      : drivers;
  }, [drivers, search]);

  async function remove(driver: Driver) {
    if (!window.confirm(`Delete ${driver.name}? This cannot be undone.`)) return;
    try {
      setDeleting(driver.license);
      await deleteDriver(driver.license);
      const next = drivers.filter((item) => item.license !== driver.license);
      setDrivers(next);
      onDriversChange?.(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete driver.");
    } finally {
      setDeleting("");
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
        <div><h2 className="font-bold text-slate-900">Driver roster</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} of {drivers.length} drivers</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50" aria-label="Refresh drivers"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button>
      </div>
      {error ? <div className="m-5 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-7 py-4 text-left">Driver</th><th className="px-5 py-4 text-left">License</th><th className="px-5 py-4 text-left">Safety</th><th className="px-5 py-4 text-left">Expiry</th><th className="px-5 py-4 text-left">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-14 text-center text-sm text-slate-500">Loading drivers...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="p-14 text-center"><UserRound className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-semibold text-slate-700">{drivers.length ? "No drivers match your search" : "No drivers yet"}</p></td></tr> : filtered.map((driver) => (
                <tr key={driver.license} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="px-7 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{driver.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}</div><div><p className="font-semibold text-slate-800">{driver.name}</p><p className="text-xs text-slate-400">{driver.licenseCategory}</p></div></div></td>
                  <td className="px-5 font-mono text-sm text-slate-500">{driver.license}</td>
                  <td className="px-5 text-sm font-semibold">{driver.safety}%</td>
                  <td className="px-5 text-sm text-slate-500">{driver.licenseExpiryDate}</td>
                  <td className="px-5"><StatusBadge status={driver.status} /></td>
                  <td className="px-5"><div className="flex justify-end gap-1"><button type="button" onClick={() => onView(driver)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="View" aria-label={`View ${driver.name}`}><Eye size={17} /></button><button type="button" onClick={() => onEdit(driver)} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50" title="Edit" aria-label={`Edit ${driver.name}`}><Pencil size={17} /></button><button type="button" disabled={deleting === driver.license} onClick={() => void remove(driver)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50" title="Delete" aria-label={`Delete ${driver.name}`}><Trash2 size={17} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
