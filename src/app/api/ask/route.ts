import { NextResponse } from "next/server";
import { answer } from "@/lib/knowledge";

/**
 * Ask NEA. Answers only from NEA's own content (grounded retrieval), so it
 * never invents prices or medical claims. To upgrade to an LLM, call your
 * provider here with the retrieved `sources` as context.
 */
export async function POST(req: Request) {
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  if (!question || question.length > 500) return NextResponse.json({ error: "Ask a question up to 500 characters" }, { status: 400 });
  const a = answer(question);
  return NextResponse.json({ text: a.text, sources: a.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind })) });
}
