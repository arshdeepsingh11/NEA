import { NextResponse } from "next/server";
import { answer, search } from "@/lib/knowledge";
import { brief, pagesFor } from "@/lib/si/brain";
import { ENGINE_LABEL, configured, defaultEngine, run, type Engine, type Turn } from "@/lib/si/engines";

/**
 * NEA SI (Skin Intelligence).
 * 1. Finds the NEA pages that match the question and prices a plan (always, from NEA's own data).
 * 2. The chosen engine (Xevyo or Gemini) writes the answer from NEA's brief plus those pages.
 * 3. If that engine is down, the other one answers; if both are, the built-in engine does. The chat never breaks.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Which engines are connected, for the switch in the chat. */
export function GET() {
  return NextResponse.json({ default: defaultEngine(), engines: { xevyo: configured("xevyo"), gemini: configured("gemini") } });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string; context?: string; engine?: string; history?: Turn[] };
  const { question, context } = body;
  if (!question || question.length > 500) return NextResponse.json({ error: "Ask a question up to 500 characters" }, { status: 400 });

  const local = answer(context ? `${context} ${question}` : question);
  const sources = local.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind, meta: s.meta }));
  const base = { text: local.text, sources, plan: local.plan, steps: local.steps, model: "nea-local" as string, fellBack: false };

  const wanted: Engine = body.engine === "gemini" || body.engine === "xevyo" ? body.engine : defaultEngine();
  const order = ([wanted, wanted === "xevyo" ? "gemini" : "xevyo"] as Engine[]).filter(configured);
  if (!order.length) return NextResponse.json(base);

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string")
    .slice(-8)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 1500) }));
  const pages = search(context ? `${context} ${question}` : question, 6);
  const turn: Turn = { role: "user", text: `${pagesFor(pages)}\n\n${context ? `The visitor is looking at: ${context}\n` : ""}QUESTION: ${question}` };

  const deadline = Date.now() + 54000;
  for (const e of order) {
    if (deadline - Date.now() < 4000) break;
    try {
      const text = await run(e, brief(ENGINE_LABEL[e]), [...history, turn], deadline);
      return NextResponse.json({ ...base, text, model: e, fellBack: e !== wanted, steps: [...local.steps, `${ENGINE_LABEL[e]} wrote the answer from NEA's knowledge`] });
    } catch (err) {
      console.error(`[si] ${e} failed:`, (err as Error).message);
    }
  }
  return NextResponse.json({ ...base, fellBack: true });
}
