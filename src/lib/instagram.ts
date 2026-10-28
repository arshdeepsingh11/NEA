/**
 * NEA's own Instagram videos, read with Instagram's official API (Instagram API with Instagram Login).
 * Free to use. Needs INSTAGRAM_ACCESS_TOKEN (see README → "Instagram Reels").
 * Only the account that owns the token is ever read, so the site can only show @neaprecisionskin.
 */
export type Reel = {
  id: string;
  video: string;
  poster: string | null;
  caption: string;
  permalink: string;
  date: string;
};

type Media = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

const API = "https://graph.instagram.com";
const FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";

/** Latest videos, newest first. Cached for an hour so visitors never wait on Instagram. Returns [] when not set up. */
export async function getReels(max = 30): Promise<Reel[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  const out: Reel[] = [];
  let url: string | null = `${API}/me/media?fields=${FIELDS}&limit=50&access_token=${encodeURIComponent(token)}`;
  try {
    for (let page = 0; url && page < 4 && out.length < max; page++) {
      const res: Response = await fetch(url, { next: { revalidate: 3600, tags: ["instagram"] } });
      if (!res.ok) {
        console.error("[instagram] feed request failed", res.status, (await res.text()).slice(0, 300));
        break;
      }
      const data = (await res.json()) as { data?: Media[]; paging?: { next?: string } };
      for (const m of data.data ?? []) {
        if (m.media_type !== "VIDEO" || !m.media_url) continue;
        out.push({ id: m.id, video: m.media_url, poster: m.thumbnail_url ?? null, caption: m.caption ?? "", permalink: m.permalink, date: m.timestamp });
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
  return {
    ok: true,
    expiresInDays: Math.round((data.expires_in ?? 0) / 86400),
    // If Instagram ever hands back a different token, it has to be pasted into INSTAGRAM_ACCESS_TOKEN.
    tokenChanged: data.access_token !== token,
  };
}
