"use client";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
}

export default function KpiCard({ title, value, sub, icon: Icon, accent = "#2A7ADE" }: Props) {
  return (
    <div className="neu-card p-5 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-light uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: "#3A4750" }}>{value}</p>
        {sub && <p className="text-xs text-slate-light mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
