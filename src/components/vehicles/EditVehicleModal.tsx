import { useEffect, useState } from "react";
import { updateVehicle } from "@/services/vehicleService";
import type { Vehicle, VehicleStatus } from "@/types/vehicles";

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVehicleModal({ vehicle, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ model: "", type: "", capacity: "", odometer: "", acquisitionCost: "", status: "Available" as VehicleStatus });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    setForm({
      model: vehicle.model,
      type: vehicle.type,
      capacity: vehicle.capacity.replace(/[^0-9.]/g, ""),
      odometer: String(vehicle.odometer),
      acquisitionCost: String(vehicle.acquisitionCost),
      status: vehicle.status,
    });
    setError("");
  }, [vehicle]);

  if (!vehicle) return null;

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  async function handleSubmit() {
    const capacity = Number(form.capacity);
    const odometer = Number(form.odometer);
    const acquisitionCost = Number(form.acquisitionCost);

    if (!form.model.trim() || !form.type.trim()) {
      setError("Model and type are required.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 0 || !Number.isFinite(odometer) || odometer < 0 || !Number.isFinite(acquisitionCost) || acquisitionCost < 0) {
      setError("Capacity, odometer and cost must be valid non-negative numbers.");
      return;
    }

    try {
      setSaving(true);
      await updateVehicle({ ...vehicle, model: form.model, type: form.type, capacity: `${capacity} kg`, odometer, acquisitionCost, status: form.status });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update vehicle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[600px] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Edit Vehicle</h2>
          <p className="mt-1 text-sm text-slate-500">{vehicle.registration}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input placeholder="Model *" className="rounded-xl border p-3" value={form.model} onChange={(e) => update("model", e.target.value)} />
          <input placeholder="Type *" className="rounded-xl border p-3" value={form.type} onChange={(e) => update("type", e.target.value)} />
          <input type="number" min="0" placeholder="Capacity (kg) *" className="rounded-xl border p-3" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
          <input type="number" min="0" placeholder="Odometer *" className="rounded-xl border p-3" value={form.odometer} onChange={(e) => update("odometer", e.target.value)} />
          <input type="number" min="0" placeholder="Acquisition cost *" className="rounded-xl border p-3" value={form.acquisitionCost} onChange={(e) => update("acquisitionCost", e.target.value)} />
          <select className="rounded-xl border p-3" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Retired</option>
          </select>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="rounded-xl border px-5 py-3 disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}
