import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { appendRetailerRow, getAllRetailers, rowsToRecords, SHEET_HEADERS } from "./google-sheets";
import { computeEnvironmentClassification, computeFmrScore } from "../src/lib/scoring-engine";
import { FMR_DIMENSIONS } from "../src/lib/lookup-tables";

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ── GET /api/sheets ──────────────────────────────────────────────────────────
app.get("/api/sheets", async (_req: Request, res: Response) => {
  if (!process.env.GOOGLE_SHEET_ID) {
    return res.json({ success: true, data: [], _demo: true });
  }
  try {
    const rows    = await getAllRetailers();
    const records = rowsToRecords(rows);
    res.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ── POST /api/sheets ─────────────────────────────────────────────────────────
app.post("/api/sheets", async (req: Request, res: Response) => {
  try {
    const body = req.body;

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

    const fmrInput: Record<string, string> = {};
    for (const dim of FMR_DIMENSIONS) {
      for (const v of dim.variables) fmrInput[v.key] = body[v.key] ?? "";
    }
    const fmrOut = computeFmrScore(fmrInput);

    const row = SHEET_HEADERS.map(col => {
      if (col in envOut) return String((envOut as Record<string, unknown>)[col]);
      if (col in fmrOut) return String((fmrOut as Record<string, unknown>)[col]);
      if (col in fmrInput) return fmrInput[col];
      if (col === "timestamp") return new Date().toISOString();
      return String(body[col] ?? "");
    });

    let sheetSaved = false;
    if (process.env.GOOGLE_SHEET_ID) {
      await appendRetailerRow(row);
      sheetSaved = true;
    }

    res.json({ success: true, env: envOut, fmr: fmrOut, sheetSaved, _demo: !sheetSaved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ── POST /api/compute ────────────────────────────────────────────────────────
app.post("/api/compute", async (req: Request, res: Response) => {
  try {
    const body = req.body;

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
    const envFilled = Object.values(envInput).every(v => v !== "");
    const envOut = envFilled ? computeEnvironmentClassification(envInput) : null;

    const fmrInput: Record<string, string> = {};
    for (const dim of FMR_DIMENSIONS) {
      for (const v of dim.variables) fmrInput[v.key] = body[v.key] ?? "";
    }
    const fmrFilled = Object.values(fmrInput).every(v => v !== "");
    const fmrOut = fmrFilled ? computeFmrScore(fmrInput) : null;

    const partialFmr = computeFmrScore(
      Object.fromEntries(Object.entries(fmrInput).map(([k, v]) => [k, v || "< 10 Lakhs [1]"]))
    );

    res.json({ success: true, env: envOut, fmr: fmrOut, partialFmr });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ── POST /api/agent ──────────────────────────────────────────────────────────
app.post("/api/agent", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: { role: string; content: string }[] };

    const rows    = process.env.GOOGLE_SHEET_ID ? await getAllRetailers() : [];
    const records = rowsToRecords(rows);

    const dataContext = records.length > 0
      ? `\n\nCURRENT RETAILER DATABASE (${records.length} retailers):\n` + JSON.stringify(records, null, 2)
      : "\n\nNo retailer data available yet.";

    const systemPrompt = `You are the FMR AI Agent for Bajaj Electricals. You have access to the full retailer database.

RESPONSE RULES:
- Be concise — use the fewest words that fully answer the question
- Structure output: use bullet points, short sections, or tables — never long paragraphs
- Always cite retailer names, scores, bands, and numbers — no vague statements
- Use markdown tables when comparing 3+ retailers or metrics
- Never add filler phrases like "Great question", "Certainly", "I hope this helps"
- Lead with the answer, then supporting details

FORMATTING:
- Bold (**text**) for retailer names and key metrics
- Tables for comparisons
- Short headers (##) only when response has multiple distinct sections
${dataContext}`;

    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system:     systemPrompt,
      messages:   messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ success: true, response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`FMR API server running on http://localhost:${PORT}`);
});
