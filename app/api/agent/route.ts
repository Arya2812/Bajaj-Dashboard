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

    const systemPrompt = `You are the Find My Retailer AI Agent for Bajaj Electricals.
You have access to the complete retailer database. Analyze the data to answer questions about:
- Retailer scores, bands, categories, and rankings
- City/zone/state-level performance comparisons
- Environment classification patterns
- Branding and investment recommendations
- Growth opportunities and trends

Always cite specific numbers and retailer names. Format responses clearly with markdown tables when comparing multiple retailers. Be concise and actionable.

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
