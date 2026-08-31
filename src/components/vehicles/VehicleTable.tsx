import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Truck } from "lucide-react";

import StatusBadge from "@/components/ui/StatusBadge";
import { deleteVehicle, getVehicles } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicles";

interface Props {
  search: string;
  refreshKey: number;
  onEdit: (vehicle: Vehicle) => void;
  onView: (vehicle: Vehicle) => void;
}

export default function VehicleTable({ search, refreshKey, onEdit, onView }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getVehicles()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load vehicles.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((vehicle) =>
      [vehicle.registration, vehicle.model, vehicle.type, vehicle.status].some((value) => value.toLowerCase().includes(query)),
    );
  }, [vehicles, search]);

  async function handleDelete(vehicle: Vehicle) {
    const confirmed = window.confirm(`Delete vehicle ${vehicle.registration}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeleting(vehicle.registration);
      await deleteVehicle(vehicle.registration);
      setVehicles((current) => current.filter((item) => item.registration !== vehicle.registration));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete vehicle.");
    } finally {
      setDeleting("");
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading vehicles...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-700">Unable to load vehicle registry</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredVehicles.length}</span> of <span className="font-semibold text-slate-900">{vehicles.length}</span> vehicles
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  {vehicles.length === 0 ? "No vehicles have been registered yet." : "No vehicles match your search."}
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.registration} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                        <Truck size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{vehicle.model}</p>
                        <p className="text-sm text-slate-500">{vehicle.registration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 text-slate-500">Unassigned</td>
                  <td className="px-6 text-slate-700">{vehicle.type}</td>
                  <td className="px-6 text-slate-700">{vehicle.capacity}</td>
                  <td className="px-6"><StatusBadge status={vehicle.status} /></td>
                  <td className="px-6">
                    <div className="flex justify-center gap-2">
                      <button type="button" title="View details" aria-label={`View ${vehicle.registration}`} onClick={() => onView(vehicle)} className="rounded-lg p-2 transition hover:bg-slate-100">
                        <Eye size={17} />
                      </button>
                      <button type="button" title="Edit vehicle" aria-label={`Edit ${vehicle.registration}`} onClick={() => onEdit(vehicle)} className="rounded-lg p-2 transition hover:bg-indigo-100">
                        <Pencil size={17} className="text-indigo-600" />
                      </button>
                      <button type="button" title="Delete vehicle" aria-label={`Delete ${vehicle.registration}`} disabled={deleting === vehicle.registration} onClick={() => handleDelete(vehicle)} className="rounded-lg p-2 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
                        <Trash2 size={17} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
