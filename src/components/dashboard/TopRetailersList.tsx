import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BAND_COLORS } from "@/lib/constants";
import type { RetailerRecord } from "@/lib/types";

interface Props { retailers: RetailerRecord[] }

const VISIBLE = 5;

export default function TopRetailersList({ retailers }: Props) {
  const [start, setStart] = useState(0);
  const pool    = retailers.slice(0, 10);
  const cards   = pool.slice(start, start + VISIBLE);
  const canPrev = start > 0;
  const canNext = start + VISIBLE < pool.length;

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate">Top Retailers</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-light">
            {pool.length > 0 ? `${start + 1}–${Math.min(start + VISIBLE, pool.length)} of ${pool.length}` : "0 retailers"}
          </span>
          <button
            onClick={() => setStart(s => s - 1)}
            disabled={!canPrev}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ background: canPrev ? "#F0F4F8" : "transparent" }}
          >
            <ChevronLeft size={13} className="text-slate" />
          </button>
          <button
            onClick={() => setStart(s => s + 1)}
            disabled={!canNext}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ background: canNext ? "#F0F4F8" : "transparent" }}
          >
            <ChevronRight size={13} className="text-slate" />
          </button>
        </div>
      </div>

      {pool.length === 0 ? (
        <p className="text-sm text-slate-light text-center py-6">No data available.</p>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {cards.map((r, i) => {
            const rank  = start + i + 1;
            const pct   = parseFloat(r.fmr_final_pct) || 0;
            const band  = r.fmr_score_band || "C";
            const color = BAND_COLORS[band] ?? "#aaa";
            return (
              <div
                key={i}
                className="rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden"
                style={{ background: "#F8FAFC", border: "1px solid #EEF2F7" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: rank <= 3 ? `${color}20` : "#EEF2F7", color: rank <= 3 ? color : "#9AA5B1" }}
                  >
                    {rank}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}18`, color }}>
                    {band}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate leading-tight line-clamp-2">{r.retailer_name || "—"}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "#9AA5B1" }}>{r.city || "—"}</p>
                </div>
                <p className="text-base font-bold leading-none" style={{ color }}>{(pct * 100).toFixed(1)}%</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
