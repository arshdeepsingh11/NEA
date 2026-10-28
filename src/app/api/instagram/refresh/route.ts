import { NextResponse } from "next/server";
import { refreshToken } from "@/lib/instagram";

/**
 * Keeps the Instagram token alive (tokens last 60 days; each refresh restarts the clock).
 * Called weekly by the cron in vercel.json. Protected by CRON_SECRET when it is set.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const result = await refreshToken();
  if (result.ok && result.tokenChanged) console.warn("[instagram] Instagram returned a new token. Paste it into INSTAGRAM_ACCESS_TOKEN.");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
