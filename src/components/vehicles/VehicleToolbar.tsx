import { Plus, Search } from "lucide-react";

export default function VehicleToolbar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          placeholder="Search vehicles..."
          className="w-80 h-11 rounded-xl border border-gray-200 bg-white pl-11 pr-4 outline-none"
        />
      </div>

      <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-300">
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  );
}
