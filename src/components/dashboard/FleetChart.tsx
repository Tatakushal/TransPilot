import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", trips: 42 }, { month: "Feb", trips: 51 }, { month: "Mar", trips: 48 },
  { month: "Apr", trips: 66 }, { month: "May", trips: 72 }, { month: "Jun", trips: 81 },
];

export default function FleetChart() {
  return <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
    <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Performance</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Fleet utilization</h2><p className="mt-1 text-sm text-slate-500">Trips completed over the last six months</p></div><div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">6 months</div></div>
    <div className="h-[300px] w-full"><ResponsiveContainer><BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><Tooltip cursor={{ fill: "rgba(99,102,241,.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} /><Bar dataKey="trips" fill="#4f46e5" radius={[8, 8, 2, 2]} barSize={34} /></BarChart></ResponsiveContainer></div>
  </div>;
}
