export default function MaintenanceAlerts() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Maintenance Alerts</h2>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-red-50 p-4">
          Volvo FH16 — Oil Change Due
        </div>

        <div className="rounded-2xl bg-yellow-50 p-4">
          Tata Prima — Brake Inspection
        </div>
      </div>
    </div>
  );
}
