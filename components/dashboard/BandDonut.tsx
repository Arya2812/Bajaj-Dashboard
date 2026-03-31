"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BAND_COLORS } from "@/lib/constants";

interface Props { data: { name: string; value: number }[] }

export default function BandDonut({ data }: Props) {
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Score Band Distribution</p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={BAND_COLORS[entry.name] ?? "#aaa"}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-light">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
