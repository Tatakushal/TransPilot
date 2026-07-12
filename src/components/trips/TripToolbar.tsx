import { Plus } from "lucide-react";

interface Props {
  onCreateTrip?: () => void;
}

export default function TripToolbar({ onCreateTrip }: Props) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Trip Management</h1>

        <p className="mt-2 text-slate-500">
          Dispatch, monitor and manage active trips.
        </p>
      </div>

      <button
        onClick={onCreateTrip}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Plus size={18} />
        Create Trip
      </button>
    </div>
  );
}
