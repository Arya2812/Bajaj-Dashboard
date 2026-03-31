"use client";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { zone: string; count: number; avg_score: number }[];
}

export default function ZoneChart({ data }: Props) {
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Zone Performance</p>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
          <XAxis dataKey="zone" tick={{ fontSize: 11, fill: "#6B7A84" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#6B7A84" }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={v => `${(v*100).toFixed(0)}%`} tick={{ fontSize: 10, fill: "#6B7A84" }} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number, name: string) =>
              name === "avg_score" ? [`${(val*100).toFixed(1)}%`, "Avg Score"] : [val, "Count"]
            }
          />
          <Legend
            formatter={(value) => <span className="text-xs text-slate-light">{value === "avg_score" ? "Avg Score %" : "Count"}</span>}
          />
          <Bar yAxisId="left" dataKey="count" fill="#EBEFF5" stroke="#c8cfd8" radius={[4,4,0,0]} name="count" />
          <Line yAxisId="right" type="monotone" dataKey="avg_score" stroke="#2A7ADE" strokeWidth={2.5} dot={{ fill: "#0052A3", r: 4 }} name="avg_score" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
