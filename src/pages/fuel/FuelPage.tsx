import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Fuel, Plus, Search, Trash2, Pencil, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fuelService, type FuelRecord } from "@/services/fuelService";

const emptyForm = { vehicle_registration: "", fuel_date: new Date().toISOString().slice(0, 10), liters: "", cost: "", odometer: "", station: "", notes: "" };

export default function FuelPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin";
  const [logs, setLogs] = useState<FuelRecord[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setLogs(await fuelService.list()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load fuel records."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => logs.filter((record) => `${record.vehicle_registration} ${record.station} ${record.fuel_date}`.toLowerCase().includes(search.toLowerCase())), [logs, search]);
  const totalLitres = logs.reduce((sum, record) => sum + record.liters, 0);
  const totalCost = logs.reduce((sum, record) => sum + record.cost, 0);
  const avg = totalLitres ? totalCost / totalLitres : 0;
  const close = () => { setOpen(false); setEditing(null); setForm(emptyForm); };

  const save = async () => {
    const liters = Number(form.liters), cost = Number(form.cost), odometer = Number(form.odometer);
    if (!form.vehicle_registration.trim() || !form.fuel_date || !form.station.trim() || !Number.isFinite(liters) || liters <= 0 || !Number.isFinite(cost) || cost < 0 || !Number.isFinite(odometer) || odometer < 0) { setError("Enter a vehicle, date, station, and valid non-negative numeric values."); return; }
    setSaving(true); setError("");
    try { const payload = { ...form, vehicle_registration: form.vehicle_registration.trim().toUpperCase(), station: form.station.trim(), liters, cost, odometer }; if (editing) await fuelService.update(editing, payload); else await fuelService.create(payload); close(); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save fuel record."); }
    finally { setSaving(false); }
  };

  const edit = (record: FuelRecord) => { setEditing(record.id ?? null); setForm({ vehicle_registration: record.vehicle_registration, fuel_date: record.fuel_date, liters: String(record.liters), cost: String(record.cost), odometer: String(record.odometer), station: record.station, notes: record.notes ?? "" }); setOpen(true); };
  const remove = async (id: number) => { if (!window.confirm("Delete this fuel record?")) return; try { await fuelService.remove(id); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete fuel record."); } };

  return <AppShell><div className="space-y-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-indigo-600">Cost intelligence</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Fuel & Expenses</h1><p className="mt-2 text-sm text-slate-500">Track consumption, fuel spend and operating efficiency.</p></div>{canWrite && <button type="button" onClick={() => { setError(""); setOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"><Plus size={18} /> Add Fuel Log</button>}</div>
    <div className="grid gap-5 md:grid-cols-3">{[["Total Fuel Cost", `₹${totalCost.toLocaleString("en-IN")}`], ["Fuel Consumed", `${totalLitres.toLocaleString()} L`], ["Avg Cost / Litre", `₹${avg.toFixed(2)}`]].map(([label, value]) => <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Fuel size={18} /></div></div><h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</h2></div>)}</div>
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-bold text-slate-900">Fuel records</h2><div className="flex gap-2"><div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicle..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:bg-white" /></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-slate-50 disabled:opacity-50" aria-label="Refresh fuel records"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button></div></div>{error && <div className="m-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}<div className="overflow-x-auto">{loading ? <div className="p-12 text-center text-sm text-slate-500">Loading fuel records…</div> : <table className="w-full min-w-[850px]"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-4 text-left">Vehicle</th><th className="px-6 py-4 text-left">Litres</th><th className="px-6 py-4 text-left">Cost</th><th className="px-6 py-4 text-left">Date</th><th className="px-6 py-4 text-left">Station</th>{canWrite && <th className="px-6 py-4 text-right">Actions</th>}</tr></thead><tbody>{filtered.map((log) => <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-6 py-5 font-medium text-slate-700">{log.vehicle_registration}</td><td className="px-6 py-5 text-slate-600">{log.liters} L</td><td className="px-6 py-5 font-semibold text-slate-700">₹{log.cost.toLocaleString("en-IN")}</td><td className="px-6 py-5 text-slate-500">{log.fuel_date}</td><td className="px-6 py-5 text-slate-500">{log.station}</td>{canWrite && <td className="px-6 py-5 text-right"><button type="button" onClick={() => edit(log)} className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" aria-label={`Edit fuel record ${log.id}`}><Pencil size={16} /></button><button type="button" onClick={() => log.id && void remove(log.id)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete fuel record ${log.id}`}><Trash2 size={16} /></button></td>}</tr>)}</tbody></table>}{!loading && !filtered.length && <div className="p-12 text-center text-sm text-slate-500">No fuel records found.</div>}</div></div>
    {open && canWrite && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={close}><div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-900">{editing ? "Edit fuel log" : "Add fuel log"}</h2><p className="mt-1 text-sm text-slate-500">All fields are persisted to the backend.</p></div><button type="button" onClick={close} aria-label="Close"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{([["vehicle_registration", "Vehicle registration", "text"], ["fuel_date", "Fuel date", "date"], ["liters", "Litres", "number"], ["cost", "Cost (₹)", "number"], ["odometer", "Odometer", "number"], ["station", "Fuel station", "text"]] as const).map(([key, placeholder, type]) => <input key={key} type={type} min={type === "number" ? "0" : undefined} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />)}<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="min-h-20 rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-indigo-500 sm:col-span-2" /></div>{error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}<button type="button" disabled={saving} onClick={() => void save()} className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Save fuel log"}</button></div></div>}
  </div></AppShell>;
}
