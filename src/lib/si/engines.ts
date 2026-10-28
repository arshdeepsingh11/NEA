/**
 * The two engines behind NEA SI. Keys live only on the server (.env.local / hosting env vars).
 * - Xevyo: NEA's in-house AI. Called OpenAI-style (POST messages, Bearer key) at XEVYO_API_URL.
 * - Gemini: Google's API. Tries each model in GEMINI_MODELS until one answers (busy models are skipped).
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

const timeout = (ms: number) => AbortSignal.timeout(ms);

async function xevyo(system: string, turns: Turn[], deadline: number): Promise<string> {
  const res = await fetch(process.env.XEVYO_API_URL!, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.XEVYO_API_KEY}`, "x-api-key": process.env.XEVYO_API_KEY! },
    body: JSON.stringify({
      model: process.env.XEVYO_MODEL || undefined,
      messages: [{ role: "system", content: system }, ...turns.map((t) => ({ role: t.role, content: t.text }))],
      temperature: 0.4,
      max_tokens: 900,
      stream: false,
    }),
    signal: timeout(Math.max(3000, Math.min(20000, deadline - Date.now()))),
  });
  if (!res.ok) throw new Error(`Xevyo ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const d = (await res.json()) as Record<string, unknown> & {
    choices?: { message?: { content?: string }; text?: string }[];
    content?: { text?: string }[] | string;
  };
  // accept the common response shapes
  const text =
    d.choices?.[0]?.message?.content ??
    d.choices?.[0]?.text ??
    (Array.isArray(d.content) ? d.content.map((c) => c.text ?? "").join("") : d.content) ??
    (d.output_text as string) ??
    (d.text as string) ??
    (d.response as string) ??
    (d.answer as string) ??
    (d.message as string);
  if (!text || typeof text !== "string") throw new Error("Xevyo returned no text");
  return text.trim();
}

async function gemini(system: string, turns: Turn[], deadline: number): Promise<string> {
  const models = (process.env.GEMINI_MODELS || "gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest").split(",").map((m) => m.trim()).filter(Boolean);
  let last = "";
  for (const m of models) {
    if (deadline - Date.now() < 4000) break;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.text }] })),
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
        signal: timeout(Math.min(32000, deadline - Date.now())),
      });
      const d = (await res.json().catch(() => ({}))) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]; error?: { message?: string } };
      if (!res.ok) {
        last = `${m} ${res.status} ${d.error?.message?.slice(0, 120) ?? ""}`;
        continue; // busy or retired model: try the next one
      }
      const text = d.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
      if (text) return text;
      last = `${m} returned no text`;
    } catch (e) {
      last = `${m} ${(e as Error).message}`;
    }
  }
  throw new Error(`Gemini: ${last}`);
}

/** Runs one engine; `deadline` (epoch ms) keeps the whole request inside the server's time limit. */
export function run(e: Engine, system: string, turns: Turn[], deadline: number) {
  return e === "xevyo" ? xevyo(system, turns, deadline) : gemini(system, turns, deadline);
}
