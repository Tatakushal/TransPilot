import { Plus, Search, X } from "lucide-react";

interface Props {
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
}

export default function VehicleToolbar({ search, onSearch, onAdd }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-96">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by registration, model or type..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-10 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          aria-label="Search vehicles"
        />
        {search && (
          <button type="button" onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      <button type="button" onClick={onAdd} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-all duration-300 hover:bg-indigo-700 hover:shadow-md">
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  );
}
