import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

const maintenance = [
  {
    vehicle: "Volvo FH16",
    issue: "Oil Change Due",
    priority: "High",
  },
  {
    vehicle: "Tata Prima",
    issue: "Brake Inspection",
    priority: "Medium",
  },
  {
    vehicle: "Eicher Pro",
    issue: "Engine Service",
    priority: "Low",
  },
];

export default function MaintenanceAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Maintenance</h2>

          <p className="mt-1 text-sm text-slate-500">Upcoming service alerts</p>
        </div>

        <div className="rounded-2xl bg-orange-100 p-3">
          <Wrench className="text-orange-600" size={22} />
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {maintenance.map((item) => (
          <div
            key={item.vehicle}
            className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition"
          >
            <div>
              <p className="font-semibold">{item.vehicle}</p>

              <p className="text-sm text-slate-500 mt-1">{item.issue}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.priority === "High"
                  ? "bg-red-100 text-red-600"
                  : item.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
