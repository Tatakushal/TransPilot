import AppShell from "@/components/layout/AppShell";

export default function MaintenancePage() {
  const records = [
    {
      vehicle: "Volvo FH16",
      service: "Oil Change",
      status: "In Progress",
      date: "12 Jul 2026",
    },
    {
      vehicle: "Tata Prima",
      service: "Brake Inspection",
      status: "Completed",
      date: "10 Jul 2026",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Maintenance
            </h1>

            <p className="mt-2 text-slate-500">
              Manage vehicle maintenance records.
            </p>
          </div>

          <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white">
            + Add Maintenance
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Vehicle</th>

                <th className="px-6 py-4 text-left">Service</th>

                <th className="px-6 py-4 text-left">Date</th>

                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((item) => (
                <tr key={item.vehicle} className="border-t">
                  <td className="px-6 py-5">{item.vehicle}</td>

                  <td>{item.service}</td>

                  <td>{item.date}</td>

                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
