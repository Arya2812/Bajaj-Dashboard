"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import TopBar from "@/components/layout/TopBar";
import KpiCard from "@/components/dashboard/KpiCard";
import { RetailerRecord } from "@/lib/google-sheets";
import { computeEnvDimensionScores } from "@/lib/scoring-engine";

// ── Constants ───────────────────────────────────────────────────────────────

const ZONES = ["East", "West", "North", "South"];
const BANDS = ["S1", "S2", "A1", "A2", "B1", "B2", "C"];

const TIER_COLORS: Record<string, string> = {
  "High Potential":      "#22C55E",
  "Medium Potential":    "#2A7ADE",
  "Selective Potential": "#F59E0B",
  "Low Potential":       "#EF4444",
};

const DIM_CONFIG = [
  { key: "category_opportunity", label: "Category Opportunity", weight: 30, color: "#0052A3" },
  { key: "display_potential",    label: "Display Potential",    weight: 20, color: "#2A7ADE" },
  { key: "visibility_potential", label: "Visibility Potential", weight: 15, color: "#22C55E" },
  { key: "consumer_influence",   label: "Consumer Influence",   weight: 15, color: "#8B5CF6" },
  { key: "growth_headroom",      label: "Growth Headroom",      weight: 10, color: "#F59E0B" },
  { key: "catchment_power",      label: "Catchment Power",      weight: 10, color: "#EF4444" },
];

const CLUSTER_COLORS = [
  "#0052A3", "#2A7ADE", "#22C55E", "#8B5CF6",
  "#F59E0B", "#EF4444", "#06B6D4", "#84CC16",
];

const DIST_COLORS = ["#0052A3", "#2A7ADE", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function freqMap(arr: string[]): Record<string, number> {
  const m: Record<string, number> = {};
  arr.forEach(v => { if (v) m[v] = (m[v] ?? 0) + 1; });
  return m;
}

function topEntry(m: Record<string, number>): string {
  return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

const PILL_CLS =
  "text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate cursor-pointer outline-none hover:border-cobalt transition-colors appearance-none pr-7";

function SelectPill({
  value, onChange, children,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select value={value} onChange={e => onChange(e.target.value)} className={PILL_CLS}>
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-light" />
    </div>
  );
}

// Reusable distribution panel (horizontal progress bars)
function DistributionPanel({ title, data }: { title: string; data: Record<string, number> }) {
  const total   = Object.values(data).reduce((s, v) => s + v, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      <p className="text-sm font-semibold text-slate mb-4">{title}</p>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-light text-center py-6">No data</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([name, count], i) => {
            const pct   = total > 0 ? (count / total) * 100 : 0;
            const color = DIST_COLORS[i % DIST_COLORS.length];
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate leading-tight max-w-[68%] break-words">{name}</span>
                  <span className="text-[11px] font-bold ml-2 flex-shrink-0" style={{ color }}>
                    {count}
                    <span className="text-slate-light font-normal ml-1">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#F0F4F8]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function EnvironmentPage() {
  const [data, setData]       = useState<RetailerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [filterZone,     setFilterZone]     = useState("");
  const [filterBand,     setFilterBand]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/sheets");
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allCategories = [...new Set(data.map(r => r.fmr_final_category).filter(Boolean))].sort();

  const filtered = data.filter(r => {
    if (filterZone     && r.zone               !== filterZone)     return false;
    if (filterBand     && r.fmr_score_band     !== filterBand)     return false;
    if (filterCategory && r.fmr_final_category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!Object.values(r).some(v => v.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Retailers with environment classification data
  const envR = filtered.filter(r => r.environment_family || r.format_archetype);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const avgPotential = envR.length
    ? envR.reduce((s, r) => s + (parseFloat(r.bajaj_overall_potential) || 0), 0) / envR.length
    : 0;

  const tierFreq   = freqMap(envR.map(r => r.bajaj_potential_tier));
  const familyFreq = freqMap(envR.map(r => r.environment_family));
  const formatFreq = freqMap(envR.map(r => r.format_archetype));
  const engageFreq = freqMap(envR.map(r => r.engagement_mode));
  const ruleFreq   = freqMap(envR.map(r => r.rule_source));

  const mappedCount = ruleFreq["Mapped rule"] ?? 0;
  const mappedPct   = envR.length ? (mappedCount / envR.length) * 100 : 0;

  // ── Cluster Breakdown ─────────────────────────────────────────────────────
  const clusterMap: Record<string, { count: number; potSum: number }> = {};
  envR.forEach(r => {
    const c = r.final_environment_cluster;
    if (!c) return;
    if (!clusterMap[c]) clusterMap[c] = { count: 0, potSum: 0 };
    clusterMap[c].count++;
    clusterMap[c].potSum += parseFloat(r.bajaj_overall_potential) || 0;
  });
  const clusterData = Object.entries(clusterMap)
    .map(([fullName, { count, potSum }]) => ({
      name:         fullName.length > 38 ? fullName.slice(0, 36) + "…" : fullName,
      count,
      avgPotential: Math.round((potSum / count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── 6 Dimension Averages ──────────────────────────────────────────────────
  const dimSums:   Record<string, number> = {};
  const dimCounts: Record<string, number> = {};
  DIM_CONFIG.forEach(d => { dimSums[d.key] = 0; dimCounts[d.key] = 0; });

  envR.forEach(r => {
    const s = computeEnvDimensionScores({
      primary_orientation:   r.primary_orientation,
      secondary_orientation: r.secondary_orientation,
      store_format:          r.store_format,
      display_structure:     r.display_structure,
      customer_type:         r.customer_type,
      selling_behavior:      r.selling_behavior,
      store_size_band:       r.store_size_band,
      brand_presence:        r.brand_presence,
      category_depth:        r.category_depth,
      catchment_power:       r.catchment_power,
    });
    if (s) {
      DIM_CONFIG.forEach(d => {
        dimSums[d.key]   += s[d.key as keyof typeof s];
        dimCounts[d.key] += 1;
      });
    }
  });

  const topTier  = topEntry(tierFreq);
  const hasFilters = !!(filterZone || filterBand || filterCategory);

  const potColor =
    avgPotential >= 65 ? "#22C55E" :
    avgPotential >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F0F2F5" }}>

      <TopBar
        title="Environment Intelligence"
        count={data.length}
        loading={loading}
        onRefresh={fetchData}
        search={search}
        onSearch={setSearch}
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-light uppercase tracking-widest">Filter:</span>
        <SelectPill value={filterZone} onChange={setFilterZone}>
          <option value="">All Zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </SelectPill>
        <SelectPill value={filterBand} onChange={setFilterBand}>
          <option value="">All Bands</option>
          {BANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </SelectPill>
        <SelectPill value={filterCategory} onChange={setFilterCategory}>
          <option value="">All Categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </SelectPill>
        {hasFilters && (
          <button
            onClick={() => { setFilterZone(""); setFilterBand(""); setFilterCategory(""); }}
            className="text-xs font-semibold text-cobalt hover:underline ml-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-light">
            <RefreshCw size={22} className="animate-spin mr-2" />
            <span className="text-sm">Loading data…</span>
          </div>
        ) : (
          <>
            {/* ── Row 1: KPI Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard
                title="Analyzed Outlets"
                value={envR.length}
                accent="#0052A3"
              />
              <KpiCard
                title="Avg Outlet Potential"
                value={`${avgPotential.toFixed(1)}%`}
                accent={potColor}
                sub={topEntry(tierFreq)}
              />
              <KpiCard
                title="Top Potential Tier"
                value={topTier.split(" ")[0]}
                accent={TIER_COLORS[topTier] ?? "#2A7ADE"}
                sub={`${tierFreq[topTier] ?? 0} outlets`}
              />
              <KpiCard
                title="Mapped Rule %"
                value={`${mappedPct.toFixed(0)}%`}
                accent="#8B5CF6"
                sub={`${mappedCount} of ${envR.length} outlets`}
              />
              <KpiCard
                title="Top Cluster"
                value={clusterData[0]?.count ?? 0}
                accent="#22C55E"
                sub={clusterData[0]?.name ?? "—"}
              />
            </div>

            {/* ── Row 2: Classification Distributions ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <DistributionPanel title="Environment Family"  data={familyFreq} />
              <DistributionPanel title="Format Archetype"    data={formatFreq} />
              <DistributionPanel title="Engagement Mode"     data={engageFreq} />
            </div>

            {/* ── Row 3: Cluster Breakdown ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate">Environment Cluster Breakdown</p>
                  <p className="text-[11px] text-slate-light mt-0.5">Ranked by outlet count · top 8 clusters</p>
                </div>
                <span className="text-[11px] text-slate-light bg-[#F0F4F8] px-2 py-0.5 rounded-full">
                  {Object.keys(clusterMap).length} unique clusters
                </span>
              </div>
              {clusterData.length === 0 ? (
                <p className="text-sm text-slate-light text-center py-8">No cluster data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, clusterData.length * 36)}>
                  <BarChart
                    data={clusterData}
                    layout="vertical"
                    margin={{ top: 0, right: 48, left: 4, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#6B7A84" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#3A4750" }}
                      width={230}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        fontSize: 12,
                      }}
                      formatter={(val: number, name: string) =>
                        [val, name === "count" ? "Outlets" : "Avg Potential %"]
                      }
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={20}>
                      {clusterData.map((_, i) => (
                        <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Row 4: Potential Tiers + 6 Dimension Scores ──────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Potential Tier Panel */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p className="text-sm font-semibold text-slate mb-4">Potential Tier Distribution</p>
                <div className="space-y-3.5">
                  {["High Potential", "Medium Potential", "Selective Potential", "Low Potential"].map(tier => {
                    const cnt   = tierFreq[tier] ?? 0;
                    const pct   = envR.length ? (cnt / envR.length) * 100 : 0;
                    const color = TIER_COLORS[tier] ?? "#aaa";
                    return (
                      <div key={tier}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: color }}
                            />
                            <span className="text-xs font-medium text-slate">{tier}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-light">{cnt} outlets</span>
                            <span className="text-xs font-bold w-9 text-right" style={{ color }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-[#F0F4F8]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rule Source */}
                <div className="mt-5 pt-4 border-t border-[#F0F4F8]">
                  <p className="text-xs font-semibold text-slate mb-3">Classification Rule Source</p>
                  <div className="flex gap-3">
                    {Object.entries(ruleFreq).map(([src, cnt]) => (
                      <div
                        key={src}
                        className="flex-1 rounded-xl p-3 text-center"
                        style={{ background: "#F8FAFC", border: "1px solid #EEF2F7" }}
                      >
                        <p className="text-xl font-bold text-slate">{cnt}</p>
                        <p className="text-[10px] text-slate-light mt-0.5 leading-tight">{src}</p>
                      </div>
                    ))}
                    {Object.keys(ruleFreq).length === 0 && (
                      <p className="text-xs text-slate-light">No data</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 6 Dimension Avg Scores */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-slate">
                    Avg Dimension Scores
                    <span className="text-slate-light font-normal text-xs ml-1">(out of 5.0)</span>
                  </p>
                  <span className="text-[11px] text-slate-light bg-[#F0F4F8] px-2 py-0.5 rounded-full">
                    {dimCounts[DIM_CONFIG[0].key] ?? 0} outlets
                  </span>
                </div>
                <div className="space-y-4">
                  {DIM_CONFIG.map(dim => {
                    const c   = dimCounts[dim.key] ?? 0;
                    const avg = c > 0 ? dimSums[dim.key] / c : 0;
                    const pct = (avg / 5) * 100;
                    return (
                      <div key={dim.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                              style={{ background: `${dim.color}18`, color: dim.color }}
                            >
                              {dim.weight}%
                            </span>
                            <span className="text-xs font-medium text-slate">{dim.label}</span>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: dim.color }}>
                            {avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-[#F0F4F8]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${dim.color}, ${dim.color}88)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
