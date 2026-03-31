"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, Save } from "lucide-react";
import StepIndicator from "@/components/form/StepIndicator";
import NeuSelect from "@/components/form/NeuSelect";
import NeuInput from "@/components/form/NeuInput";
import ScorePreview from "@/components/form/ScorePreview";
import {
  INDIAN_STATES, STATE_TO_ZONE, INDUSTRY_CATEGORIES,
  PRIMARY_ORIENTATION, SECONDARY_ORIENTATION, STORE_FORMAT,
  DISPLAY_STRUCTURE, CUSTOMER_TYPE, SELLING_BEHAVIOR,
  STORE_SIZE, BRAND_PRESENCE, CATEGORY_DEPTH, CATCHMENT_POWER,
  FMR_DIMENSIONS,
} from "@/lib/lookup-tables";

const STEPS = ["Retailer Info", "Environment", "FMR Scoring"];
const LS_KEY = "fmr_form_draft";

function initForm() {
  const base: Record<string, string> = {
    retailer_name: "", city: "", state: "", zone: "",
    industry_category: "", submitted_by: "",
    primary_orientation: "", secondary_orientation: "", store_format: "",
    display_structure: "", customer_type: "", selling_behavior: "",
    store_size_band: "", brand_presence: "", category_depth: "", catchment_power: "",
  };
  for (const dim of FMR_DIMENSIONS) {
    for (const v of dim.variables) base[v.key] = "";
  }
  return base;
}

export default function FormPage() {
  const router = useRouter();
  const [step,       setStep]    = useState(0);
  const [form,       setForm]    = useState<Record<string, string>>(initForm);
  const [preview,    setPreview] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Auto-save draft
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)); }
    catch { /* ignore */ }
  }, [form]);

  // Auto-derive zone from state
  useEffect(() => {
    if (form.state) {
      setForm(prev => ({ ...prev, zone: STATE_TO_ZONE[form.state] ?? "" }));
    }
  }, [form.state]);

  // Debounced live preview
  const fetchPreview = useCallback(async (f: Record<string, string>) => {
    try {
      const res  = await fetch("/api/compute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const json = await res.json();
      if (json.success) setPreview(json);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => fetchPreview(form), 600);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [form, fetchPreview]);

  const set = (key: string) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res  = await fetch("/api/sheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        localStorage.removeItem(LS_KEY);
      } else alert("Error: " + json.error);
    } catch (e) { alert("Error: " + e); }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="neu-card p-10 max-w-md w-full text-center">
          <CheckCircle size={56} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
          <h2 className="text-2xl font-bold text-slate mb-2">Retailer Saved!</h2>
          <p className="text-slate-light mb-6">The retailer has been scored and saved to Google Sheets.</p>
          <div className="flex gap-3 justify-center">
            <button className="neu-btn px-6 py-2.5 text-sm" onClick={() => router.push("/dashboard")}>
              View Dashboard
            </button>
            <button className="neu-btn-outline px-6 py-2.5 text-sm" onClick={() => { setForm(initForm()); setSubmitted(false); setStep(0); }}>
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const env   = preview.env   as Record<string, unknown> | null;
  const pfmr  = preview.partialFmr as Record<string, unknown> | null;
  const dimScores = pfmr?.dimension_scores as Record<string, number> | undefined;

  const dimScoreList = dimScores ? FMR_DIMENSIONS.map(d => ({
    id: d.id, label: d.label, score: dimScores[d.id] ?? 0,
  })) : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate">Add Retailer</h1>
        <p className="text-sm text-slate-light mt-0.5">Complete the 3-step evaluation wizard</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="neu-card p-6 md:p-8">
          <StepIndicator steps={STEPS} current={step} />

          {/* ── Step 0: Retailer Info ── */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <NeuInput label="Retailer Name" value={form.retailer_name} onChange={set("retailer_name")} placeholder="e.g. Sharma Electricals" required />
              <NeuInput label="City"          value={form.city}          onChange={set("city")}          placeholder="e.g. Mumbai" required />
              <NeuSelect label="State" value={form.state} options={INDIAN_STATES} onChange={set("state")} required />
              <NeuInput  label="Zone"  value={form.zone}  onChange={set("zone")} readOnly hint="Auto-derived from state" />
              <NeuSelect label="Industry / Category" value={form.industry_category} options={INDUSTRY_CATEGORIES} onChange={set("industry_category")} required />
              <NeuInput  label="Submitted By" value={form.submitted_by} onChange={set("submitted_by")} placeholder="Your name" />
            </div>
          )}

          {/* ── Step 1: Environment ── */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <NeuSelect label="Primary Business Orientation"   value={form.primary_orientation}   options={PRIMARY_ORIENTATION.map(x => x.label)}   onChange={set("primary_orientation")}   required />
              <NeuSelect label="Secondary Business Orientation" value={form.secondary_orientation} options={SECONDARY_ORIENTATION.map(x => x.label)} onChange={set("secondary_orientation")} required />
              <NeuSelect label="Store Format Type"       value={form.store_format}     options={STORE_FORMAT.map(x => x.label)}     onChange={set("store_format")}     required />
              <NeuSelect label="Display Structure"       value={form.display_structure} options={DISPLAY_STRUCTURE.map(x => x.label)} onChange={set("display_structure")} required />
              <NeuSelect label="Customer Type Served"    value={form.customer_type}    options={CUSTOMER_TYPE.map(x => x.label)}    onChange={set("customer_type")}    required />
              <NeuSelect label="Selling Behavior"        value={form.selling_behavior}  options={SELLING_BEHAVIOR.map(x => x.label)}  onChange={set("selling_behavior")}  required />
              <NeuSelect label="Store Size Band"         value={form.store_size_band}   options={STORE_SIZE.map(x => x.label)}        onChange={set("store_size_band")}   required />
              <NeuSelect label="Brand Presence Nature"   value={form.brand_presence}    options={BRAND_PRESENCE.map(x => x.label)}    onChange={set("brand_presence")}    required />
              <NeuSelect label="Bajaj-relevant Category Depth" value={form.category_depth}   options={CATEGORY_DEPTH.map(x => x.label)}    onChange={set("category_depth")}   required />
              <NeuSelect label="Catchment Power"         value={form.catchment_power}   options={CATCHMENT_POWER.map(x => x.label)}   onChange={set("catchment_power")}   required />
            </div>
          )}

          {/* ── Step 2: FMR Scoring ── */}
          {step === 2 && (
            <div className="space-y-8">
              {FMR_DIMENSIONS.map(dim => (
                <div key={dim.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,#0052A322,transparent)" }} />
                    <p className="text-xs font-bold uppercase tracking-widest text-cobalt px-2">{dim.label}</p>
                    <span className="text-[11px] text-slate-light">({(dim.weight * 100).toFixed(0)}% weight)</span>
                    <div className="h-px flex-1" style={{ background: "linear-gradient(270deg,#0052A322,transparent)" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dim.variables.map(v => (
                      <NeuSelect
                        key={v.key}
                        label={`${v.label} (${(v.weight * 100).toFixed(0)}%)`}
                        value={form[v.key]}
                        options={v.options}
                        onChange={set(v.key)}
                        required
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#EBEFF5]">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="neu-btn-outline flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-30"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: i === step ? "#0052A3" : "#c8cfd8", transform: i === step ? "scale(1.3)" : "scale(1)" }}
                />
              ))}
            </div>
            {step < 2 ? (
              <button
                onClick={() => setStep(s => Math.min(2, s + 1))}
                className="neu-btn flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="neu-btn flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                {submitting ? (
                  <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
                ) : <Save size={16} />}
                Save Retailer
              </button>
            )}
          </div>
        </div>

        {/* Live Score Preview */}
        <div className="space-y-4">
          <ScorePreview
            fmrPct={pfmr?.fmr_final_pct as number}
            band={pfmr?.fmr_score_band as string}
            category={pfmr?.fmr_final_category as string}
            opportunityType={pfmr?.fmr_opportunity_type as string}
            dimensionScores={dimScoreList}
            bajajPotential={env?.bajaj_overall_potential as number}
            bajajTier={env?.bajaj_potential_tier as string}
            cluster={env?.final_environment_cluster as string}
          />

          {/* Recommendations preview */}
          {pfmr && (pfmr.recommend_external_branding as string) && (
            <div className="neu-card p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-light">Recommendations</p>
              {[
                ["External Branding", pfmr.recommend_external_branding],
                ["Internal Branding", pfmr.recommend_internal_branding],
                ["Fixtures",          pfmr.recommend_fixtures],
                ["Digital",           pfmr.recommend_digital],
                ["Premium",           pfmr.recommend_premium],
                ["Lite",              pfmr.recommend_lite],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between text-xs">
                  <span className="text-slate-light">{label}</span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: val === "Yes" ? "#22C55E22" : "#EF444422",
                      color: val === "Yes" ? "#16a34a" : "#dc2626",
                    }}
                  >{String(val)}</span>
                </div>
              ))}
              {pfmr.est_revenue_band && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EBEFF5]">
                  <span className="text-slate-light font-medium">Est. Revenue Band</span>
                  <span className="font-bold text-cobalt">{String(pfmr.est_revenue_band)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
