import { NextResponse } from "next/server";
import { answer } from "@/lib/knowledge";

/**
 * NEA SI (Skin Intelligence).
 * 1. Retrieves the most relevant NEA programs, treatments, tests and FAQs (always).
 * 2. If ANTHROPIC_API_KEY is set, Claude writes the answer using only that context.
 *    Otherwise the built-in engine answers. Either way, sources and plans come from NEA data.
 */
const SYSTEM = `You are NEA SI (Skin Intelligence), the assistant for NEA Precision Skin, a physician-managed skin and wellness clinic in NE Calgary.
Answer only from the CONTEXT provided. If the answer is not in it, say so and suggest a free 15-minute consultation (1-403-230-8812).
Be warm, specific and brief (2-5 sentences). Never diagnose, never promise results, never invent prices. Mention the free NEA Skin Health Report when relevant.`;

export async function POST(req: Request) {
  const { question, context } = (await req.json().catch(() => ({}))) as { question?: string; context?: string };
  if (!question || question.length > 500) return NextResponse.json({ error: "Ask a question up to 500 characters" }, { status: 400 });

  const local = answer(context ? `${context} ${question}` : question);
  const sources = local.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind, meta: s.meta }));
  const base = { text: local.text, sources, plan: local.plan, steps: local.steps, model: "nea-local" };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !local.sources.length) return NextResponse.json(base);

  try {
    const ctx = local.sources.map((s, i) => `[${i + 1}] ${s.kind}: ${s.title}\n${s.text}`).join("\n\n");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-5-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: `CONTEXT:\n${ctx}\n\nQUESTION: ${question}` }],
      }),
    });
    if (!res.ok) return NextResponse.json(base);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!text) return NextResponse.json(base);
    return NextResponse.json({ ...base, text, model: "claude", steps: [...local.steps, "Wrote the answer with Claude from these sources"] });
  } catch {
    return NextResponse.json(base);
  }
}
