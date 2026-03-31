"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props { data: { range: string; count: number }[] }

const COLORS = ["#EF4444","#F97316","#F59E0B","#84CC16","#22C55E","#2A7ADE","#0052A3","#003d7a"];

export default function ScoreDistBar({ data }: Props) {
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Score Distribution</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#6B7A84" }} />
          <YAxis tick={{ fontSize: 10, fill: "#6B7A84" }} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
