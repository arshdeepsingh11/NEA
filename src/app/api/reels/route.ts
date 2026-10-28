import { NextResponse } from "next/server";
import { getReels, type Reel } from "@/lib/instagram";
import { localReels } from "@/content/reels";

/** NEA's videos for the Reels viewer: Instagram (when connected) plus videos hosted on this site. Rebuilt at most once an hour. */
export const revalidate = 3600;

export async function GET() {
  const hosted: Reel[] = localReels.map((r) => ({
    id: `site-${r.file}`,
    video: `/reels/${r.file}`,
    poster: r.poster ? `/reels/${r.poster}` : null,
    caption: r.caption,
    permalink: "",
    date: new Date(r.date).toISOString(),
  }));
  const instagram = await getReels();
  const reels = [...instagram, ...hosted].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return NextResponse.json({ reels, connected: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN) });
}
