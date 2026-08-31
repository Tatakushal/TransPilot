import { useState } from "react";
import { addVehicle } from "@/services/vehicleService";
import type { VehicleStatus } from "@/types/vehicles";

interface VehicleForm {
  registration: string;
  model: string;
  type: string;
  capacity: string;
  odometer: string;
  acquisitionCost: string;
  status: VehicleStatus;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm: VehicleForm = {
  registration: "",
  model: "",
  type: "",
  capacity: "",
  odometer: "",
  acquisitionCost: "",
  status: "Available",
};

export default function AddVehicleModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const update = <K extends keyof VehicleForm>(key: K, value: VehicleForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  async function handleSubmit() {
    const capacity = Number(form.capacity);
    const odometer = Number(form.odometer);
    const acquisitionCost = Number(form.acquisitionCost);

    if (!form.registration.trim() || !form.model.trim() || !form.type.trim()) {
      setError("Registration, model and type are required.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 0) {
      setError("Enter a valid load capacity.");
      return;
    }
    if (!Number.isFinite(odometer) || odometer < 0) {
      setError("Enter a valid odometer reading.");
      return;
    }
    if (!Number.isFinite(acquisitionCost) || acquisitionCost < 0) {
      setError("Enter a valid acquisition cost.");
      return;
    }

    try {
      setSaving(true);
      await addVehicle({
        id: 0,
        registration: form.registration,
        model: form.model,
        type: form.type,
        capacity: `${capacity} kg`,
        odometer,
        acquisitionCost,
        status: form.status,
      });
      setForm(initialForm);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add vehicle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[600px] rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Add Vehicle</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input placeholder="Registration *" className="rounded-xl border p-3" value={form.registration} onChange={(e) => update("registration", e.target.value)} />
          <input placeholder="Model *" className="rounded-xl border p-3" value={form.model} onChange={(e) => update("model", e.target.value)} />
          <input placeholder="Type *" className="rounded-xl border p-3" value={form.type} onChange={(e) => update("type", e.target.value)} />
          <input type="number" min="0" placeholder="Capacity (kg) *" className="rounded-xl border p-3" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
          <input type="number" min="0" placeholder="Odometer *" className="rounded-xl border p-3" value={form.odometer} onChange={(e) => update("odometer", e.target.value)} />
          <input type="number" min="0" placeholder="Acquisition cost *" className="rounded-xl border p-3" value={form.acquisitionCost} onChange={(e) => update("acquisitionCost", e.target.value)} />
          <select className="rounded-xl border p-3 sm:col-span-2" value={form.status} onChange={(e) => update("status", e.target.value as VehicleStatus)}>
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Retired</option>
          </select>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="rounded-xl border px-5 py-3 disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
