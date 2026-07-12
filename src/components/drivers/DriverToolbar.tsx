import { Plus, Search } from "lucide-react";

export default function DriverToolbar() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          placeholder="Search drivers..."
          className="w-80 h-11 rounded-xl border border-gray-200 pl-11 bg-white outline-none"
        />
      </div>

      <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-300">
        <Plus size={18} />
        Add Driver
      </button>
    </div>
  );
}
