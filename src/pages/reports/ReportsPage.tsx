import AppShell from "@/components/layout/AppShell";
import {
  Truck,
  Route,
  Users,
  Wrench,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const stats = [
  {
    title: "Total Vehicles",
    value: "24",
    icon: Truck,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Active Trips",
    value: "12",
    icon: Route,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Drivers Available",
    value: "18",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Maintenance Due",
    value: "4",
    icon: Wrench,
    color: "bg-red-100 text-red-600",
  },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="mt-2 text-slate-500">
            Fleet performance and operational insights.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon size={22} />
                </div>

                <p className="text-sm text-slate-500">{item.title}</p>

                <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="mb-5 flex items-center gap-3">
              <TrendingUp className="text-indigo-600" />
              <h2 className="text-xl font-semibold">Fleet Utilization</h2>
            </div>

            <div className="mt-8 h-64 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              Fleet Utilization Chart
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="text-green-600" />
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>

            <div className="space-y-5 mt-8">
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-slate-500">Fleet Health Score</p>

                <h3 className="mt-2 text-3xl font-bold text-green-600">94%</h3>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-slate-500">Driver Safety Score</p>

                <h3 className="mt-2 text-3xl font-bold text-blue-600">91%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
