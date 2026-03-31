"use client";

import { useMemo, useState } from "react";
import { X, MapPin, Globe, ChevronDown, ChevronUp } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { RetailerRecord } from "@/lib/google-sheets";
import { BAND_COLORS } from "@/lib/constants";
import { computeFmrScore, extractScore } from "@/lib/scoring-engine";
import { FMR_DIMENSIONS } from "@/lib/lookup-tables";

interface Props {
  retailer: RetailerRecord;
  onClose: () => void;
}

function formatDate(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const RADAR_LABELS: Record<string, string> = {
  commercial:           "Commercial Str.",
  sales_velocity:       "Sales Velocity...",
  brand_portfolio:      "Brand Portfol...",
  external_visibility:  "External Visib...",
  internal_branding:    "Internal Brand...",
  location:             "Location & Cat.",
  strategic_influence:  "Strategic Infl...",
  operational_readiness:"Operational &...",
  investment_readiness: "Investment & M...",
  compliance:           "Compliance & B...",
};

export default function RetailerInsightsDrawer({ retailer, onClose }: Props) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [openDim, setOpenDim] = useState<string | null>(null);

  const fmrResult = useMemo(() => computeFmrScore(retailer), [retailer]);
  const dimScores = fmrResult.dimension_scores;

  // Prefer recomputed values (correct even if sheet columns were out of range)
  const pct      = fmrResult.fmr_final_pct || parseFloat(retailer.fmr_final_pct) || 0;
  const band     = fmrResult.fmr_score_band || retailer.fmr_score_band || "—";
  const category = fmrResult.fmr_final_category || retailer.fmr_final_category || "—";
  const color    = BAND_COLORS[band] ?? "#aaa";

  const radarData = FMR_DIMENSIONS.map(dim => ({
    dim: RADAR_LABELS[dim.id] ?? dim.label,
    score: dimScores[dim.id] ?? 0,
    fullMark: 5,
  }));

  return (
    <div className="fixed top-0 right-0 h-screen w-[420px] z-50 flex flex-col overflow-hidden"
         style={{ background: "#F0F4F8", boxShadow: "-8px 0 32px rgba(0,0,0,0.15)" }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E4E9F0] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate truncate">{retailer.retailer_name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-light">
                <MapPin size={11} /> {retailer.city}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-light">
                <Globe size={11} /> {retailer.zone}
              </span>
              {retailer.timestamp && (
                <span className="text-xs text-slate-light">{formatDate(retailer.timestamp)}</span>
              )}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${color}22`, color }}
              >
                {category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#EBEFF5] transition-colors"
          >
            <X size={15} className="text-slate-light" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Final Score */}
          <div className="rounded-2xl p-3 text-center"
               style={{ background: "#fff", boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
            <p className="text-2xl font-black" style={{ color }}>{(pct * 100).toFixed(1)}%</p>
            <p className="text-[10px] uppercase font-semibold tracking-wide text-slate-light mt-1">Final Score</p>
          </div>
          {/* Band */}
          <div className="rounded-2xl p-3 text-center"
               style={{ background: "#fff", boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
            <p className="text-2xl font-black text-slate">{band}</p>
            <p className="text-[10px] uppercase font-semibold tracking-wide text-slate-light mt-1">Band</p>
          </div>
          {/* Category */}
          <div className="rounded-2xl p-3 text-center"
               style={{ background: "#fff", boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
            <p className="text-sm font-bold leading-tight mt-1" style={{ color }}>{category}</p>
            <p className="text-[10px] uppercase font-semibold tracking-wide text-slate-light mt-1">Category</p>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="rounded-2xl p-4 bg-white"
             style={{ boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate mb-3">
            Dimension Scores <span className="text-slate-light font-normal">(out of 5.0)</span>
          </p>
          <div className="space-y-2.5">
            {FMR_DIMENSIONS.map(dim => {
              const score = dimScores[dim.id] ?? 0;
              const barColor = score >= 3.0 ? "#2A7ADE" : color;
              return (
                <div key={dim.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11px] text-slate-light truncate max-w-[75%]">{dim.label}</p>
                    <p className="text-[11px] font-bold ml-2 flex-shrink-0" style={{ color: barColor }}>
                      {score.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden"
                       style={{ background: "#EBEFF5", boxShadow: "inset 1px 1px 3px #c8cfd8, inset -1px -1px 3px #fff" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(score / 5) * 100}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radar Profile */}
        <div className="rounded-2xl p-4 bg-white"
             style={{ boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate mb-3">Radar Profile</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E4E9F0" />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fontSize: 9, fill: "#6B7A84" }}
                />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.25}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#EF4444" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Variable Breakdown */}
        <div className="rounded-2xl overflow-hidden bg-white"
             style={{ boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate"
            onClick={() => setBreakdownOpen(o => !o)}
          >
            <span>Variable Breakdown <span className="text-slate-light font-normal normal-case">(click to expand)</span></span>
            {breakdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {breakdownOpen && (
            <div className="border-t border-[#EBEFF5]">
              {FMR_DIMENSIONS.map((dim, di) => {
                const dimScore = dimScores[dim.id] ?? 0;
                const isOpen   = openDim === dim.id;
                return (
                  <div key={dim.id} className={di > 0 ? "border-t border-[#EBEFF5]" : ""}>
                    <button
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors"
                      onClick={() => setOpenDim(isOpen ? null : dim.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate truncate text-left">{dim.label}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: (dimScore >= 3 ? "#2A7ADE" : color) + "22",
                            color: dimScore >= 3 ? "#2A7ADE" : color,
                          }}
                        >
                          {dimScore.toFixed(2)}
                        </span>
                      </div>
                      {isOpen ? <ChevronUp size={12} className="text-slate-light flex-shrink-0" /> : <ChevronDown size={12} className="text-slate-light flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 space-y-1.5 bg-[#F8FAFC]">
                        {dim.variables.map(v => {
                          const raw    = retailer[v.key] ?? "";
                          const score  = extractScore(raw);
                          const vColor = score >= 3 ? "#2A7ADE" : score === 0 ? "#aaa" : color;
                          return (
                            <div key={v.key} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: vColor }} />
                              <p className="text-[10px] text-slate-light truncate flex-1">{v.label}</p>
                              <span className="text-[10px] font-bold flex-shrink-0" style={{ color: vColor }}>
                                {score > 0 ? `${score}/5` : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="rounded-2xl p-4 bg-white"
             style={{ boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate mb-3">Overview</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Opportunity Type",   retailer.fmr_opportunity_type],
              ["Est. Revenue",       retailer.est_revenue_band],
              ["Bajaj Potential",    retailer.bajaj_potential_tier],
              ["Cluster",            retailer.final_environment_cluster],
              ["Override",           retailer.fmr_override_flag],
              ["Submitted By",       retailer.submitted_by],
            ].map(([label, val]) => (
              <div key={String(label)} className="rounded-xl p-2.5"
                   style={{ background: "#F0F4F8", boxShadow: "inset 1px 1px 3px #c8cfd8, inset -1px -1px 3px #fff" }}>
                <p className="text-[10px] uppercase font-semibold tracking-wide text-slate-light">{label}</p>
                <p className="text-xs font-semibold text-slate mt-0.5 break-words">{val || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-2xl p-4 bg-white"
             style={{ boxShadow: "4px 4px 10px #c8cfd8, -4px -4px 10px #ffffff" }}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate mb-3">Recommendations</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["External Branding", retailer.recommend_external_branding],
              ["Internal Branding", retailer.recommend_internal_branding],
              ["Fixtures",          retailer.recommend_fixtures],
              ["Digital",           retailer.recommend_digital],
              ["Premium",           retailer.recommend_premium],
              ["Lite",              retailer.recommend_lite],
            ].map(([label, val]) => (
              <div
                key={String(label)}
                className="rounded-xl p-2.5 text-center"
                style={{
                  background: val === "Yes" ? "#22C55E11" : "#F0F4F8",
                  border:     `1px solid ${val === "Yes" ? "#22C55E33" : "transparent"}`,
                }}
              >
                <p className="text-[10px] text-slate-light">{label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: val === "Yes" ? "#16a34a" : "#6B7A84" }}>{val || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
