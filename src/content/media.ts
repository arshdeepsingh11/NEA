/**
 * Ultra-high-resolution photography (Unsplash licence: free for commercial use, no attribution required).
 * Originals are 4K–8K; `img()` asks Unsplash's CDN for the exact width needed, so pages stay sharp and fast.
 * Replace any of these with NEA's own professional shoot when available: keep the key, change the id.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const IMG = {
  hero: U("1637851496668-9310c745c3dc"),
  heroAlt: U("1643932919088-53349a7c3385"),
  scanFace: U("1713207524097-596f3c17afc3"),
  brownSkin: U("1629050516563-495e1ded1b9d"),
  acne: U("1498746607408-1e56960e3bdd"),
  acneClose: U("1730288951113-9cc087c14b83"),
  freckles: U("1674932668403-33398b81c92f"),
  hair: U("1522337360788-8b13dee7a37e"),
  hairMotion: U("1497433550656-7fb185be365e"),
  aging: U("1790574318978-819370621f53"),
  aging2: U("1761414500568-1348275e08a0"),
  laserFace: U("1761819920857-7edc5e808fd3"),
  laserDevice: U("1713085085470-fba013d67e65"),
  laserBody: U("1700760933574-9f0f4ea9aa3b"),
  laserArm: U("1598300195951-8667fec6f769"),
  facial: U("1552693673-1bf958298935"),
  facialMask: U("1616394584738-fc6e612e71b9"),
  facialFoam: U("1761718209708-9ab9ba1c7252"),
  microneedling: U("1761718209835-c8586b7dcac0"),
  injector: U("1785861485926-93a13556d656"),
  consult: U("1785860817740-c95735ba03b1"),
  consultTalk: U("1785861001619-b263ebd4e615"),
  serum: U("1784294331171-6deaf6847268"),
  serumBlue: U("1680537260333-20fd95432044"),
  lab: U("1614935151651-0bea6508db6b"),
  labPipette: U("1532187863486-abf9dbad1b69"),
  dna: U("1628595351029-c2bf17511435"),
  gutFood: U("1512621776951-a57141f2eefd"),
  men: U("1728949202468-c37fdbd76856"),
  menCare: U("1556228852-6d35a585d566"),
  body: U("1606902965551-dce093cda6e7"),
  fitness: U("1541534741688-6078c6bfb5c5"),
  eye: U("1589221158826-aed6c80c3f15"),
  skinClose: U("1752245818739-890854ca3b81"),
} as const;

export type ImgKey = keyof typeof IMG;

/** Build a CDN URL at a given width (Unsplash crops and converts to AVIF/WebP automatically). */
export function img(src: string, w = 2000, q = 82) {
  if (!src.includes("images.unsplash.com")) return src;
  return `${src}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/** The best photo for each treatment page. */
export const treatmentImage: Record<string, string> = {
  "large-pores": IMG.skinClose,
  "fotona-laser": IMG.laserDevice,
  "stretch-marks-and-scars": IMG.body,
  "muscle-sculpting": IMG.fitness,
  "perfect-derma-peel": IMG.facialFoam,
  "weight-loss-programs": IMG.gutFood,
  "hair-restoration": IMG.hair,
  "migraine-treatment": IMG.consultTalk,
  "dermal-fillers": IMG.injector,
  neuromodulators: IMG.injector,
  "botox-dysport": IMG.injector,
  "active-acne": IMG.acne,
  "acne-scarring": IMG.acneClose,
  rosacea: IMG.freckles,
  "lines-wrinkles-sun-damage": IMG.aging,
  "hyperpigmentation-melasma": IMG.brownSkin,
  facials: IMG.facial,
  "facial-laser": IMG.laserFace,
  "body-contouring": IMG.body,
  "laser-hair-removal": IMG.laserBody,
  "wart-removal": IMG.laserArm,
  "snoring-sleep-apnea": IMG.consult,
  "feminine-health": IMG.consultTalk,
  "fungal-nail": IMG.laserArm,
  "medical-grade-skincare": IMG.serum,
  "prp-injections": IMG.microneedling,
  belkyra: IMG.injector,
  hyperhidrosis: IMG.injector,
  "tmj-disorder": IMG.consultTalk,
};

export const programImage: Record<string, string> = {
  "clear-skin": IMG.acne,
  "even-tone": IMG.brownSkin,
  "hair-regrowth": IMG.hair,
  "healthy-aging": IMG.aging,
};
