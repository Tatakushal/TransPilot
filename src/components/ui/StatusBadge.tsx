interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const colors: Record<string, string> = {
    Available: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",
    "On Trip": "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Maintenance: "bg-red-100 text-red-700",
    Suspended: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
