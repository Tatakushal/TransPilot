import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-[88px] bg-white border-b border-gray-200 px-10 flex items-center justify-between gap-10 flex-shrink-0">
      <div className="min-w-0">
        <h1 className="text-4xl  font-bold tracking-tight whitespace-nowrap">
          Operations Center
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Monitor your fleet, drivers and active operations.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search..."
            className="pl-10 w-80 h-11 rounded-xl border border-gray-200 bg-gray-50 outline-none px-4"
          />
        </div>

        <button className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <Bell size={18} />
        </button>

        <div className="w-11 h-11 rounded-full bg-indigo-600" />
      </div>
    </header>
  );
}
