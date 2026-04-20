interface Props {
  title: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function KpiCard({ title, value, sub, accent = "#2A7ADE" }: Props) {
  return (
    <div
      className="bg-white rounded-xl px-4 py-3 flex flex-col justify-between min-h-[80px]"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)", borderLeft: `3px solid ${accent}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest leading-none" style={{ color: "#9AA5B1" }}>
        {title}
      </p>
      <p className="text-[1.6rem] font-bold leading-none mt-2" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-1 truncate" style={{ color: "#9AA5B1" }}>{sub}</p>}
    </div>
  );
}
