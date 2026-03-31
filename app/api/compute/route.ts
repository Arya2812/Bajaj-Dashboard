import { NextRequest, NextResponse } from "next/server";
import { computeEnvironmentClassification, computeFmrScore } from "@/lib/scoring-engine";
import { FMR_DIMENSIONS } from "@/lib/lookup-tables";

// Real-time preview: compute scores without saving
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const envInput = {
      primary_orientation:   body.primary_orientation   ?? "",
      secondary_orientation: body.secondary_orientation ?? "",
      store_format:          body.store_format          ?? "",
      display_structure:     body.display_structure     ?? "",
      customer_type:         body.customer_type         ?? "",
      selling_behavior:      body.selling_behavior      ?? "",
      store_size_band:       body.store_size_band       ?? "",
      brand_presence:        body.brand_presence        ?? "",
      category_depth:        body.category_depth        ?? "",
      catchment_power:       body.catchment_power       ?? "",
    };

    // Only compute env if all 10 fields are filled
    const envFilled = Object.values(envInput).every(v => v !== "");
    const envOut = envFilled ? computeEnvironmentClassification(envInput) : null;

    // Build FMR input
    const fmrInput: Record<string, string> = {};
    for (const dim of FMR_DIMENSIONS) {
      for (const v of dim.variables) {
        fmrInput[v.key] = body[v.key] ?? "";
      }
    }
    const fmrFilled = Object.values(fmrInput).every(v => v !== "");
    const fmrOut = fmrFilled ? computeFmrScore(fmrInput) : null;

    // Partial FMR — compute what's available
    const partialFmr = computeFmrScore(
      Object.fromEntries(
        Object.entries(fmrInput).map(([k, v]) => [k, v || "< 10 Lakhs [1]"])
      )
    );

    return NextResponse.json({ success: true, env: envOut, fmr: fmrOut, partialFmr });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
