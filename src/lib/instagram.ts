/**
 * Optional: picks up NEA's newest Instagram Reels automatically with Instagram's free official API.
 * Without INSTAGRAM_ACCESS_TOKEN the site simply uses the links in content/reels.ts.
 * Only links and captions are read; videos always play through Instagram's own embedded player.
 */
import type { SocialVideo } from "@/content/reels";

type Media = { id: string; caption?: string; media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; permalink: string; timestamp: string };

const API = "https://graph.instagram.com";

/** Newest Instagram videos as embeddable links. Cached for an hour. Returns [] when not set up. */
export async function getInstagramVideos(max = 30): Promise<SocialVideo[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  const out: SocialVideo[] = [];
  let url: string | null = `${API}/me/media?fields=id,caption,media_type,permalink,timestamp&limit=50&access_token=${encodeURIComponent(token)}`;
  try {
    for (let page = 0; url && page < 4 && out.length < max; page++) {
      const res: Response = await fetch(url, { next: { revalidate: 3600, tags: ["instagram"] } });
      if (!res.ok) {
        console.error("[instagram] feed request failed", res.status, (await res.text()).slice(0, 300));
        break;
      }
      const data = (await res.json()) as { data?: Media[]; paging?: { next?: string } };
      for (const m of data.data ?? []) {
        if (m.media_type !== "VIDEO") continue;
        out.push({ url: m.permalink, caption: m.caption ?? "", date: m.timestamp });
        if (out.length >= max) break;
      }
      url = data.paging?.next ?? null;
    }
  } catch (e) {
    console.error("[instagram] feed error", e);
  }
  return out;
}

/** Extends the token's 60-day life. Instagram only allows this once the token is at least 24 hours old. */
export async function refreshToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "INSTAGRAM_ACCESS_TOKEN is not set" };
  const res = await fetch(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!res.ok || !data.access_token) return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
  return { ok: true, expiresInDays: Math.round((data.expires_in ?? 0) / 86400), tokenChanged: data.access_token !== token };
}
