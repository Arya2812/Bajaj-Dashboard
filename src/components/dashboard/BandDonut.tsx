import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from "recharts";
import { BAND_COLORS } from "@/lib/constants";

interface Props { data: { name: string; value: number }[] }

export default function BandDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Band Distribution</p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={BAND_COLORS[entry.name] ?? "#aaa"} stroke="none" />
            ))}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number };
                return (
                  <g>
                    <text x={cx} y={cy - 5} textAnchor="middle" fill="#3A4750" fontSize={22} fontWeight={800}>{total}</text>
                    <text x={cx} y={cy + 13} textAnchor="middle" fill="#6B7A84" fontSize={9} letterSpacing={2}>TOTAL</text>
                  </g>
                );
              }}
            />
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value, entry) => (
              <span className="text-xs text-slate-light">{value} {(entry as { payload?: { value: number } }).payload?.value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
