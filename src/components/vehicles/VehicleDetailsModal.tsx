import type { Vehicle } from "@/types/vehicles";

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function VehicleDetailsModal({ vehicle, onClose }: Props) {
  if (!vehicle) return null;

  const details = [
    ["Registration", vehicle.registration],
    ["Model", vehicle.model],
    ["Type", vehicle.type],
    ["Load capacity", vehicle.capacity],
    ["Odometer", `${vehicle.odometer.toLocaleString()} km`],
    ["Acquisition cost", `₹${vehicle.acquisitionCost.toLocaleString()}`],
    ["Status", vehicle.status],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Vehicle Details</h2>
            <p className="mt-1 text-sm text-slate-500">Fleet asset information</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{vehicle.status}</span>
        </div>

        <div className="divide-y rounded-2xl border border-slate-200">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-6 px-5 py-4">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800">Close</button>
        </div>
      </div>
    </div>
  );
}
