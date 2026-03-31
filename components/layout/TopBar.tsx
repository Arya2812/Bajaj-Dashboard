"use client";

import { Search, RefreshCw, X } from "lucide-react";

interface Props {
  title: string;
  count: number;
  loading: boolean;
  onRefresh: () => void;
  search: string;
  onSearch: (s: string) => void;
}

export default function TopBar({ title, count, loading, onRefresh, search, onSearch }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: page title */}
      <h1 className="text-lg font-bold text-slate shrink-0">{title}</h1>

      {/* Right: search + live badge + refresh */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search…"
            className="w-52 pl-8 pr-7 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 text-slate placeholder-slate-light outline-none focus:border-cobalt focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-light hover:text-slate"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700 whitespace-nowrap">
            Live — {count} retailers
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="neu-btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
          aria-label="Refresh data"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
