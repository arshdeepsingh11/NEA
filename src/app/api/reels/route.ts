import { NextResponse } from "next/server";
import { getReels } from "@/lib/instagram";
import { site } from "@/lib/site";

/** NEA's latest Instagram videos for the Reels viewer. Rebuilt at most once an hour. */
export const revalidate = 3600;

export async function GET() {
  const reels = await getReels();
  return NextResponse.json({ reels, profile: site.social.instagram, connected: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN) });
}
