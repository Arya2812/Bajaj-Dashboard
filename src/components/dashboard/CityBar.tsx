import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface Props { data: { city: string; count: number }[] }

const CITY_COLORS = ["#F59E0B", "#EF4444", "#22C55E", "#22C55E", "#EF4444", "#F59E0B", "#F59E0B", "#EF4444", "#2A7ADE", "#8B5CF6", "#06B6D4", "#84CC16"];

export default function CityBar({ data }: Props) {
  const sliced = data.slice(0, 12);
  return (
    <div className="neu-card p-5 h-72">
      <p className="text-sm font-semibold text-slate mb-3">Retailers by City</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={sliced} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "#6B7A84" }} hide />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: "#6B7A84" }} width={80} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,82,163,0.12)" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {sliced.map((_, i) => <Cell key={i} fill={CITY_COLORS[i % CITY_COLORS.length]} />)}
            <LabelList dataKey="count" position="right" style={{ fontSize: 10, fill: "#6B7A84", fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
