import { motion } from "framer-motion";
import { MoreHorizontal, Truck, ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

const trips = [
  { id: "TRP-1001", driver: "Alex Johnson", vehicle: "Volvo FH16", route: "Delhi → Mumbai", status: "On Trip" },
  { id: "TRP-1002", driver: "John David", vehicle: "Tata Prima", route: "Hyderabad → Chennai", status: "Completed" },
  { id: "TRP-1003", driver: "Robert Smith", vehicle: "Ashok Leyland", route: "Pune → Goa", status: "Maintenance" },
  { id: "TRP-1004", driver: "Kevin Martin", vehicle: "Eicher Pro", route: "Bangalore → Kochi", status: "Pending" },
];

export default function RecentTrips() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" /><h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Trips</h2></div><p className="mt-1 text-sm text-slate-500">Latest transport activity across your fleet</p></div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">View all <ArrowUpRight size={16} /></button>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="bg-slate-50/80"><tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400"><th className="px-8 py-4">Trip</th><th className="px-6 py-4">Driver</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Route</th><th className="px-6 py-4">Status</th><th /></tr></thead><tbody>{trips.map((trip) => <tr key={trip.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-8 py-5"><span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">{trip.id}</span></td><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{trip.driver.split(" ").map(n => n[0]).join("")}</div><span className="text-sm font-medium text-slate-700">{trip.driver}</span></div></td><td className="px-6 py-5"><div className="flex items-center gap-2 text-sm text-slate-600"><Truck size={16} className="text-slate-400" />{trip.vehicle}</div></td><td className="px-6 py-5 text-sm text-slate-600">{trip.route}</td><td className="px-6 py-5"><StatusBadge status={trip.status} /></td><td className="px-6 py-5"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`More options for ${trip.id}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>
    </motion.div>
  );
}
