import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props { data: { range: string; count: number }[] }

export default function ScoreDistBar({ data }: Props) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)", height: 280 }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-slate">Score Distribution</p>
        <span className="text-[11px] text-slate-light bg-[#F0F4F8] px-2 py-0.5 rounded-full">All Retailers</span>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#F97316" stopOpacity={0.85} />
              <stop offset="60%"  stopColor="#FBBF24" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F0F4F8" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#6B7A84" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6B7A84" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 12, padding: "8px 14px" }}
            formatter={(val: number) => [val, "Retailers"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#F97316"
            strokeWidth={3}
            fill="url(#scoreAreaGrad)"
            dot={{ fill: "#F97316", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#EA580C" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
