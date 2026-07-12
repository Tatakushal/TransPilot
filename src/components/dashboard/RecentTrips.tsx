import { motion } from "framer-motion";
import { MoreHorizontal, Truck } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

const trips = [
  {
    id: "TRP-1001",
    driver: "Alex Johnson",
    vehicle: "Volvo FH16",
    route: "Delhi → Mumbai",
    status: "On Trip",
  },
  {
    id: "TRP-1002",
    driver: "John David",
    vehicle: "Tata Prima",
    route: "Hyderabad → Chennai",
    status: "Completed",
  },
  {
    id: "TRP-1003",
    driver: "Robert Smith",
    vehicle: "Ashok Leyland",
    route: "Pune → Goa",
    status: "Maintenance",
  },
  {
    id: "TRP-1004",
    driver: "Kevin Martin",
    vehicle: "Eicher Pro",
    route: "Bangalore → Kochi",
    status: "Pending",
  },
];

export default function RecentTrips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Recent Trips</h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest transport activities
          </p>
        </div>

        <button className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-500">
              <th className="px-8 py-4 font-medium">Trip</th>

              <th className="px-6 py-4 font-medium">Driver</th>

              <th className="px-6 py-4 font-medium">Vehicle</th>

              <th className="px-6 py-4 font-medium">Route</th>

              <th className="px-6 py-4 font-medium">Status</th>

              <th className="w-12"></th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-8 py-5 font-semibold text-slate-900">
                  {trip.id}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                      {trip.driver
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <span>{trip.driver}</span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Truck size={18} className="text-slate-400" />

                    {trip.vehicle}
                  </div>
                </td>

                <td className="px-6 py-5 text-slate-600">{trip.route}</td>

                <td className="px-6 py-5">
                  <StatusBadge status={trip.status} />
                </td>

                <td className="px-6 py-5">
                  <button className="rounded-lg p-2 transition hover:bg-slate-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
