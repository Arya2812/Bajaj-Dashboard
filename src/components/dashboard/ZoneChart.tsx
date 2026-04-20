import { ComposedChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

interface Props {
  data: { zone: string; count: number; avg_score: number }[];
}

export default function ZoneChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    avg_pct: Math.round(d.avg_score * 1000) / 10,
  }));

  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Zone Performance</p>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={chartData} margin={{ top: 16, right: 28, left: -8, bottom: 0 }}>
          <XAxis dataKey="zone" tick={{ fontSize: 11, fill: "#6B7A84" }} />
          <YAxis yAxisId="left" domain={["auto", "auto"]} tickFormatter={v => `${v}`} tick={{ fontSize: 10, fill: "#EF4444" }} width={32} />
          <YAxis yAxisId="right" orientation="right" domain={[0, "auto"]} tick={{ fontSize: 10, fill: "#2A7ADE" }} width={24} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number, name: string) =>
              name === "avg_pct" ? [`${val.toFixed(1)}%`, "Avg Score %"] : [val, "Count"]
            }
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs" style={{ color: value === "avg_pct" ? "#EF4444" : "#2A7ADE" }}>
                {value === "avg_pct" ? "Avg Score %" : "Count"}
              </span>
            )}
          />
          <Line yAxisId="left" type="monotone" dataKey="avg_pct" stroke="#EF4444" strokeWidth={2.5}
            dot={{ fill: "#EF4444", r: 4, strokeWidth: 0 }} name="avg_pct">
            <LabelList dataKey="avg_pct" position="top" style={{ fontSize: 9, fill: "#EF4444", fontWeight: 600 }}
              formatter={(v: number) => `${v.toFixed(1)}%`} />
          </Line>
          <Line yAxisId="right" type="monotone" dataKey="count" stroke="#2A7ADE" strokeWidth={2.5}
            dot={{ fill: "#2A7ADE", r: 4, strokeWidth: 0 }} name="count">
            <LabelList dataKey="count" position="top" style={{ fontSize: 9, fill: "#2A7ADE", fontWeight: 600 }} />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
