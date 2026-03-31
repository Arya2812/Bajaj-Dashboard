"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, ChevronUp, ChevronDown, X } from "lucide-react";
import { RetailerRecord } from "@/lib/google-sheets";
import { BAND_COLORS } from "@/lib/constants";

type SortDir = "asc" | "desc";

const COLS: { key: keyof RetailerRecord; label: string }[] = [
  { key: "retailer_name",       label: "Retailer"        },
  { key: "city",                label: "City"            },
  { key: "state",               label: "State"           },
  { key: "zone",                label: "Zone"            },
  { key: "final_environment_cluster", label: "Cluster"   },
  { key: "fmr_score_band",      label: "Band"            },
  { key: "fmr_final_pct",       label: "Score %"         },
  { key: "fmr_final_category",  label: "Category"        },
  { key: "fmr_opportunity_type",label: "Opp. Type"       },
  { key: "bajaj_potential_tier",label: "Bajaj Potential"  },
];

export default function RetailersPage() {
  const [data,    setData]    = useState<RetailerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [sortKey, setSortKey] = useState<keyof RetailerRecord>("fmr_final_pct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<RetailerRecord | null>(null);

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

  const filtered = data
    .filter(r => {
      const q = search.toLowerCase();
      return !q || Object.values(r).some(v => v.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      const numA = parseFloat(av); const numB = parseFloat(bv);
      if (!isNaN(numA) && !isNaN(numB)) return sortDir === "asc" ? numA - numB : numB - numA;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate">All Retailers</h1>
          <p className="text-sm text-slate-light mt-0.5">{data.length} total entries</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="neu-btn flex items-center gap-2 px-4 py-2 text-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search retailers, cities, bands…"
          className="w-full neu-input pl-9 text-sm"
          style={{ background: "#EBEFF5" }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-slate">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-light">
          <RefreshCw size={20} className="animate-spin mr-2" /> Loading…
        </div>
      ) : (
        <div className="neu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBEFF5]">
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left cursor-pointer select-none hover:bg-[#EBEFF5] transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-light">
                        {col.label}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? <ChevronUp size={12} className="text-cobalt" /> : <ChevronDown size={12} className="text-cobalt" />
                        ) : <ChevronDown size={12} className="opacity-20" />}
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
                      className="border-b border-[#EBEFF5] hover:bg-[#f5f7fb] cursor-pointer transition-colors"
                      onClick={() => setSelected(r)}
                    >
                      <td className="px-4 py-3 font-semibold text-slate max-w-[160px] truncate">{r.retailer_name || "—"}</td>
                      <td className="px-4 py-3 text-slate-light">{r.city}</td>
                      <td className="px-4 py-3 text-slate-light">{r.state}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EBEFF5] text-slate font-medium">{r.zone}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-light text-xs max-w-[200px] truncate">{r.final_environment_cluster}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: color }}>{band || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[#EBEFF5] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct*100}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color }}>{(pct*100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate">{r.fmr_final_category}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-cobalt">{r.fmr_opportunity_type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-light">{r.bajaj_potential_tier}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length} className="px-4 py-12 text-center text-slate-light">
                      {search ? "No retailers match your search." : "No retailer data yet. Add one using the form!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="neu-card p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate">{selected.retailer_name}</h2>
                <p className="text-sm text-slate-light">{selected.city}, {selected.state} · {selected.zone} Zone</p>
              </div>
              <button onClick={() => setSelected(null)} className="neu-sm p-2">
                <X size={16} className="text-slate-light" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ["Environment Cluster", selected.final_environment_cluster],
                ["Bajaj Potential",     `${selected.bajaj_potential_tier} (${(parseFloat(selected.bajaj_overall_potential || "0")*100).toFixed(1)}%)`],
                ["FMR Score",          `${(parseFloat(selected.fmr_final_pct||"0")*100).toFixed(1)}% — ${selected.fmr_score_band}`],
                ["Final Category",     selected.fmr_final_category],
                ["Opportunity Type",   selected.fmr_opportunity_type],
                ["Override Flag",      selected.fmr_override_flag],
                ["Est. Revenue",       selected.est_revenue_band],
                ["Submitted By",       selected.submitted_by],
              ].map(([label, val]) => (
                <div key={String(label)} className="neu-inset p-3 rounded-xl">
                  <p className="text-[11px] uppercase font-semibold tracking-wide text-slate-light">{label}</p>
                  <p className="text-sm font-semibold text-slate mt-0.5 break-words">{val || "—"}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-light mb-3">Recommendations</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["External Branding", selected.recommend_external_branding],
                  ["Internal Branding", selected.recommend_internal_branding],
                  ["Fixtures",          selected.recommend_fixtures],
                  ["Digital",           selected.recommend_digital],
                  ["Premium",           selected.recommend_premium],
                  ["Lite",              selected.recommend_lite],
                ].map(([label, val]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: val === "Yes" ? "#22C55E11" : "#EBEFF5",
                      border: `1px solid ${val === "Yes" ? "#22C55E33" : "transparent"}`,
                    }}
                  >
                    <p className="text-[10px] text-slate-light">{label}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: val === "Yes" ? "#16a34a" : "#6B7A84" }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
