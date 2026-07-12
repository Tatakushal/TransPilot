import AppShell from "@/components/layout/AppShell";

const fuelLogs = [
  {
    vehicle: "Volvo FH16",
    litres: 120,
    cost: "₹12,500",
    date: "12 Jul 2026",
  },
  {
    vehicle: "Tata Prima",
    litres: 90,
    cost: "₹9,450",
    date: "11 Jul 2026",
  },
];

export default function FuelPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Fuel & Expenses
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor fuel consumption and operational costs.
            </p>
          </div>

          <button className="rounded-xl bg-indigo-600 px-5 py-3 text-white">
            + Add Fuel Log
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Total Fuel Cost</p>

            <h2 className="mt-3 text-3xl font-bold">₹2.45L</h2>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Fuel Consumed</p>

            <h2 className="mt-3 text-3xl font-bold">5,860 L</h2>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Avg Cost / Litre</p>

            <h2 className="mt-3 text-3xl font-bold">₹104</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Vehicle</th>

                <th className="px-6 py-4 text-left">Litres</th>

                <th className="px-6 py-4 text-left">Cost</th>

                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {fuelLogs.map((log) => (
                <tr key={log.vehicle} className="border-t">
                  <td className="px-6 py-5">{log.vehicle}</td>

                  <td>{log.litres}</td>

                  <td>{log.cost}</td>

                  <td>{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
