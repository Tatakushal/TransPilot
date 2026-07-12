import { Truck, Wrench, Route } from "lucide-react";
import { motion } from "framer-motion";

const vehicles = [
  {
    label: "Available",
    value: 32,
    total: 48,
    color: "bg-emerald-500",
    icon: Truck,
  },
  {
    label: "On Trip",
    value: 12,
    total: 48,
    color: "bg-blue-500",
    icon: Route,
  },
  {
    label: "Maintenance",
    value: 4,
    total: 48,
    color: "bg-amber-500",
    icon: Wrench,
  },
];

export default function VehicleStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900">Vehicle Status</h2>

        <p className="mt-1 text-sm text-slate-500">
          Current fleet availability
        </p>
      </div>

      <div className="space-y-8">
        {vehicles.map((item) => {
          const Icon = item.icon;
          const width = (item.value / item.total) * 100;

          return (
            <div key={item.label}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}/10`}
                  >
                    <Icon
                      size={18}
                      className={
                        item.label === "Available"
                          ? "text-emerald-600"
                          : item.label === "On Trip"
                            ? "text-blue-600"
                            : "text-amber-600"
                      }
                    />
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">{item.label}</p>

                    <p className="text-xs text-slate-500">
                      {item.value} Vehicles
                    </p>
                  </div>
                </div>

                <span className="font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm text-slate-500">Fleet Health</p>

        <h3 className="mt-2 text-3xl font-bold text-slate-900">92%</h3>

        <p className="mt-2 text-sm text-emerald-600 font-medium">
          Excellent operational condition
        </p>
      </div>
    </motion.div>
  );
}
