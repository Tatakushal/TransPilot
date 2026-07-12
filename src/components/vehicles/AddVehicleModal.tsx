import { useState } from "react";
import { addVehicle } from "@/services/vehicleService";

interface Vehicle {
  id?: number;
  registration: string;
  model: string;
  type: string;
  capacity: string;
  odometer: number;
  acquisitionCost: number;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<Vehicle>({
    registration: "",
    model: "",
    type: "",
    capacity: "",
    odometer: 0,
    acquisitionCost: 0,
    status: "Available",
  });

  if (!open) return null;

  async function handleSubmit() {
    try {
      await addVehicle(form);

      onSuccess();

      onClose();
    } catch (err) {
      console.error(err);

      alert("Unable to add vehicle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[600px] rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Add Vehicle</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Registration"
            className="rounded-xl border p-3"
            value={form.registration}
            onChange={(e) =>
              setForm({
                ...form,
                registration: e.target.value,
              })
            }
          />

          <input
            placeholder="Model"
            className="rounded-xl border p-3"
            value={form.model}
            onChange={(e) =>
              setForm({
                ...form,
                model: e.target.value,
              })
            }
          />

          <input
            placeholder="Type"
            className="rounded-xl border p-3"
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          />

          <input
            placeholder="Capacity"
            className="rounded-xl border p-3"
            value={form.capacity}
            onChange={(e) =>
              setForm({
                ...form,
                capacity: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Odometer"
            className="rounded-xl border p-3"
            value={form.odometer}
            onChange={(e) =>
              setForm({
                ...form,
                odometer: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            placeholder="Cost"
            className="rounded-xl border p-3"
            value={form.acquisitionCost}
            onChange={(e) =>
              setForm({
                ...form,
                acquisitionCost: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border px-5 py-3">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-white"
          >
            Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}
