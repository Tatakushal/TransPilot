import { useEffect, useState } from "react";
import { getVehicles } from "@/services/vehicleService";
import { getDrivers } from "@/services/driverService";
import { tripService, Trip, TripPayload } from "@/services/tripService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (trip: Trip) => void;
  editingTrip?: Trip | null;
}

export default function CreateTripModal({ open, onClose, onCreated, editingTrip }: Props) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [tripDate, setTripDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TripPayload["status"]>("Pending");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editingTrip) {
      setVehicle(editingTrip.vehicle_registration); setDriver(editingTrip.driver_license);
      setSource(editingTrip.source); setDestination(editingTrip.destination);
      setCargoWeight(editingTrip.cargo_weight); setTripDate(editingTrip.trip_date); setStatus(editingTrip.status);
    } else {
      setVehicle(""); setDriver(""); setSource(""); setDestination(""); setCargoWeight(0);
      setTripDate(new Date().toISOString().slice(0, 10)); setStatus("Pending");
    }
    setLoadingOptions(true);
    Promise.all([getVehicles(), getDrivers()]).then(([v, d]) => { setVehicles(v); setDrivers(d); }).catch(e => setError(e?.message || "Unable to load fleet options."))
      .finally(() => setLoadingOptions(false));
  }, [open, editingTrip]);

  if (!open) return null;

  const availableVehicles = vehicles.filter(v => v.status === "Available" || v.registration === editingTrip?.vehicle_registration);
  const availableDrivers = drivers.filter(d => d.status === "Available" || d.license === editingTrip?.driver_license);

  async function submit() {
    if (!vehicle || !driver || !source.trim() || !destination.trim() || cargoWeight <= 0 || !tripDate) {
      setError("Please complete all trip fields."); return;
    }
    setLoading(true); setError("");
    const payload: TripPayload = { vehicle_registration: vehicle, driver_license: driver, source: source.trim(), destination: destination.trim(), cargo_weight: cargoWeight, trip_date: tripDate, status };
    try {
      const saved = editingTrip ? await tripService.update(editingTrip.id, payload) : await tripService.create(payload);
      onCreated?.(saved); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save trip."); }
    finally { setLoading(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
    <div className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Trip management</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{editingTrip ? "Edit trip" : "Create trip"}</h2></div><button onClick={onClose} className="rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-100">✕</button></div>
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Vehicle<select disabled={loadingOptions} value={vehicle} onChange={e=>setVehicle(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">Select vehicle</option>{availableVehicles.map(v=><option key={v.registration} value={v.registration}>{v.registration} · {v.model}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Driver<select disabled={loadingOptions} value={driver} onChange={e=>setDriver(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">Select driver</option>{availableDrivers.map(d=><option key={d.license} value={d.license}>{d.name} · {d.license}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Source<input value={source} onChange={e=>setSource(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" placeholder="Origin" /></label>
        <label className="text-sm font-medium text-slate-700">Destination<input value={destination} onChange={e=>setDestination(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" placeholder="Destination" /></label>
        <label className="text-sm font-medium text-slate-700">Cargo weight (kg)<input type="number" min="1" value={cargoWeight || ""} onChange={e=>setCargoWeight(Number(e.target.value))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        <label className="text-sm font-medium text-slate-700">Trip date<input type="date" value={tripDate} onChange={e=>setTripDate(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Status<select value={status} onChange={e=>setStatus(e.target.value as TripPayload["status"])} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"><option>Pending</option><option>Active</option><option>Completed</option><option>Cancelled</option></select></label>
      </div>
      <div className="mt-7 flex justify-end gap-3"><button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5">Cancel</button><button onClick={submit} disabled={loading || loadingOptions} className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{loading ? "Saving…" : editingTrip ? "Save changes" : "Create trip"}</button></div>
    </div>
  </div>;
}
