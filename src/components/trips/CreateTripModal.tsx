import { useState } from "react";
import { validateTrip } from "@/utils/tripValidation";

interface Props {
  open: boolean;
  onClose: () => void;
}

const vehicles = [
  {
    id: 1,
    name: "Volvo FH16",
    status: "Available",
    capacity: 25,
  },
  {
    id: 2,
    name: "Tata Prima",
    status: "On Trip",
    capacity: 18,
  },
];

const drivers = [
  {
    id: 1,
    name: "Alex Johnson",
    status: "Available",
    licenseExpired: false,
  },
  {
    id: 2,
    name: "John David",
    status: "On Trip",
    licenseExpired: false,
  },
];

export default function CreateTripModal({ open, onClose }: Props) {
  const [vehicleId, setVehicleId] = useState(1);
  const [driverId, setDriverId] = useState(1);
  const [cargoWeight, setCargoWeight] = useState(10);

  if (!open) return null;

  const submit = () => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)!;

    const driver = drivers.find((d) => d.id === driverId)!;

    const error = validateTrip(vehicle, driver, cargoWeight);

    if (error) {
      alert(error);
      return;
    }

    alert("Trip Created Successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] rounded-3xl bg-white p-8">
        <h2 className="mb-6 text-2xl font-bold">Create Trip</h2>

        <div className="space-y-4">
          <select
            className="w-full rounded-xl border p-3"
            value={vehicleId}
            onChange={(e) => setVehicleId(Number(e.target.value))}
          >
            {vehicles.map((v) => (
              <option
                key={v.id}
                value={v.id}
                disabled={v.status !== "Available"}
              >
                {v.name} ({v.status})
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border p-3"
            value={driverId}
            onChange={(e) => setDriverId(Number(e.target.value))}
          >
            {drivers.map((d) => (
              <option
                key={d.id}
                value={d.id}
                disabled={d.status !== "Available"}
              >
                {d.name} ({d.status})
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Source"
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Destination"
          />

          <input
            type="number"
            className="w-full rounded-xl border p-3"
            placeholder="Cargo Weight"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(Number(e.target.value))}
          />

          <input type="date" className="w-full rounded-xl border p-3" />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border px-5 py-2">
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-white"
          >
            Create Trip
          </button>
        </div>
      </div>
    </div>
  );
}
