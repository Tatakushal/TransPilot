import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TripTable() {
  const [trips] = useState([
    {
      id: "TR-1001",
      vehicle: "Volvo FH16",
      driver: "Alex",
      route: "Hyderabad → Bangalore",
      cargo: "12 Tons",
      status: "Dispatched",
    },
    {
      id: "TR-1002",
      vehicle: "Tata Prima",
      driver: "Robert",
      route: "Chennai → Kochi",
      cargo: "8 Tons",
      status: "Completed",
    },
    {
      id: "TR-1003",
      vehicle: "Ford Transit",
      driver: "Rahul",
      route: "Delhi → Jaipur",
      cargo: "5 Tons",
      status: "Draft",
    },
  ]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed">
        <thead className="border-b bg-slate-50">
          <tr className="text-left text-sm font-semibold text-slate-600">
            <th className="px-6 py-4">Trip ID</th>
            <th className="px-6 py-4">Vehicle</th>
            <th className="px-6 py-4">Driver</th>
            <th className="px-6 py-4">Route</th>
            <th className="px-6 py-4">Cargo</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr
              key={trip.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-6 py-5 font-medium">{trip.id}</td>
              <td className="px-6 py-5">{trip.vehicle}</td>
              <td className="px-6 py-5">{trip.driver}</td>
              <td className="px-6 py-5">{trip.route}</td>
              <td className="px-6 py-5">{trip.cargo}</td>
              <td className="px-6 py-5">
                <StatusBadge status={trip.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
