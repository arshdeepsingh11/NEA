/**
 * Ultra-high-resolution photography (Unsplash licence: free for commercial use, no attribution required).
 * Originals are 4K–8K; `img()` asks Unsplash's CDN for the exact width needed, so pages stay sharp and fast.
 * Replace any of these with NEA's own professional shoot when available: keep the key, change the id.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const IMG = {
  hero: U("1592275772614-ec71b19e326f"),
  /** smiling, clothed, front-facing faces and figures for the aesthetic "holograms" */
  twin: U("1580489944761-15a19d654956"),
  faceMap: U("1790575187751-bb1f1e01a894"),
  bodyMap: U("1786641982527-f14ae5685e6e"),
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

/** One distinct, relevant photo for each treatment (no two treatments share a photo). */
export const treatmentImage: Record<string, string> = {
  "large-pores": U("1541752857837-f8a0154fd092"),
  "fotona-laser": U("1713085085470-fba013d67e65"),
  "stretch-marks-and-scars": U("1783128504834-ac98cdb26802"),
  "muscle-sculpting": U("1594381898411-846e7d193883"),
  "perfect-derma-peel": U("1616394584738-fc6e612e71b9"),
  "weight-loss-programs": U("1644704170910-a0cdf183649b"),
  "hair-restoration": U("1633179963355-44f57f194d54"),
  "migraine-treatment": U("1691131122588-52f5eb7d2337"),
  "dermal-fillers": U("1598300188904-6287d52746ad"),
  "neuromodulators": U("1725000421356-d69d04370385"),
  "active-acne": U("1660646463659-df77c1580723"),
  "acne-scarring": U("1730288951113-9cc087c14b83"),
  "rosacea": U("1589221158826-aed6c80c3f15"),
  "lines-wrinkles-sun-damage": U("1641116511407-dbe3e86a6ea3"),
  "hyperpigmentation-melasma": U("1674932668403-33398b81c92f"),
  "facials": U("1731514771613-991a02407132"),
  "facial-laser": U("1670201203116-26644750a726"),
  "body-contouring": U("1591384640699-9a85bd036da2"),
  "laser-hair-removal": U("1700760933574-9f0f4ea9aa3b"),
  "wart-removal": U("1669979963553-c9b9e347f08a"),
  "snoring-sleep-apnea": U("1502666689584-945597854f01"),
  "feminine-health": U("1552650272-b8a34e21bc4b"),
  "fungal-nail": U("1786557747825-48f4b25dbeb8"),
  "medical-grade-skincare": U("1650529192647-ce4eb5fb3314"),
  "botox-dysport": U("1746708810803-722593e53772"),
  "prp-injections": U("1639772823849-6efbd173043c"),
  "belkyra": U("1591618227088-69884e1cbb91"),
  "hyperhidrosis": U("1772018952866-9aaeb2ab3a8b"),
  "tmj-disorder": U("1592400400196-bf709e32aa88"),
  "alumier-peel": U("1761718209708-9ab9ba1c7252"),
  "vivier-signature-kits": U("1739980213756-753aea153bb8"),
  "uti-vaginal-microbiome": U("1691934338591-9575aa800288"),
  "lipolysis": U("1606902965551-dce093cda6e7"),
  "biosport-dexa-vo2": U("1581009146145-b5ef050c2e1e"),
  "kinesiology": U("1706353399656-210cca727a33"),
  "heart-health": U("1530026186672-2cd00ffc50fe"),
  "healthspan-longevity": U("1633167606207-d840b5070fc2"),
  "obesity-metabolic": U("1522844990619-4951c40f7eda"),
  "diabetes": U("1685485276219-cbdf9309be1a"),
  "arthritis-pain": U("1762331660777-840a589195f0"),
};

