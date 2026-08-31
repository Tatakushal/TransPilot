import { Plus, Search, X, SlidersHorizontal } from "lucide-react";

interface Props { search: string; onSearch: (value: string) => void; onAdd: () => void; }

export default function VehicleToolbar({ search, onSearch, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search registration, model or type..." className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" aria-label="Search vehicles" />
          {search && <button type="button" onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Clear search"><X size={16} /></button>}
        </div>
        <button type="button" className="hidden h-12 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 md:flex"><SlidersHorizontal size={17} /> Filters</button>
      </div>
      <button type="button" onClick={onAdd} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"><Plus size={18} /> Add Vehicle</button>
    </div>
  );
}
