import AppShell from "@/components/layout/AppShell";
import { Wrench, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function MaintenancePage() {
  const records = [
    {
      vehicle: "Volvo FH16",
      service: "Oil Change",
      mechanic: "John Smith",
      status: "In Progress",
      date: "12 Jul 2026",
      priority: "Medium",
    },
    {
      vehicle: "Tata Prima",
      service: "Brake Inspection",
      mechanic: "David",
      status: "Completed",
      date: "10 Jul 2026",
      priority: "High",
    },
    {
      vehicle: "Ford Transit",
      service: "Engine Diagnostics",
      mechanic: "Rahul",
      status: "Scheduled",
      date: "15 Jul 2026",
      priority: "Low",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Management</h1>

            <p className="mt-2 text-slate-500">
              Track maintenance schedules and vehicle service history.
            </p>
          </div>

          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-slate-400 px-5 py-3 font-medium text-white"
          >
            + Add Maintenance
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Wrench className="text-blue-600" />
            </div>

            <p className="mt-5 text-sm text-slate-500">Total Requests</p>

            <h2 className="mt-2 text-3xl font-bold">12</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Calendar className="text-yellow-600" />
            </div>

            <p className="mt-5 text-sm text-slate-500">Scheduled</p>

            <h2 className="mt-2 text-3xl font-bold">5</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="text-red-600" />
            </div>

            <p className="mt-5 text-sm text-slate-500">In Progress</p>

            <h2 className="mt-2 text-3xl font-bold">3</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="text-green-600" />
            </div>

            <p className="mt-5 text-sm text-slate-500">Completed</p>

            <h2 className="mt-2 text-3xl font-bold">4</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-6 py-4">Vehicle</th>

                <th className="px-6 py-4">Service</th>

                <th className="px-6 py-4">Mechanic</th>

                <th className="px-6 py-4">Priority</th>

                <th className="px-6 py-4">Date</th>

                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((item) => (
                <tr
                  key={item.vehicle}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-5 font-medium">{item.vehicle}</td>

                  <td className="px-6 py-5">{item.service}</td>

                  <td className="px-6 py-5">{item.mechanic}</td>

                  <td className="px-6 py-5">{item.priority}</td>

                  <td className="px-6 py-5">{item.date}</td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
