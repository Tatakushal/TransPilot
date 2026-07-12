import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

const alerts = [
  {
    driver: "Alex Johnson",
    message: "License expires in 5 days",
    color: "yellow",
  },
  {
    driver: "Robert Smith",
    message: "Safety score below 80",
    color: "red",
  },
  {
    driver: "Kevin Martin",
    message: "Fatigue detected",
    color: "blue",
  },
];

export default function DriverAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Driver Alerts</h2>

          <p className="mt-1 text-sm text-slate-500">Safety & compliance</p>
        </div>

        <div className="rounded-2xl bg-red-100 p-3">
          <ShieldAlert size={22} className="text-red-600" />
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {alerts.map((alert) => (
          <div
            key={alert.driver}
            className="rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition"
          >
            <p className="font-semibold">{alert.driver}</p>

            <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
