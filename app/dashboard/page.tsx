"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store, TrendingUp, MapPin, Map, BarChart2, RefreshCw, Filter, X,
} from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import BandDonut from "@/components/dashboard/BandDonut";
import ScoreDistBar from "@/components/dashboard/ScoreDistBar";
import TopRetailersList from "@/components/dashboard/TopRetailersList";
import CityBar from "@/components/dashboard/CityBar";
import ZoneChart from "@/components/dashboard/ZoneChart";
import { RetailerRecord } from "@/lib/google-sheets";
import { BAND_COLORS } from "@/lib/constants";

const ZONES  = ["East","West","North","South"];
const BANDS  = ["S1","S2","A1","A2","B1","B2","C"];
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

function multiSelect(
  state: string[],
  value: string,
  set: (v: string[]) => void
) {
  set(state.includes(value) ? state.filter(v => v !== value) : [...state, value]);
}

export default function DashboardPage() {
  const [data, setData]       = useState<RetailerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [filterCity,     setFilterCity]     = useState<string[]>([]);
  const [filterZone,     setFilterZone]     = useState<string[]>([]);
  const [filterBand,     setFilterBand]     = useState<string[]>([]);
  const [showFilters,    setShowFilters]    = useState(false);

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
  const allCities = [...new Set(data.map(r => r.city).filter(Boolean))].sort();

  // Apply filters
  const filtered = data.filter(r => {
    if (filterCity.length && !filterCity.includes(r.city)) return false;
    if (filterZone.length && !filterZone.includes(r.zone)) return false;
    if (filterBand.length && !filterBand.includes(r.fmr_score_band)) return false;
    return true;
  });

  // KPIs
  const total      = filtered.length;
  const avgScore   = filtered.length
    ? filtered.reduce((s, r) => s + (parseFloat(r.fmr_final_pct) || 0), 0) / filtered.length
    : 0;
  const cityCount  = new Set(filtered.map(r => r.city).filter(Boolean)).size;
  const topCity    = (() => {
    const freq: Record<string, number> = {};
    filtered.forEach(r => { if (r.city) freq[r.city] = (freq[r.city] ?? 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();
  const topBand    = (() => {
    const freq: Record<string, number> = {};
    filtered.forEach(r => { if (r.fmr_score_band) freq[r.fmr_score_band] = (freq[r.fmr_score_band] ?? 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

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
  const cityFreq: Record<string, number> = {};
  filtered.forEach(r => { if (r.city) cityFreq[r.city] = (cityFreq[r.city] ?? 0) + 1; });
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

  const hasFilters = filterCity.length || filterZone.length || filterBand.length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate">Analytics Overview</h1>
          <p className="text-sm text-slate-light mt-0.5">Retailer intelligence for Bajaj Electricals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`neu-btn-outline flex items-center gap-2 px-4 py-2 text-sm relative ${hasFilters ? "border-cobalt" : ""}`}
          >
            <Filter size={14} />
            Filters
            {hasFilters ? (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cobalt text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {filterCity.length + filterZone.length + filterBand.length}
              </span>
            ) : null}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="neu-btn flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="neu-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate text-sm">Filter Retailers</p>
            {hasFilters && (
              <button
                onClick={() => { setFilterCity([]); setFilterZone([]); setFilterBand([]); }}
                className="text-xs text-cobalt hover:underline flex items-center gap-1"
              >
                <X size={12} /> Reset all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City */}
            <div>
              <p className="text-xs font-medium text-slate-light mb-2 uppercase tracking-wide">City</p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {allCities.map(c => (
                  <button
                    key={c}
                    onClick={() => multiSelect(filterCity, c, setFilterCity)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      filterCity.includes(c)
                        ? "bg-cobalt text-white border-cobalt"
                        : "neu-sm border-transparent text-slate-light hover:text-slate"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
            {/* Zone */}
            <div>
              <p className="text-xs font-medium text-slate-light mb-2 uppercase tracking-wide">Zone</p>
              <div className="flex flex-wrap gap-1.5">
                {ZONES.map(z => (
                  <button
                    key={z}
                    onClick={() => multiSelect(filterZone, z, setFilterZone)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      filterZone.includes(z)
                        ? "bg-cobalt text-white border-cobalt"
                        : "neu-sm border-transparent text-slate-light hover:text-slate"
                    }`}
                  >{z}</button>
                ))}
              </div>
            </div>
            {/* Band */}
            <div>
              <p className="text-xs font-medium text-slate-light mb-2 uppercase tracking-wide">Score Band</p>
              <div className="flex flex-wrap gap-1.5">
                {BANDS.map(b => (
                  <button
                    key={b}
                    onClick={() => multiSelect(filterBand, b, setFilterBand)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-bold ${
                      filterBand.includes(b)
                        ? "text-white border-transparent"
                        : "neu-sm border-transparent text-slate-light hover:text-slate"
                    }`}
                    style={filterBand.includes(b) ? { background: BAND_COLORS[b] } : {}}
                  >{b}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <KpiCard title="Total Retailers"  value={total}                       icon={Store}      accent="#0052A3" />
            <KpiCard title="Avg Score"        value={`${(avgScore*100).toFixed(1)}%`} icon={TrendingUp}  accent="#2A7ADE" />
            <KpiCard title="Top City"         value={topCity}                     icon={MapPin}     accent="#22C55E" sub={`${cityFreq[topCity] ?? 0} retailers`} />
            <KpiCard title="Total Cities"     value={cityCount}                   icon={Map}        accent="#F59E0B" />
            <KpiCard title="Top Band"         value={topBand}                     icon={BarChart2}  accent={BAND_COLORS[topBand] ?? "#aaa"} />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            <BandDonut   data={bandData}  />
            <ScoreDistBar data={scoreDist} />
            <ZoneChart   data={zoneData}  />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopRetailersList retailers={topRetailers} />
            <CityBar data={cityBarData} />
          </div>
        </>
      )}
    </div>
  );
}
