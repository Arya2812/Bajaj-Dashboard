"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store, TrendingUp, MapPin, Map, BarChart2, RefreshCw, ChevronDown,
} from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import BandDonut from "@/components/dashboard/BandDonut";
import ScoreDistBar from "@/components/dashboard/ScoreDistBar";
import TopRetailersList from "@/components/dashboard/TopRetailersList";
import CityBar from "@/components/dashboard/CityBar";
import ZoneChart from "@/components/dashboard/ZoneChart";
import TopBar from "@/components/layout/TopBar";
import { RetailerRecord } from "@/lib/google-sheets";
import { BAND_COLORS } from "@/lib/constants";

const ZONES = ["East", "West", "North", "South"];
const BANDS = ["S1", "S2", "A1", "A2", "B1", "B2", "C"];
const SCORE_RANGES = [
  { label: "0–20%",   min: 0,    max: 0.20 },
  { label: "20–40%",  min: 0.20, max: 0.40 },
  { label: "40–52%",  min: 0.40, max: 0.52 },
  { label: "52–60%",  min: 0.52, max: 0.60 },
  { label: "60–68%",  min: 0.60, max: 0.68 },
  { label: "68–75%",  min: 0.68, max: 0.75 },
  { label: "75–85%",  min: 0.75, max: 0.85 },
  { label: "85–100%", min: 0.85, max: 1.01 },
];

const PILL_SELECT = "text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate cursor-pointer outline-none hover:border-cobalt transition-colors appearance-none pr-7";

interface SelectPillProps {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}

function SelectPill({ value, onChange, children }: SelectPillProps) {
  return (
    <div className="relative inline-flex items-center">
      <select value={value} onChange={e => onChange(e.target.value)} className={PILL_SELECT}>
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-light" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]       = useState<RetailerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  const [filterCity,     setFilterCity]     = useState("");
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

  // Derived filter options
  const allCities     = [...new Set(data.map(r => r.city).filter(Boolean))].sort();
  const allCategories = [...new Set(data.map(r => r.fmr_final_category).filter(Boolean))].sort();

  // Apply filters
  const filtered = data.filter(r => {
    if (filterCity     && r.city               !== filterCity)     return false;
    if (filterZone     && r.zone               !== filterZone)     return false;
    if (filterBand     && r.fmr_score_band     !== filterBand)     return false;
    if (filterCategory && r.fmr_final_category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!Object.values(r).some(v => v.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // KPIs
  const total    = filtered.length;
  const avgScore = filtered.length
    ? filtered.reduce((s, r) => s + (parseFloat(r.fmr_final_pct) || 0), 0) / filtered.length
    : 0;
  const cityCount = new Set(filtered.map(r => r.city).filter(Boolean)).size;
  const cityFreq: Record<string, number> = {};
  filtered.forEach(r => { if (r.city) cityFreq[r.city] = (cityFreq[r.city] ?? 0) + 1; });
  const topCity = Object.entries(cityFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const bandFreq: Record<string, number> = {};
  filtered.forEach(r => { if (r.fmr_score_band) bandFreq[r.fmr_score_band] = (bandFreq[r.fmr_score_band] ?? 0) + 1; });
  const topBand = Object.entries(bandFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Band donut data
  const bandData = BANDS.map(b => ({
    name: b,
    value: filtered.filter(r => r.fmr_score_band === b).length,
  })).filter(d => d.value > 0);

  // Score dist data
  const scoreDist = SCORE_RANGES.map(sr => ({
    range: sr.label,
    count: filtered.filter(r => {
      const p = parseFloat(r.fmr_final_pct) || 0;
      return p >= sr.min && p < sr.max;
    }).length,
  }));

  // Top retailers sorted by score
  const topRetailers = [...filtered].sort(
    (a, b) => (parseFloat(b.fmr_final_pct) || 0) - (parseFloat(a.fmr_final_pct) || 0)
  );

  // City bar
  const cityBarData = Object.entries(cityFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => ({ city, count }));

  // Zone chart
  const zoneData = ZONES.map(zone => {
    const zr = filtered.filter(r => r.zone === zone);
    const avg = zr.length
      ? zr.reduce((s, r) => s + (parseFloat(r.fmr_final_pct) || 0), 0) / zr.length
      : 0;
    return { zone, count: zr.length, avg_score: Math.round(avg * 1000) / 1000 };
  });

  const hasFilters = !!(filterCity || filterZone || filterBand || filterCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#EBEFF5]">
      {/* Sticky top bar */}
      <TopBar
        title="Overview"
        count={data.length}
        loading={loading}
        onRefresh={fetchData}
        search={search}
        onSearch={setSearch}
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-light uppercase tracking-wide">Filter:</span>

        <SelectPill value={filterCity} onChange={setFilterCity}>
          <option value="">All Cities</option>
          {allCities.map(c => <option key={c} value={c}>{c}</option>)}
        </SelectPill>

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
            onClick={() => { setFilterCity(""); setFilterZone(""); setFilterBand(""); setFilterCategory(""); }}
            className="text-xs text-cobalt hover:underline font-medium ml-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="px-6 py-5">
        {error && (
          <div className="neu-card p-4 mb-6 border border-red-200 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-light">
            <RefreshCw size={24} className="animate-spin mr-2" /> Loading data...
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <KpiCard title="Total Retailers"  value={total}                            icon={Store}      accent="#0052A3" />
              <KpiCard title="Avg Score"        value={`${(avgScore * 100).toFixed(1)}%`} icon={TrendingUp}  accent="#2A7ADE" />
              <KpiCard title="Top City"         value={cityFreq[topCity] ?? 0}           icon={MapPin}     accent="#22C55E" sub={topCity} />
              <KpiCard title="Total Cities"     value={cityCount}                        icon={Map}        accent="#F59E0B" />
              <KpiCard title="Top Band"         value={topBand}                          icon={BarChart2}  accent={BAND_COLORS[topBand] ?? "#aaa"} />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
              <BandDonut        data={bandData} />
              <ScoreDistBar     data={scoreDist} />
              <TopRetailersList retailers={topRetailers} />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CityBar   data={cityBarData} />
              <ZoneChart data={zoneData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
