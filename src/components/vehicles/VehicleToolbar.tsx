import { Plus, Search } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export default function VehicleToolbar({ onAdd }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search vehicles..."
          className="h-11 w-80 rounded-xl border border-gray-200 bg-white pl-11 pr-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-all duration-300 hover:bg-indigo-700 hover:shadow-md"
      >
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  );
}
