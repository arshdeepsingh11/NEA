import raw from "./generated/treatments.json";
import pages from "./generated/pages.json";

export type Block = { type: "h" | "p" | "li"; text: string };
type RawSection = {
  title: string;
  intro: string[];
  list: string[];
  subs: { title: string; body: Block[] }[];
  more: Block[][];
};

export type TreatmentCategory = "skin" | "laser" | "injectables" | "body" | "hair" | "wellness" | "feminine";

export const categories: { id: TreatmentCategory; label: string; blurb: string }[] = [
  { id: "skin", label: "Skin & peels", blurb: "Acne, pigmentation, pores, scars and facials." },
  { id: "laser", label: "Fotona laser", blurb: "Tightening, resurfacing and medical laser modes." },
  { id: "injectables", label: "Injectables", blurb: "Neuromodulators, fillers, PRP and Belkyra." },
  { id: "body", label: "Body & muscle", blurb: "truSculpt flex, TightSculpting and nutrition." },
  { id: "hair", label: "Hair", blurb: "Hair restoration and laser hair removal." },
  { id: "wellness", label: "Health & wellness", blurb: "Sleep, migraine, nails, warts and weight." },
  { id: "feminine", label: "Feminine health", blurb: "IntimaLase, Incontilase and vaginal microbiome." },
];

export type Treatment = {
  slug: string;
  title: string;
  category: TreatmentCategory;
  summary: string;
  image: string;
  concerns: string[];
  program?: string;
  intro: string[];
  list: string[];
  subs: { title: string; body: Block[] }[];
  more: Block[][];
};

type Meta = Omit<Treatment, "title" | "intro" | "list" | "subs" | "more"> & { title?: string };

const meta: Record<string, Meta> = {
  "Large Pores": {
    slug: "large-pores",
    category: "skin",
    summary: "Er:YAG resurfacing and a medical-grade routine to refine visible pores.",
    image: "2024/01/large-pores.jpg",
    concerns: ["pores", "texture", "oily skin"],
    program: "clear-skin",
  },
  "Fotona Laser Treatment": {
    slug: "fotona-laser",
    title: "Fotona Laser",
    category: "laser",
    summary: "One of the first Fotona centres in Calgary, with Er:YAG and Nd:YAG modes for every skin tone.",
    image: "2023/12/Fotona4D_Page.jpg",
    concerns: ["tightening", "wrinkles", "skin quality"],
    program: "healthy-aging",
  },
  "Stretch Mark Treatments": {
    slug: "stretch-marks-and-scars",
    title: "Stretch Marks & Scars",
    category: "skin",
    summary: "Peels, Fotona resurfacing and microbiome support in one customized plan.",
    image: "2024/01/stretch-marks-1.jpg",
    concerns: ["stretch marks", "scars", "texture"],
    program: "even-tone",
  },
  "Muscle Sculpting & Building": {
    slug: "muscle-sculpting",
    title: "Muscle Sculpting (truSculpt flex)",
    category: "body",
    summary: "truSculpt flex builds and tones muscle with Multi-Directional Stimulation.",
    image: "2024/06/zqndcje06vm-e1718734658676.jpg",
    concerns: ["muscle", "core strength", "toning"],
    program: "healthy-aging",
  },
  "Perfect Derma Peel": {
    slug: "perfect-derma-peel",
    category: "skin",
    summary: "A medium-depth medical peel with glutathione for tone, texture and acne scars.",
    image: "2024/01/2.jpg",
    concerns: ["pigmentation", "acne scars", "fine lines"],
    program: "even-tone",
  },
  "Weight Loss Programs": {
    slug: "weight-loss-programs",
    title: "Weight Loss Programs",
    category: "wellness",
    summary: "Registered Dietitian nutrition protocols paired with your skin plan.",
    image: "2024/01/tab2.jpg",
    concerns: ["weight", "nutrition", "metabolism"],
  },
  "Hair Restoration": {
    slug: "hair-restoration",
    category: "hair",
    summary: "PRP and Fotona laser hair restoration to wake up dormant follicles.",
    image: "2024/01/1-1.png",
    concerns: ["hair thinning", "hair loss", "alopecia"],
    program: "hair-regrowth",
  },
  "Migraine Treatment": {
    slug: "migraine-treatment",
    category: "wellness",
    summary: "Preventive neuromodulator injections for chronic migraine.",
    image: "2024/01/migran-3.png",
    concerns: ["migraine", "headache"],
  },
  Fillers: {
    slug: "dermal-fillers",
    title: "Dermal Fillers",
    category: "injectables",
    summary: "Hyaluronic acid fillers to restore volume, soften folds and shape lips.",
    image: "2024/01/fillers.png",
    concerns: ["volume", "lips", "folds"],
    program: "healthy-aging",
  },
  "Cosmetic Injectables/ Neuromodulators": {
    slug: "neuromodulators",
    title: "Neuromodulators",
    category: "injectables",
    summary: "Health Canada–approved neuromodulators that soften frown lines in 10–20 minutes.",
    image: "2024/01/neurotoxins-e1718734527479.jpg",
    concerns: ["frown lines", "forehead lines", "crow’s feet"],
    program: "healthy-aging",
  },
  "Active Acne": {
    slug: "active-acne",
    title: "Acne Treatments",
    category: "skin",
    summary: "Root-cause acne care: peels, laser, products and the diet connection.",
    image: "2024/01/lines-and-wrinkles-1.jpg",
    concerns: ["acne", "breakouts", "blackheads"],
    program: "clear-skin",
  },
  "Acne Scarring": {
    slug: "acne-scarring",
    category: "skin",
    summary: "Ice pick, boxcar and rolling scars treated with resurfacing and peels.",
    image: "2024/01/1.jpg",
    concerns: ["acne scars", "texture"],
    program: "clear-skin",
  },
  Rosacea: {
    slug: "rosacea",
    category: "skin",
    summary: "Laser to calm redness and visible capillaries, with lifestyle and diet support.",
    image: "2024/01/rosacea.jpg",
    concerns: ["redness", "flushing", "rosacea"],
    program: "clear-skin",
  },
  "Lines and Wrinkles/Sun Damage": {
    slug: "lines-wrinkles-sun-damage",
    title: "Lines, Wrinkles & Sun Damage",
    category: "laser",
    summary: "Fotona 4D, fractional resurfacing, laser peels and skin tightening.",
    image: "2024/01/sun-damage.jpg",
    concerns: ["wrinkles", "sun damage", "sagging"],
    program: "healthy-aging",
  },
  "Hyperpigmentation/Melasma": {
    slug: "hyperpigmentation-melasma",
    title: "Hyperpigmentation & Melasma",
    category: "skin",
    summary: "Combined in-clinic procedures and a medical-grade home routine to even tone.",
    image: "2024/01/facial-laser-treatments-e1718734631828.jpg",
    concerns: ["pigmentation", "melasma", "dark spots", "uneven tone"],
    program: "even-tone",
  },
  Facials: {
    slug: "facials",
    category: "skin",
    summary: "Dermaplaning, chemical peels, the NEA Facial and Infused Oxygenation.",
    image: "2024/01/clinical-facial-treatments.jpg",
    concerns: ["glow", "hydration", "dullness"],
    program: "even-tone",
  },
  "Facial Laser Treatments": {
    slug: "facial-laser",
    title: "Facial Laser & Intra-oral Tightening",
    category: "laser",
    summary: "SmoothLiftin intra-oral tightening that lifts from inside the mouth.",
    image: "2023/12/fotona-4d-jpeg-721x1024-1.jpg",
    concerns: ["nasolabial folds", "volume", "tightening"],
    program: "healthy-aging",
  },
  "Body Contouring": {
    slug: "body-contouring",
    title: "Body Contouring (TightSculpting)",
    category: "body",
    summary: "Dual-wavelength Fotona TightSculpting to reduce fat and tighten skin.",
    image: "2024/01/body.png",
    concerns: ["stubborn fat", "loose skin", "post-pregnancy"],
  },
  "Laser Hair Removal": {
    slug: "laser-hair-removal",
    category: "hair",
    summary: "FRAC3 laser hair reduction that is safe for all skin types.",
    image: "2024/01/laser-hair-removal-1.jpg",
    concerns: ["unwanted hair", "ingrown hairs"],
  },
  "Wart Removal": {
    slug: "wart-removal",
    category: "wellness",
    summary: "Precise Nd:YAG and Er laser removal with no anaesthesia.",
    image: "2024/01/wart.png",
    concerns: ["warts", "verrucae"],
  },
  "Snoring and Sleep Apnea": {
    slug: "snoring-sleep-apnea",
    title: "Snoring & Sleep Apnea (NightLase)",
    category: "wellness",
    summary: "A non-invasive, three-session NightLase course with no device to wear.",
    image: "2024/01/slepping-1.png",
    concerns: ["snoring", "sleep apnea", "sleep"],
  },
  "Feminine Health": {
    slug: "feminine-health",
    category: "feminine",
    summary: "IntimaLase and Incontilase laser care for laxity and stress urinary incontinence.",
    image: "2024/01/feminine-health.jpg",
    concerns: ["incontinence", "vaginal laxity", "dryness"],
  },
  "Fungal Nail Infection/Fungus": {
    slug: "fungal-nail",
    title: "Fungal Nail (ClearSteps)",
    category: "wellness",
    summary: "ClearSteps Nd:YAG laser treatment for onychomycosis, usually 3–4 sessions.",
    image: "2024/01/fungal-nail.jpg",
    concerns: ["toenail fungus", "nails"],
  },
  "Medical Grade Skin Care": {
    slug: "medical-grade-skincare",
    title: "Medical-Grade Skincare",
    category: "skin",
    summary: "ZO Skin Health, Luzern Force De Vie and Nuit, AlumierMD, Vivier and Glo.",
    image: "2024/01/tab-1.jpg",
    concerns: ["routine", "products"],
    program: "clear-skin",
  },
};

const fromSite: Treatment[] = (raw as RawSection[])
  .filter((s) => meta[s.title])
  .map((s) => {
    const m = meta[s.title];
    return {
      ...m,
      title: m.title ?? s.title,
      intro: s.intro,
      list: s.list,
      subs: s.subs,
      more: s.more,
    };
  });

// Injectable services that live on the /our-treatments-injectables page.
const injectablePage = (pages as Record<string, RawSection[]>)["our-treatments-injectables"] ?? [];
const pick = (title: string) => injectablePage.find((s) => s.title === title);

const extra: Treatment[] = [
  {
    slug: "botox-dysport",
    title: "Botox & Dysport",
    category: "injectables",
    summary: "Relax the muscles behind forehead lines, crow’s feet and frown lines.",
    image: "2024/01/neurotoxins-e1718734527479.jpg",
    concerns: ["wrinkles", "frown lines", "botox"],
    program: "healthy-aging",
    intro: pick("Botox/Dysport")?.intro ?? [],
    list: [],
    subs: [],
    more: [],
  },
  {
    slug: "prp-injections",
    title: "Platelet-Rich Plasma (PRP)",
    category: "injectables",
    summary: "Your own platelets, concentrated to support skin, hair and tissue repair.",
    image: "2023/11/Photo-2023-08-10-11-42-11-AM-scaled-e1719259811314.jpg",
    concerns: ["prp", "hair", "skin rejuvenation"],
    program: "hair-regrowth",
    intro: pick("Platelet Rich Plasma (PRP) Injection")?.intro ?? [],
    list: [],
    subs: [],
    more: [],
  },
  {
    slug: "belkyra",
    title: "Belkyra (Double Chin)",
    category: "injectables",
    summary: "Non-surgical injections that break down fat under the chin.",
    image: "2024/06/xeqaqwaaac0-e1719259335893.jpg",
    concerns: ["double chin", "jawline"],
    intro: pick("Belkyra Injections")?.intro ?? [],
    list: [],
    subs: [],
    more: [],
  },
  {
    slug: "hyperhidrosis",
    title: "Hyperhidrosis (Excessive Sweating)",
    category: "injectables",
    summary: "Neuromodulator treatment to reduce excessive underarm sweating.",
    image: "2024/06/rjp0ydjgk_e.jpg",
    concerns: ["sweating", "hyperhidrosis"],
    intro: [
      "Neuromodulator injections can reduce excessive underarm sweating (hyperhidrosis) by blocking the nerve signals that activate sweat glands. Book a consultation to find out if it is right for you.",
    ],
    list: [],
    subs: [],
    more: [],
  },
  {
    slug: "tmj-disorder",
    title: "TMJ Disorder Treatment",
    category: "injectables",
    summary: "Neuromodulators to relax jaw tension, which may also ease migraines.",
    image: "elementor/thumbs/Photo-2021-10-27-3-56-40-PM-scaled-qfezkhx3f0iwgve579x23vlpaqvy3r2at2kreb6uu8.jpg",
    concerns: ["jaw tension", "tmj", "clenching"],
    intro: [
      "Neuromodulator injections into the jaw muscles can relax tension from clenching and grinding (TMJ disorder), which may also ease related headaches. Your injector will assess your jaw and medical history first.",
    ],
    list: [],
    subs: [],
    more: [],
  },
];

export const treatments: Treatment[] = [...fromSite, ...extra];

export function getTreatment(slug: string) {
  return treatments.find((t) => t.slug === slug);
}

export function treatmentsByCategory(c: TreatmentCategory) {
  return treatments.filter((t) => t.category === c);
}
