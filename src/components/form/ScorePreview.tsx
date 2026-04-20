import { BAND_COLORS } from "@/lib/constants";

interface DimScore { id: string; label: string; score: number }

interface Props {
  fmrPct?: number;
  band?: string;
  category?: string;
  opportunityType?: string;
  dimensionScores?: DimScore[];
  bajajPotential?: number;
  bajajTier?: string;
  cluster?: string;
}

export default function ScorePreview({
  fmrPct, band, category, opportunityType,
  dimensionScores, bajajPotential, bajajTier, cluster,
}: Props) {
  const color = band ? (BAND_COLORS[band] ?? "#aaa") : "#aaa";

  return (
    <div className="neu-card p-5 space-y-4">
      <p className="text-sm font-semibold text-slate">Live Score Preview</p>

      {bajajTier && (
        <div className="rounded-xl p-3" style={{ background: "#EBEFF5" }}>
          <p className="text-[11px] uppercase font-semibold text-slate-light tracking-wide">Environment Cluster</p>
          <p className="text-sm font-bold text-cobalt mt-0.5">{cluster}</p>
          <p className="text-xs text-slate-light mt-1">Bajaj Potential: <span className="font-bold text-slate">{bajajTier} ({((bajajPotential ?? 0) * 100).toFixed(1)}%)</span></p>
        </div>
      )}

      {band && (
        <div className="rounded-xl p-3 text-white" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}aa)` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-semibold opacity-80 tracking-wide">FMR Score</p>
              <p className="text-3xl font-bold mt-0.5">{fmrPct !== undefined ? `${(fmrPct * 100).toFixed(1)}%` : "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{band}</p>
              <p className="text-xs opacity-80">{category}</p>
            </div>
          </div>
          {opportunityType && (
            <div className="mt-2 pt-2 border-t border-white/20 text-xs font-semibold opacity-90">
              Opportunity: {opportunityType}
            </div>
          )}
        </div>
      )}

      {dimensionScores && dimensionScores.length > 0 && (
        <div className="space-y-2">
          {dimensionScores.map(ds => (
            <div key={ds.id}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[11px] text-slate-light truncate max-w-[70%]">{ds.label}</p>
                <p className="text-[11px] font-bold text-slate">{ds.score.toFixed(2)}/5</p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EBEFF5] overflow-hidden" style={{ boxShadow: "inset 1px 1px 3px #c8cfd8, inset -1px -1px 3px #ffffff" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(ds.score / 5) * 100}%`, background: "linear-gradient(90deg, #0052A3, #2A7ADE)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!band && !bajajTier && (
        <p className="text-xs text-slate-light text-center py-4">Fill in the dropdowns to see your live score</p>
      )}
    </div>
  );
}
