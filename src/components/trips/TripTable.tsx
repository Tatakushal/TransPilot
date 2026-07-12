import StatusBadge from "@/components/ui/StatusBadge";

const trips = [
  {
    id: "TR-1001",
    vehicle: "Volvo FH16",
    driver: "Alex",
    cargo: "12 Tons",
    status: "Dispatched",
  },
  {
    id: "TR-1002",
    vehicle: "Tata Prima",
    driver: "Robert",
    cargo: "8 Tons",
    status: "Completed",
  },
];

export default function TripTable() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="w-[140px] px-6 py-4 text-left">Trip</th>

            <th className="w-[220px] px-6 py-4 text-left">Vehicle</th>

            <th className="w-[220px] px-6 py-4 text-left">Driver</th>

            <th className="w-[320px] px-6 py-4 text-left">Route</th>

            <th className="w-[180px] px-6 py-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr
              key={trip.id}
              className="border-t hover:bg-slate-50 transition-colors"
            >
              <td className="p-5">{trip.id}</td>
              <td>{trip.vehicle}</td>
              <td>{trip.driver}</td>
              <td>{trip.cargo}</td>
              <td>
                <StatusBadge status={trip.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
