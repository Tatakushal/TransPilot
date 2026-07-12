import { Sparkles, AlertTriangle, ShieldCheck, Truck } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-600 p-3 text-white">
          <Sparkles size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold">AI Fleet Insights</h2>

          <p className="text-sm text-slate-500">
            Smart recommendations powered by TransitOps AI
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <AlertTriangle className="mt-1 text-amber-500" size={20} />

          <div>
            <p className="font-semibold">Vehicle Health Alert</p>

            <p className="text-sm text-slate-500">
              TX-123-AB requires preventive maintenance within the next 5 days.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <ShieldCheck className="mt-1 text-green-600" size={20} />

          <div>
            <p className="font-semibold">Driver Performance</p>

            <p className="text-sm text-slate-500">
              Rahul has maintained a 98 safety score with zero incidents this
              month.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Truck className="mt-1 text-indigo-600" size={20} />

          <div>
            <p className="font-semibold">Fleet Optimization</p>

            <p className="text-sm text-slate-500">
              Two idle vehicles can be reassigned to improve utilization by
              approximately 14%.
            </p>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700">
        Generate AI Fleet Report
      </button>
    </div>
  );
}
