import StatusBadge from "../ui/StatusBadge";

const drivers = [
  {
    name: "Alex Johnson",
    license: "DL-982134",
    safety: 95,
    status: "Available",
  },
  {
    name: "Robert Smith",
    license: "DL-453221",
    safety: 81,
    status: "On Trip",
  },
  {
    name: "Kevin Martin",
    license: "DL-112211",
    safety: 62,
    status: "Suspended",
  },
];

export default function DriverTable() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-5">Driver</th>
            <th className="text-left">License</th>
            <th className="text-left">Safety Score</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr
              key={driver.license}
              className="border-t hover:bg-slate-50 transition-colors"
            >
              <td className="p-5 font-medium">{driver.name}</td>

              <td>{driver.license}</td>

              <td>{driver.safety}</td>

              <td>
                <StatusBadge status={driver.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
