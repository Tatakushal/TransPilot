import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const stats = [
  { label: "Distance", value: "12,845 km" },
  { label: "Trips", value: "184" },
  { label: "Fuel", value: "91%" },
];

export default function FleetStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Fleet Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">Last 7 days</p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
          <TrendingUp size={16} className="text-emerald-600" />

          <span className="text-sm font-semibold text-emerald-600">+8.2%</span>
        </div>
      </div>

      <div className="mt-8 h-[240px]">
        <svg
          viewBox="0 0 700 260"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="fleetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />

              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="
              M0 190
              C70 180 120 155 170 160
              S280 120 340 125
              S430 90 510 100
              S610 70 700 75
            "
            fill="none"
            stroke="#4F46E5"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="
              M0 190
              C70 180 120 155 170 160
              S280 120 340 125
              S430 90 510 100
              S610 70 700 75
              L700 260
              L0 260
              Z
            "
            fill="url(#fleetFill)"
          />
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6 border-t border-slate-100 pt-6">
        {stats.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>

            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
