import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  positive?: boolean;
}

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="
        h-[165px]
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
      "
    >
      <div className="flex h-full justify-between">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <h2 className="mt-3 text-[56px] leading-none font-bold tracking-tight text-slate-900">
              {value}
            </h2>
          </div>

          <span
            className={`text-sm font-semibold ${
              positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {change}
          </span>
        </div>

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-indigo-50
            shrink-0
          "
        >
          <Icon size={26} className="text-indigo-600" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
