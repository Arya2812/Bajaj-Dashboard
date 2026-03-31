"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props { data: { city: string; count: number }[] }

export default function CityBar({ data }: Props) {
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Retailers by City</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data.slice(0, 12)}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 10, fill: "#6B7A84" }} />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: "#6B7A84" }} width={80} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Bar dataKey="count" fill="url(#cobaltGrad)" radius={[0, 6, 6, 0]}>
            <defs>
              <linearGradient id="cobaltGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0052A3" />
                <stop offset="100%" stopColor="#2A7ADE" />
              </linearGradient>
            </defs>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
