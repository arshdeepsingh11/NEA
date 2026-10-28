/**
 * Links each Instagram video to the treatment it talks about, so the viewer can offer the right Jane booking.
 * The rule whose words appear earliest in the caption wins. Keys are janeMap keys in content/jane.ts.
 */
const RULES: { words: RegExp; key: string; label: string }[] = [
  { words: /laser hair|hair removal|smooth skin/i, key: "laser-hair-removal", label: "Laser hair removal" },
  { words: /botox|dysport|neuromodulat|\btox\b|wrinkle relax/i, key: "botox-dysport", label: "Botox & Dysport" },
  { words: /filler|\blips?\b|cheek|jawline/i, key: "dermal-fillers", label: "Dermal fillers" },
  { words: /prp|hair loss|thinning|regrow/i, key: "hair-regrowth", label: "Hair regrowth" },
  { words: /acne|breakout|pimple/i, key: "active-acne", label: "Acne treatment" },
  { words: /\bscar/i, key: "acne-scarring", label: "Scar treatment" },
  { words: /melasma|pigment|dark spot|sun spot/i, key: "hyperpigmentation-melasma", label: "Pigmentation" },
  { words: /rosacea|redness/i, key: "rosacea", label: "Rosacea" },
  { words: /fotona|laser/i, key: "fotona-laser", label: "Fotona laser" },
  { words: /peel/i, key: "perfect-derma-peel", label: "Perfect Derma Peel" },
  { words: /facial|hydra|oxygen/i, key: "facials", label: "Facials" },
  { words: /sculpt|\bbody\b|\bfat\b|contour|muscle/i, key: "body-contouring", label: "Body contouring" },
  { words: /nutrition|dietitian|\bgut\b|microbiome|wellness|benefits/i, key: "nutrition", label: "Nutrition consult" },
  { words: /snor|sleep/i, key: "snoring-sleep-apnea", label: "Snoring treatment" },
  { words: /skincare|serum|\bspf\b|routine|zo skin|alumier/i, key: "medical-grade-skincare", label: "Skincare consult" },
];

export function reelTopic(caption: string) {
  // the treatment mentioned first is usually what the video is about
  let best: (typeof RULES)[number] | null = null;
  let at = Infinity;
  for (const r of RULES) {
    const i = caption.search(r.words);
    if (i >= 0 && i < at) (best = r), (at = i);
  }
  return best ?? { key: "popular", label: "Book a visit" };
}

/** Caption without the wall of hashtags at the end. */
export function cleanCaption(caption: string) {
  return caption.replace(/(\s*#[\p{L}\p{N}_]+)+\s*$/u, "").trim();
}

export type Platform = "instagram" | "youtube" | "tiktok";
export type SocialVideo = { url: string; caption?: string; date?: string };

/**
 * NEA's videos, shown on the site through each platform's official embedded player.
 * Nothing is downloaded or stored: to add a video, paste its link here (newest first).
 * Instagram Reels/posts, YouTube Shorts/videos and TikTok videos all work.
 * When INSTAGRAM_ACCESS_TOKEN is set, new Instagram Reels are added automatically as well.
 */
export const socialVideos: SocialVideo[] = [
  { url: "https://www.instagram.com/reel/DeKkcVSSQXP/", caption: "Fall skin reset, but make it yours. Peel. Reveal. Glow. Or stimulate. Renew. Glow. Perfect Peel $199, Microneedling $199, until the end of October." },
  { url: "https://www.instagram.com/reel/Dd9RT-STfrr/", caption: "Fall skin season is here, and we have something coming that your skin is going to love. Fresh, glowing, fall-ready skin." },
  { url: "https://www.instagram.com/reel/DdpHm9cyp7h/", caption: "Guess how many Botox vials are in the jar. One winner gets a free facial and a gift." },
  { url: "https://www.instagram.com/reel/DcSIarlpIFT/", caption: "The scale is lying to you after 40. DEXA shows what the scale can't, and a Registered Dietitian explains what to do next." },
  { url: "https://www.instagram.com/reel/DcEIWTxzaQ8/", caption: "Your skincare routine is only part of the story. Protein, vitamin C and healthy fats help skin build collagen and repair its barrier." },
  { url: "https://www.instagram.com/reel/Db_YhAnPqmz/", caption: "Your skincare didn't stop working. Your skin changed. How perimenopause and menopause change collagen, hydration and skin structure." },
  { url: "https://www.instagram.com/reel/Db8mg2DT6TK/", caption: "Your skin changes after 40, but not always for the reasons you think. Nourishing skin from the inside out with whole foods." },
  { url: "https://www.instagram.com/reel/DZxwYhEzyhO/", caption: "This could be you. Try our signature facial with light therapy, just like our founder did." },
  { url: "https://www.instagram.com/reel/DZdc8Pcv14h/", caption: "Our dream client? You. You value your health, trust the process and show up for your goals." },
  { url: "https://www.instagram.com/reel/DY4_u_jzo-k/", caption: "Put your records on and come get a little skin glow-up. Book your facial today." },
  { url: "https://www.instagram.com/reel/DUG71cuD-kH/", caption: "Flash sale: get that glow with our Oxygen Infused Facial." },
];

/** Which platform a link is from, its id and the official embed address. Returns null for links we can't embed. */
export function embedFor(url: string): { platform: Platform; id: string; src: string } | null {
  let m = url.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]+)/i);
  if (m) return { platform: "instagram", id: m[1], src: `https://www.instagram.com/reel/${m[1]}/embed/` };
  m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return { platform: "youtube", id: m[1], src: `https://www.youtube-nocookie.com/embed/${m[1]}?playsinline=1&rel=0&modestbranding=1` };
  m = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/i);
  if (m) return { platform: "tiktok", id: m[1], src: `https://www.tiktok.com/embed/v2/${m[1]}` };
  return null;
}

/**
 * Height of each platform's player for a given width, so the frame fits it exactly.
 * Instagram: measured from its embed (54 px header, then the video at 1.25 × width); the rest of the embed stays below the fold.
 */
export function embedHeight(platform: Platform, width: number) {
  if (platform === "instagram") return Math.round(width * 1.25 + 35);
  if (platform === "youtube") return Math.round((width * 16) / 9);
  return Math.round((width * 16) / 9 + 130);
}
