/**
 * The two engines behind Nea SI. Keys live only on the server (.env.local / hosting env vars).
 * - Xevyo: NEA's in-house AI. Called OpenAI-style (POST messages, Bearer key) at XEVYO_API_URL; streams when the API supports it.
 * - Gemini: Google's API, streamed. Tries each model in GEMINI_MODELS until one answers (busy models are skipped).
 * Both stream text as it is written, so the first words appear in about a second.
 */
export type Engine = "xevyo" | "gemini";
export type Turn = { role: "user" | "assistant"; text: string };
export const ENGINE_LABEL: Record<Engine, string> = { xevyo: "Xevyo", gemini: "Gemini" };

export function configured(e: Engine) {
  if (e === "xevyo") return Boolean(process.env.XEVYO_API_KEY && process.env.XEVYO_API_URL);
  return Boolean(process.env.GEMINI_API_KEY);
}

export function defaultEngine(): Engine {
  const d = process.env.SI_DEFAULT_ENGINE === "gemini" ? "gemini" : "xevyo";
  return configured(d) ? d : configured("gemini") ? "gemini" : "xevyo";
}

/** Plain-English reason an engine is not available, for the chat (development only). */
export function setupHint() {
  if (!process.env.GEMINI_API_KEY && !process.env.XEVYO_API_KEY)
    return `The server can't see your keys. Check the file is named exactly ".env.local" (with the dot, not "env.local" or ".env.local.txt"), sits next to package.json, then restart npm run dev.`;
  if (!process.env.GEMINI_API_KEY) return "GEMINI_API_KEY is missing from .env.local, so Gemini can't answer. Add it and restart npm run dev.";
  if (!process.env.XEVYO_API_KEY) return "XEVYO_API_KEY is missing from .env.local. Gemini is answering for now.";
  if (!process.env.XEVYO_API_URL) return "Xevyo needs its API address (XEVYO_API_URL in .env.local). Gemini is answering for now.";
  return null;
}

/** Reads a Server-Sent Events body and yields each event's data. */
async function* sse(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true }).replace(/\r/g, "");
    let i: number;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const event = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = event
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (data) yield data;
    }
  }
}

const pickText = (d: Record<string, unknown> & { choices?: { message?: { content?: string }; delta?: { content?: string }; text?: string }[]; content?: { text?: string }[] | string }) =>
  d.choices?.[0]?.delta?.content ??
  d.choices?.[0]?.message?.content ??
  d.choices?.[0]?.text ??
  (Array.isArray(d.content) ? d.content.map((c) => c.text ?? "").join("") : d.content) ??
  (d.output_text as string) ??
  (d.text as string) ??
  (d.response as string) ??
  (d.answer as string) ??
  (typeof d.message === "string" ? d.message : undefined);

async function* xevyo(system: string, turns: Turn[], deadline: number): AsyncGenerator<string> {
  const res = await fetch(process.env.XEVYO_API_URL!, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream, application/json", authorization: `Bearer ${process.env.XEVYO_API_KEY}`, "x-api-key": process.env.XEVYO_API_KEY! },
    body: JSON.stringify({
      model: process.env.XEVYO_MODEL || undefined,
      messages: [{ role: "system", content: system }, ...turns.map((t) => ({ role: t.role, content: t.text }))],
      temperature: 0.4,
      max_tokens: 900,
      stream: true,
    }),
    signal: AbortSignal.timeout(Math.max(3000, Math.min(25000, deadline - Date.now()))),
  });
  if (!res.ok || !res.body) throw new Error(`Xevyo ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  if ((res.headers.get("content-type") ?? "").includes("event-stream")) {
    let any = false;
    for await (const data of sse(res.body)) {
      if (data === "[DONE]") break;
      try {
        const t = pickText(JSON.parse(data));
        if (t) {
          any = true;
          yield t;
        }
      } catch {
        // not JSON: treat as raw text
        any = true;
        yield data;
      }
    }
    if (!any) throw new Error("Xevyo streamed no text");
    return;
  }
  const t = pickText(await res.json());
  if (!t || typeof t !== "string") throw new Error("Xevyo returned no text");
  yield t.trim();
}

async function* gemini(system: string, turns: Turn[], deadline: number): AsyncGenerator<string> {
  const models = (process.env.GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-flash-latest").split(",").map((m) => m.trim()).filter(Boolean);
  let last = "";
  for (const m of models) {
    if (deadline - Date.now() < 4000) break;
    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.text }] })),
          generationConfig: { temperature: 0.4, maxOutputTokens: 1400 },
        }),
        signal: AbortSignal.timeout(Math.min(30000, deadline - Date.now())),
      });
    } catch (e) {
      last = `${m} ${(e as Error).message}`;
      continue;
    }
    if (!res.ok || !res.body) {
      last = `${m} ${res.status} ${(await res.text().catch(() => "")).slice(0, 120)}`;
      continue; // busy or retired model: try the next one
    }
    let any = false;
    for await (const data of sse(res.body)) {
      try {
        const j = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
        const t = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
        if (t) {
          any = true;
          yield t;
        }
      } catch {}
    }
    if (any) return;
    last = `${m} returned no text`;
  }
  throw new Error(`Gemini: ${last}`);
}

/** Streams one engine's answer; `deadline` (epoch ms) keeps the request inside the server's time limit. */
export function stream(e: Engine, system: string, turns: Turn[], deadline: number) {
  return e === "xevyo" ? xevyo(system, turns, deadline) : gemini(system, turns, deadline);
}
