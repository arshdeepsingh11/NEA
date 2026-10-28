import { NextResponse } from "next/server";
import { getInstagramVideos } from "@/lib/instagram";
import { embedFor, socialVideos } from "@/content/reels";

/** NEA's videos for the Reels viewer: newest Instagram Reels (when connected) plus the links in content/reels.ts. */
export const revalidate = 3600;

export async function GET() {
  const auto = await getInstagramVideos();
  const seen = new Set<string>();
  const videos = [...auto, ...socialVideos].filter((v) => {
    const e = embedFor(v.url);
    if (!e || seen.has(e.platform + e.id)) return false;
    seen.add(e.platform + e.id);
    return true;
  });
  return NextResponse.json({ videos });
}
