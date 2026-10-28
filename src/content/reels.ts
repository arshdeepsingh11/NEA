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

/**
 * NEA videos hosted on this site. They play even before Instagram is connected, and alongside it afterwards.
 *
 * To add one:
 * 1. In the Instagram app, open the Reel on @neaprecisionskin → ⋯ → Download (or use Meta's "Download your information").
 * 2. Put the .mp4 in `public/reels/` (keep it under ~15 MB; 1080×1920 is ideal). A cover image is optional.
 * 3. Add a line below. Newest dates show first.
 *
 * Example:
 * { file: "fall-skin-reset.mp4", poster: "fall-skin-reset.jpg", caption: "Your fall skin reset with the Perfect Derma Peel", date: "2026-10-20" },
 */
export const localReels: { file: string; poster?: string; caption: string; date: string }[] = [];
