"use client";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon?: unknown; // kept for backwards compat, not rendered
  accent?: string;
}

export default function KpiCard({ title, value, sub, accent = "#2A7ADE" }: Props) {
  return (
    <div
      className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-1"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-light">{title}</p>
      <p className="text-[2rem] font-bold leading-tight mt-0.5" style={{ color: accent }}>{value}</p>
      {sub && (
        <p className="text-xs text-slate-light mt-0.5 truncate">{sub}</p>
      )}
    </div>
  );
}
