import { NextResponse } from "next/server";
import { SIGN_KEYS, type LensResult } from "@/content/lens";

/**
 * Nea SI Skin Lens: reads the VISIBLE skin signs in one face photo with Gemini's vision model.
 * - The photo is sent to Google once, for this answer only. NEA does not save it anywhere.
 * - It never diagnoses; it describes what is visible and points to NEA's free in-clinic scan for real measurements.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PROMPT = `You are Nea SI's Skin Lens on the website of a physician-managed skin clinic.
Look at this face photo and describe only VISIBLE skin signs. Never diagnose, never name a disease or condition, never guess age, ethnicity or health.
For each sign that is clearly visible, give:
- key: one of ${SIGN_KEYS.join(", ")}
- level: 0-100, how visible it is in this photo (be honest and conservative; leave out signs you cannot see)
- where: the face area in plain words (e.g. "cheeks", "forehead", "nose")
- x, y: the 0-1 position (from the top-left of the image) of the clearest spot
- note: one short, kind sentence in everyday words about what you see (no medical terms such as papule, pustule, erythema, comedone, lesion)
If the photo is not a clear, well-lit, front-facing face (or has heavy filters or makeup), set quality.ok to false and explain the issue in a few words, and return no signs.
summary: 1-2 warm sentences in plain words about the overall picture. No medical advice.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    quality: { type: "OBJECT", properties: { ok: { type: "BOOLEAN" }, issue: { type: "STRING" } }, required: ["ok"] },
    summary: { type: "STRING" },
    signs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { key: { type: "STRING", enum: SIGN_KEYS }, level: { type: "INTEGER" }, where: { type: "STRING" }, x: { type: "NUMBER" }, y: { type: "NUMBER" }, note: { type: "STRING" } },
        required: ["key", "level", "where", "x", "y", "note"],
      },
    },
  },
  required: ["quality", "summary", "signs"],
};

export function GET() {
  return NextResponse.json({ ready: Boolean(process.env.GEMINI_API_KEY) });
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "Skin Lens needs GEMINI_API_KEY on the server." }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { image?: string };
  const m = body.image?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return NextResponse.json({ error: "Send one photo as a JPEG, PNG or WebP." }, { status: 400 });
  if (m[2].length > 2_800_000) return NextResponse.json({ error: "That photo is too large. Try again." }, { status: 413 });

  const models = (process.env.GEMINI_LENS_MODELS || process.env.GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-flash-latest").split(",").map((s) => s.trim()).filter(Boolean);
  const deadline = Date.now() + 55000;
  let last = "";
  for (const model of models) {
    if (deadline - Date.now() < 5000) break;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ inlineData: { mimeType: m[1], data: m[2] } }, { text: PROMPT }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema: SCHEMA },
        }),
        signal: AbortSignal.timeout(Math.min(40000, deadline - Date.now())),
      });
      const d = (await res.json().catch(() => ({}))) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } };
      if (!res.ok) {
        last = `${model} ${res.status} ${d.error?.message?.slice(0, 120) ?? ""}`;
        continue;
      }
      const text = d.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const r = JSON.parse(text) as LensResult;
      // keep it tidy and safe for the UI
      const signs = (r.signs ?? [])
        .filter((s) => SIGN_KEYS.includes(s.key))
        .map((s) => ({ ...s, level: Math.max(0, Math.min(100, Math.round(s.level))), x: Math.max(0, Math.min(1, s.x)), y: Math.max(0, Math.min(1, s.y)) }))
        .sort((a, b) => b.level - a.level)
        .slice(0, 6);
      return NextResponse.json({ quality: r.quality ?? { ok: true }, summary: r.summary ?? "", signs } satisfies LensResult);
    } catch (e) {
      last = `${model} ${(e as Error).message}`;
    }
  }
  console.error("[skin-lens] failed:", last);
  return NextResponse.json({ error: "Skin Lens is busy right now. Please try again in a moment." }, { status: 503 });
}
