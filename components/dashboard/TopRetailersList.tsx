"use client";
import { BAND_COLORS } from "@/lib/constants";
import { RetailerRecord } from "@/lib/google-sheets";

interface Props { retailers: RetailerRecord[] }

export default function TopRetailersList({ retailers }: Props) {
  return (
    <div className="neu-card p-5">
      <p className="text-sm font-semibold text-slate mb-3">Top 10 Retailers</p>
      <div className="space-y-2">
        {retailers.slice(0, 10).map((r, i) => {
          const pct = parseFloat(r.fmr_final_pct) || 0;
          const band = r.fmr_score_band || "C";
          const color = BAND_COLORS[band] ?? "#aaa";
          return (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#EBEFF5] transition-colors">
              <span className="text-xs font-bold text-slate-light w-5 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#3A4750" }}>
                  {r.retailer_name || "—"}
                </p>
                <p className="text-xs text-slate-light truncate">{r.city}, {r.state}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: color }}
                >
                  {band}
                </span>
                <span className="text-xs font-semibold" style={{ color }}>
                  {(pct * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
        {retailers.length === 0 && (
          <p className="text-sm text-slate-light text-center py-6">No retailer data yet.</p>
        )}
      </div>
    </div>
  );
}
