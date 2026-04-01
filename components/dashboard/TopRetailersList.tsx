"use client";
import { BAND_COLORS } from "@/lib/constants";
import { RetailerRecord } from "@/lib/google-sheets";

interface Props { retailers: RetailerRecord[] }

export default function TopRetailersList({ retailers }: Props) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate">Top Retailers</p>
        <span className="text-[11px] text-slate-light bg-[#F0F4F8] px-2 py-0.5 rounded-full">
          Top {Math.min(retailers.length, 10)}
        </span>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto">
        {retailers.slice(0, 10).map((r, i) => {
          const pct   = parseFloat(r.fmr_final_pct) || 0;
          const band  = r.fmr_score_band || "C";
          const color = BAND_COLORS[band] ?? "#aaa";
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors group"
            >
              {/* Rank */}
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: i < 3 ? `${color}18` : "#F0F4F8", color: i < 3 ? color : "#6B7A84" }}
              >
                {i + 1}
              </span>

              {/* Name + location */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate truncate leading-tight">
                  {r.retailer_name || "—"}
                </p>
                <p className="text-[10px] text-slate-light truncate leading-tight mt-0.5">
                  {[r.city, r.state].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Band tag */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                style={{ background: `${color}18`, color }}
              >
                {band}
              </span>

              {/* Score */}
              <span
                className="text-xs font-bold flex-shrink-0 w-12 text-right"
                style={{ color }}
              >
                {(pct * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
        {retailers.length === 0 && (
          <p className="text-sm text-slate-light text-center py-8">No data available.</p>
        )}
      </div>
    </div>
  );
}
