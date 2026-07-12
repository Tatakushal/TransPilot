import { Eye, Pencil, Trash2, Truck } from "lucide-react";

import StatusBadge from "@/components/ui/StatusBadge";

const vehicles = [
  {
    reg: "KL07AB1023",
    model: "Volvo FH16",
    type: "Truck",
    status: "Available",
    capacity: "25 Tons",
    driver: "Alex Johnson",
  },
  {
    reg: "KA05MN8899",
    model: "Tata Prima",
    type: "Truck",
    status: "On Trip",
    capacity: "18 Tons",
    driver: "John David",
  },
  {
    reg: "TN22TR5555",
    model: "Eicher Pro",
    type: "Mini Truck",
    status: "Maintenance",
    capacity: "8 Tons",
    driver: "Robert Smith",
  },
];

export default function VehicleTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed">
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
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.reg}
              className="border-b border-slate-100 transition hover:bg-slate-50"
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                    <Truck size={20} className="text-indigo-600" />
                  </div>

                  <div>
                    <p className="font-semibold">{vehicle.model}</p>

                    <p className="text-sm text-slate-500">{vehicle.reg}</p>
                  </div>
                </div>
              </td>

              <td className="px-6">{vehicle.driver}</td>

              <td className="px-6">{vehicle.type}</td>

              <td className="px-6">{vehicle.capacity}</td>

              <td className="px-6">
                <StatusBadge status={vehicle.status} />
              </td>

              <td>
                <div className="flex justify-center gap-2">
                  <button className="rounded-lg p-2 transition hover:bg-slate-100">
                    <Eye size={17} />
                  </button>

                  <button className="rounded-lg p-2 transition hover:bg-indigo-100">
                    <Pencil size={17} className="text-indigo-600" />
                  </button>

                  <button className="rounded-lg p-2 transition hover:bg-red-100">
                    <Trash2 size={17} className="text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
