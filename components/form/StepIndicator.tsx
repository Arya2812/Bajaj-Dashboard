"use client";
import { Check } from "lucide-react";
import clsx from "clsx";

interface Props {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  done   && "text-white",
                  active && "text-white shadow-lg scale-110",
                  !done && !active && "text-slate-light"
                )}
                style={{
                  background: done
                    ? "linear-gradient(135deg,#0052A3,#2A7ADE)"
                    : active
                    ? "linear-gradient(135deg,#0052A3,#2A7ADE)"
                    : "#EBEFF5",
                  boxShadow: done || active
                    ? "4px 4px 10px rgba(0,82,163,0.3),-2px -2px 6px rgba(255,255,255,0.8)"
                    : "3px 3px 7px #c8cfd8,-3px -3px 7px #ffffff",
                }}
              >
                {done ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={clsx(
                  "text-[11px] font-medium whitespace-nowrap hidden sm:block",
                  active ? "text-cobalt" : done ? "text-slate" : "text-slate-light"
                )}
              >{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mt-[-14px] transition-all duration-300"
                style={{ background: i < current ? "linear-gradient(90deg,#0052A3,#2A7ADE)" : "#c8cfd8" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
