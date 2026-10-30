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

/** XEVYO_API_URL may be the full chat address or just the API base (".../v1"); a bare base gets /chat/completions added. */
function xevyoUrl() {
  const raw = (process.env.XEVYO_API_URL || "").trim().replace(/\/+$/, "");
  if (/\/(chat|completions|generate|messages|ask|query|responses)(\/|$|\?)/i.test(raw)) return raw;
  return /\/v\d+$/i.test(raw) ? `${raw}/chat/completions` : raw;
}

async function* xevyo(system: string, turns: Turn[], deadline: number): AsyncGenerator<string> {
  const res = await fetch(xevyoUrl(), {
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

/** Starts a request that can be cancelled and that gives up after `ms`. */
function request(url: string, init: RequestInit, ms: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error("timed out")), Math.max(1000, ms));
  const done = fetch(url, { ...init, signal: ctrl.signal });
  done.finally(() => clearTimeout(timer)).catch(() => {});
  return { done, cancel: () => ctrl.abort(new Error("cancelled")) };
}

/**
 * Gemini, hedged for speed. When Google is busy a single request can wait 10–25 s before the first word,
 * so Nea SI starts the first model straight away and, every GEMINI_HEDGE_MS (1.5 s) without an answer,
 * starts the next model in parallel. The first one to start answering wins; the others are cancelled.
 * Gemini 3 models are asked for minimal thinking (fastest first word). If nothing starts within
 * GEMINI_FIRST_TOKEN_MS (9 s), it gives up so the chat can answer from NEA's own knowledge instead.
 */
async function* gemini(system: string, turns: Turn[], deadline: number): AsyncGenerator<string> {
  const models = (process.env.GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.5-flash").split(",").map((m) => m.trim()).filter(Boolean);
  const hedge = Number(process.env.GEMINI_HEDGE_MS) || 1500;
  const wait = Math.min(Number(process.env.GEMINI_FIRST_TOKEN_MS) || 9000, deadline - Date.now() - 2000);
  const contents = turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.text }] }));
  const body = (m: string, think: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1100, ...(think ? { thinkingConfig: { thinkingLevel: "minimal" } } : {}) },
    });
  const call = (m: string, think: boolean) =>
    request(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse`,
      { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! }, body: body(m, think) },
      deadline - Date.now(),
    );

  const live: { cancel: () => void }[] = [];
  const errors: string[] = [];
  const winner = await new Promise<{ res: Response; m: string } | null>((resolve) => {
    let next = 0;
    let running = 0;
    let settled = false;
    const finish = (w: { res: Response; m: string } | null) => {
      if (settled) return;
      settled = true;
      clearInterval(tick);
      clearTimeout(stop);
      resolve(w);
    };
    const launch = (m: string, think: boolean) => {
      running++;
      const r = call(m, think);
      live.push(r);
      r.done.then(
        async (res) => {
          if (res.ok && res.body) {
            if (settled) return r.cancel();
            // first to start answering wins: cancel the others straight away
            for (const o of live) if (o !== r) o.cancel();
            finish({ res, m });
            return;
          }
          const text = (await res.text().catch(() => "")).slice(0, 160);
          running--;
          // a model that doesn't accept thinkingLevel: ask again without it
          if (think && res.status === 400 && /think/i.test(text)) return void launch(m, false);
          errors.push(`${m} ${res.status} ${text}`);
          if (!settled && next < models.length) start();
          else if (!running) finish(null);
        },
        (e: Error) => {
          running--;
          errors.push(`${m} ${e.message}`);
          if (!settled && next < models.length) start();
          else if (!running) finish(null);
        },
      );
    };
    const start = () => {
      if (settled || next >= models.length) return;
      const m = models[next++];
      launch(m, m.startsWith("gemini-3"));
    };
    const tick = setInterval(start, hedge);
    const stop = setTimeout(() => (errors.push(`no answer within ${wait} ms`), finish(null)), wait);
    start();
  });
  if (!winner) {
    live.forEach((r) => r.cancel());
    throw new Error(`Gemini: ${errors.join(" | ") || "no model answered"}`);
  }
  let any = false;
  try {
    for await (const data of sse(winner.res.body!)) {
      try {
        const j = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
        const t = (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
        if (t) {
          any = true;
          yield t;
        }
      } catch {}
    }
  } finally {
    live.forEach((r) => r.cancel());
  }
  if (!any) throw new Error(`Gemini: ${winner.m} returned no text`);
}

/** Streams one engine's answer; `deadline` (epoch ms) keeps the request inside the server's time limit. */
export function stream(e: Engine, system: string, turns: Turn[], deadline: number) {
  return e === "xevyo" ? xevyo(system, turns, deadline) : gemini(system, turns, deadline);
}
