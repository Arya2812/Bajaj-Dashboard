import { NextRequest, NextResponse } from "next/server";
import { appendRetailerRow, getAllRetailers, rowsToRecords, SHEET_HEADERS } from "@/lib/google-sheets";
import { computeEnvironmentClassification, computeFmrScore, extractScore } from "@/lib/scoring-engine";
import { FMR_DIMENSIONS } from "@/lib/lookup-tables";

export async function GET() {
  try {
    const rows    = await getAllRetailers();
    const records = rowsToRecords(rows);
    return NextResponse.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Run Environment Classification ──────────────────────────────────
    const envInput = {
      primary_orientation:   body.primary_orientation,
      secondary_orientation: body.secondary_orientation,
      store_format:          body.store_format,
      display_structure:     body.display_structure,
      customer_type:         body.customer_type,
      selling_behavior:      body.selling_behavior,
      store_size_band:       body.store_size_band,
      brand_presence:        body.brand_presence,
      category_depth:        body.category_depth,
      catchment_power:       body.catchment_power,
    };
    const envOut = computeEnvironmentClassification(envInput);

    // ── Build FMR input map ──────────────────────────────────────────────
    const fmrInput: Record<string, string> = {};
    for (const dim of FMR_DIMENSIONS) {
      for (const v of dim.variables) {
        fmrInput[v.key] = body[v.key] ?? "";
      }
    }
    const fmrOut = computeFmrScore(fmrInput);

    // ── Build row in sheet column order ──────────────────────────────────
    const row = SHEET_HEADERS.map(col => {
      if (col in envOut)   return String((envOut as Record<string,unknown>)[col]);
      if (col in fmrOut)   return String((fmrOut as Record<string,unknown>)[col]);
      if (col in fmrInput) return String(extractScore(fmrInput[col]));
      if (col === "timestamp") return new Date().toISOString();
      return String(body[col] ?? "");
    });

    await appendRetailerRow(row);

    return NextResponse.json({
      success: true,
      env: envOut,
      fmr: fmrOut,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
