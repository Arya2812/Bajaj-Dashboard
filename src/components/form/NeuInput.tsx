interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  readOnly?: boolean;
  hint?: string;
}

export default function NeuInput({ label, value, onChange, placeholder, required, type = "text", readOnly, hint }: Props) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-light uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full neu-input text-sm"
        style={{ background: "#EBEFF5", cursor: readOnly ? "not-allowed" : undefined, opacity: readOnly ? 0.7 : 1 }}
      />
      {hint && <p className="text-[11px] text-slate-light mt-1">{hint}</p>}
    </div>
  );
}
