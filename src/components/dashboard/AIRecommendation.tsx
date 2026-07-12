import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import AIReportModal from "./AIReportModal";

export default function AIRecommendation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3">
                <Sparkles size={22} />
              </div>

              <div>
                <p className="text-sm uppercase tracking-widest text-indigo-100">
                  AI Recommendation
                </p>

                <h2 className="text-3xl font-bold">
                  Fleet Intelligence Summary
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-lg">
              <p>
                🚛 Two vehicles require preventive maintenance within the next 5
                days.
              </p>

              <p>
                🛡 Driver Rahul achieved a safety score of <b>98%</b> this week.
              </p>

              <p>
                ⛽ Fleet utilization can improve by approximately <b>14%</b> by
                reassigning idle vehicles.
              </p>

              <p>
                📈 Overall fleet health is operating at <b>94%</b>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-indigo-700 transition hover:scale-105"
          >
            Generate AI Report
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <AIReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
