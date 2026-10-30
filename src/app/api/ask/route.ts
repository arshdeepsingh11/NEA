import { NextResponse } from "next/server";
import { answer, search } from "@/lib/knowledge";
import { brief, briefCompact, pagesFor } from "@/lib/si/brain";
import { ENGINE_LABEL, configured, defaultEngine, setupHint, stream, type Engine, type Turn } from "@/lib/si/engines";

/**
 * Nea SI (Skin Intelligence).
 * 1. Finds the NEA pages that match the question and prices a plan (always, from NEA's own data).
 * 2. The chosen engine (Xevyo or Gemini) writes the answer from NEA's brief plus those pages, streamed word by word.
 * 3. If that engine is down, the other one answers; if both are, the built-in engine does. The chat never breaks.
 *
 * Response: newline-delimited JSON events
 *   {"t":"meta", sources, plan, steps}  → {"t":"d","v":"text…"} (many) → {"t":"done", model, fellBack}
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Which engines are connected, for the switch in the chat. */
export function GET() {
  const dev = process.env.NODE_ENV !== "production";
  return NextResponse.json({ default: defaultEngine(), engines: { xevyo: configured("xevyo"), gemini: configured("gemini") }, hint: dev ? setupHint() : null });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string; context?: string; engine?: string; history?: Turn[] };
  const { question, context } = body;
  if (!question || question.length > 500) return NextResponse.json({ error: "Ask a question up to 500 characters" }, { status: 400 });

  const full = context ? `${context} ${question}` : question;
  const local = answer(full);
  const sources = local.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind, meta: s.meta }));

  const wanted: Engine = body.engine === "gemini" || body.engine === "xevyo" ? body.engine : defaultEngine();
  const order = ([wanted, wanted === "xevyo" ? "gemini" : "xevyo"] as Engine[]).filter(configured);

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string")
    .slice(-8)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 1500) }));
  const turn: Turn = { role: "user", text: `${pagesFor(search(full, 6))}\n\n${context ? `The visitor is looking at: ${context}\n` : ""}QUESTION: ${question}` };

  // Xevyo gets a shorter index, so give it a couple more full pages for this question
  const turnX: Turn = { role: "user", text: `${pagesFor(search(full, 8))}\n\n${context ? `The visitor is looking at: ${context}\n` : ""}QUESTION: ${question}` };

  const enc = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      const send = (o: object) => ctrl.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      send({ t: "meta", sources, plan: local.plan, steps: [] });
      const deadline = Date.now() + 54000;
      for (const e of order) {
        if (deadline - Date.now() < 4000) break;
        let wrote = false;
        try {
          for await (const chunk of stream(e, e === "xevyo" ? briefCompact(ENGINE_LABEL[e]) : brief(ENGINE_LABEL[e]), [...history, e === "xevyo" ? turnX : turn], deadline)) {
            wrote = true;
            send({ t: "d", v: chunk });
          }
          send({ t: "done", model: e, fellBack: e !== wanted });
          ctrl.close();
          return;
        } catch (err) {
          console.error(`[nea-si] ${e} failed:`, (err as Error).message);
          if (wrote) {
            // cut off mid-answer: keep what was written
            send({ t: "done", model: e, fellBack: e !== wanted });
            ctrl.close();
            return;
          }
        }
      }
      send({ t: "d", v: local.text });
      send({ t: "done", model: "nea-local", fellBack: order.length > 0 });
      ctrl.close();
    },
  });
  return new Response(body$, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}
