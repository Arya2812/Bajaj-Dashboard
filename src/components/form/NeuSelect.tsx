interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}

export default function NeuSelect({ label, value, options, onChange, required, hint }: Props) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-light uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full neu-input appearance-none pr-8 text-sm cursor-pointer"
          style={{ background: "#EBEFF5" }}
        >
          <option value="">— Select —</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="#6B7A84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {hint && <p className="text-[11px] text-slate-light mt-1">{hint}</p>}
    </div>
  );
}
