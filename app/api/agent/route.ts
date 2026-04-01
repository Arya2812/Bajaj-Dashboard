import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllRetailers, rowsToRecords } from "@/lib/google-sheets";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: string; content: string }[] };

    // Fetch all retailer data to inject as context
    const rows    = await getAllRetailers();
    const records = rowsToRecords(rows);

    const dataContext = records.length > 0
      ? `\n\nCURRENT RETAILER DATABASE (${records.length} retailers):\n` +
        JSON.stringify(records, null, 2)
      : "\n\nNo retailer data available yet.";

    const systemPrompt = `You are the FMR AI Agent for Bajaj Electricals. You have access to the full retailer database.

RESPONSE RULES:
- Be concise — use the fewest words that fully answer the question
- Structure output: use bullet points, short sections, or tables — never long paragraphs
- Always cite retailer names, scores, bands, and numbers — no vague statements
- Use markdown tables when comparing 3+ retailers or metrics
- Never add filler phrases like "Great question", "Certainly", "I hope this helps"
- If listing items, use bullets — not numbered prose
- Lead with the answer, then supporting details

FORMATTING:
- Bold (**text**) for retailer names and key metrics
- Tables for comparisons
- Short headers (##) only when response has multiple distinct sections
- Max 3-4 sentences per section

${dataContext}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ success: true, response: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
