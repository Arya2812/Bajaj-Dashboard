"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { RetailerRecord } from "@/lib/google-sheets";
import { BAND_COLORS } from "@/lib/constants";
import RetailerInsightsDrawer from "@/components/RetailerInsightsDrawer";

type SortDir = "asc" | "desc";

const BANDS = ["S1", "S2", "A1", "A2", "B1", "B2", "C"];
const ZONES = ["East", "West", "North", "South"];

const PILL_SELECT = "text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-slate cursor-pointer outline-none hover:border-cobalt transition-colors appearance-none pr-7";

const COLS: { key: keyof RetailerRecord; label: string }[] = [
  { key: "retailer_name",        label: "SHOP NAME"   },
  { key: "city",                 label: "CITY"        },
  { key: "zone",                 label: "ZONE"        },
  { key: "fmr_final_pct",        label: "SCORE %"     },
  { key: "fmr_score_band",       label: "BAND"        },
  { key: "final_environment_cluster", label: "CLUSTER"         },
  { key: "bajaj_potential_tier",      label: "BAJAJ POTENTIAL" },
  { key: "fmr_opportunity_type",      label: "OPP. TYPE"       },
  { key: "timestamp",            label: "DATE"        },
];

function formatDate(ts: string): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return ts;
  }
}

export default function RetailersPage() {
  const [data,     setData]     = useState<RetailerRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<keyof RetailerRecord>("fmr_final_pct");
  const [sortDir,  setSortDir]  = useState<SortDir>("desc");
  const [selected, setSelected] = useState<RetailerRecord | null>(null);

  const [filterCity, setFilterCity] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterBand, setFilterBand] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sheets");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: keyof RetailerRecord) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Derived city options
  const allCities = [...new Set(data.map(r => r.city).filter(Boolean))].sort();

  const filtered = data
    .filter(r => {
      if (filterCity && r.city           !== filterCity) return false;
      if (filterZone && r.zone           !== filterZone) return false;
      if (filterBand && r.fmr_score_band !== filterBand) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!Object.values(r).some(v => v.toLowerCase().includes(q))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      const numA = parseFloat(av); const numB = parseFloat(bv);
      if (!isNaN(numA) && !isNaN(numB)) return sortDir === "asc" ? numA - numB : numB - numA;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const hasFilters = !!(filterCity || filterZone || filterBand);

  // Download CSV of current filtered data
  const downloadCsv = () => {
    const headers = COLS.map(c => c.label);
    const rows = filtered.map(r => [
      r.retailer_name,
      r.city,
      r.zone,
      r.fmr_final_pct ? `${(parseFloat(r.fmr_final_pct) * 100).toFixed(1)}%` : "—",
      r.fmr_score_band,
      r.final_environment_cluster,
      r.bajaj_potential_tier,
      r.fmr_opportunity_type,
      formatDate(r.timestamp),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "retailers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EBEFF5]" style={{ marginRight: selected ? 440 : 0, transition: "margin-right 0.3s ease" }}>
      {/* Sticky top bar */}
      <TopBar
        title="All Retailers"
        count={data.length}
        loading={loading}
        onRefresh={fetchData}
        search={search}
        onSearch={setSearch}
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-light uppercase tracking-wide">Filter:</span>

        {/* City */}
        <div className="relative inline-flex items-center">
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className={PILL_SELECT}>
            <option value="">All Cities</option>
            {allCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-light" />
        </div>

        {/* Zone */}
        <div className="relative inline-flex items-center">
          <select value={filterZone} onChange={e => setFilterZone(e.target.value)} className={PILL_SELECT}>
            <option value="">All Zones</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-light" />
        </div>

        {/* Band */}
        <div className="relative inline-flex items-center">
          <select value={filterBand} onChange={e => setFilterBand(e.target.value)} className={PILL_SELECT}>
            <option value="">All Bands</option>
            {BANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-light" />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setFilterCity(""); setFilterZone(""); setFilterBand(""); }}
            className="text-xs text-cobalt hover:underline font-medium ml-1"
          >
            Reset
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Download Excel (CSV) */}
        <button
          onClick={downloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <Download size={13} />
          Download Excel
        </button>
      </div>

      {/* Table card */}
      <div className="mx-6 mt-4 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
          <span className="text-sm font-bold text-slate">All Retailers</span>
          <span className="text-xs font-semibold text-slate-light bg-gray-100 rounded-full px-2.5 py-0.5">
            {filtered.length} entries
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-light">
            <svg className="animate-spin mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-light">
                        {col.label}
                        {sortKey === col.key ? (
                          sortDir === "asc"
                            ? <ChevronUp   size={11} className="text-cobalt" />
                            : <ChevronDown size={11} className="text-cobalt" />
                        ) : (
                          <ChevronDown size={11} className="opacity-20" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const band  = r.fmr_score_band;
                  const color = BAND_COLORS[band] ?? "#aaa";
                  const pct   = parseFloat(r.fmr_final_pct) || 0;
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelected(r)}
                    >
                      {/* SHOP NAME */}
                      <td className="px-4 py-3 font-semibold text-slate max-w-[180px] truncate">{r.retailer_name || "—"}</td>
                      {/* CITY */}
                      <td className="px-4 py-3 text-slate-light text-xs">{r.city || "—"}</td>
                      {/* ZONE */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EBEFF5] text-slate font-medium">{r.zone || "—"}</span>
                      </td>
                      {/* SCORE % */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                            />
                          </div>
                          <span className="text-xs font-semibold" style={{ color }}>{(pct * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      {/* BAND */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: color }}>
                          {band || "—"}
                        </span>
                      </td>
                      {/* CLUSTER */}
                      <td className="px-4 py-3 text-xs text-slate-light max-w-[180px] truncate">{r.final_environment_cluster || "—"}</td>
                      {/* BAJAJ POTENTIAL */}
                      <td className="px-4 py-3 text-xs text-slate">{r.bajaj_potential_tier || "—"}</td>
                      {/* OPP. TYPE */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-cobalt">{r.fmr_opportunity_type || "—"}</span>
                      </td>
                      {/* DATE */}
                      <td className="px-4 py-3 text-xs text-slate-light whitespace-nowrap">{formatDate(r.timestamp)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length} className="px-4 py-12 text-center text-slate-light">
                      {search || hasFilters ? "No retailers match your filters." : "No retailer data yet. Add one using the form!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <RetailerInsightsDrawer retailer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
