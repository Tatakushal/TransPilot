import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { tripService, type Trip } from "@/services/tripService";

export default function FleetChart() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    tripService.list().then((next) => { if (active) setTrips(next); }).catch(() => { /* optional dashboard chart */ }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (4 - index), 1);
      const count = trips.filter((trip) => { const date = new Date(`${trip.trip_date}T00:00:00`); return date >= monthStart && date < monthEnd; }).length;
      return { month: monthStart.toLocaleString("en-US", { month: "short" }), trips: count };
    });
  }, [trips]);

  return <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Performance</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Fleet utilization</h2><p className="mt-1 text-sm text-slate-500">Trips recorded over the last six months</p></div><div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">{loading ? "Loading" : "6 months"}</div></div><div className="h-[300px] w-full">{loading ? <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading trip activity…</div> : <ResponsiveContainer><BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><Tooltip cursor={{ fill: "rgba(99,102,241,.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} /><Bar dataKey="trips" fill="#4f46e5" radius={[8, 8, 2, 2]} barSize={34} /></BarChart></ResponsiveContainer>}</div></div>;
}
