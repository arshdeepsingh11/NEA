import { treatmentImage } from "./media";
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
  { id: "skin", label: "Skin & peels", blurb: "Acne, dark spots, pores, scars, peels and facials." },
  { id: "laser", label: "Fotona laser", blurb: "Tightening, resurfacing and medical laser modes." },
  { id: "injectables", label: "Injectables", blurb: "Neuromodulators, fillers, PRP and Belkyra." },
  { id: "body", label: "Body & muscle", blurb: "Muscle building, fat reduction and body contouring." },
  { id: "hair", label: "Hair", blurb: "Hair restoration and laser hair removal." },
  { id: "wellness", label: "Health & wellness", blurb: "Weight, heart, longevity, pain, sleep and migraine." },
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

// Services on neaprecisionskin.com that had no page here yet (added October 2026).
const tx = (slug: string, title: string, category: TreatmentCategory, summary: string, concerns: string[], intro: string[], list: string[] = [], program?: string): Treatment => ({
  slug,
  title,
  category,
  summary,
  image: "",
  concerns,
  program,
  intro,
  list,
  subs: [],
  more: [],
});

const added: Treatment[] = [
  tx("alumier-peel", "AlumierMD Peels", "skin", "Medical-grade AlumierMD chemical peels, chosen for your skin type and goal.", ["peel", "dull skin", "pigmentation", "acne"], [
    "AlumierMD peels use clinically tested acid blends to lift dead skin cells, brighten tone and refine texture. Your aesthetician chooses the strength and formula for your skin type, whether the goal is glow, breakouts or uneven tone.",
    "Most peels take about 30 minutes, often paired with a facial, with little to no downtime. You leave with an AlumierMD home routine to protect and extend the results.",
  ], [], "even-tone"),
  tx("vivier-signature-kits", "Vivier Signature Kits", "skin", "Vivier’s pharmaceutical-grade home kits, matched to your skin in clinic.", ["home care", "skincare", "brightening", "anti-aging"], [
    "Vivier Signature Kits bring pharmaceutical-grade skincare home in a ready-made routine. NEA matches the kit to your skin at a consultation or skin scan, so what you use at home supports the treatments you have in clinic.",
  ]),
  tx("uti-vaginal-microbiome", "UTI & Vaginal Microbiome Care", "feminine", "Testing and a care plan for recurrent UTIs, yeast infections and BV.", ["uti", "yeast infection", "bv", "vaginal microbiome"], [
    "A healthy vaginal microbiome is essential to feminine health. When it is out of balance it can contribute to recurrent UTIs, yeast infections, bacterial vaginosis and discomfort.",
    "The BioFemme vaginal microbiome test shows which microbes are present and in what balance. Your NEA team turns the result into a plan that can combine nutrition, probiotics and feminine health treatments such as IntimaLase and Incontilase.",
  ], ["BioFemme vaginal microbiome test", "Consultation to review your results", "Nutrition guidance from a Registered Dietitian", "IntimaLase or Incontilase laser sessions where they fit"]),
  tx("lipolysis", "Lipolysis (Fat Reduction)", "body", "Non-surgical fat reduction that helps the body break down stubborn fat.", ["fat", "body shape", "stubborn fat"], [
    "Lipolysis is the body’s natural process of breaking down stored fat. NEA’s non-surgical body treatments, such as truSculpt iD and laser lipolysis, heat fat cells so the body clears them over the following weeks.",
    "It is not weight loss: it reshapes areas that resist diet and exercise. Pairing it with nutrition support from NEA’s Registered Dietitian helps keep the results.",
  ]),
  tx("biosport-dexa-vo2", "BioSport: DEXA & VO2 Max", "wellness", "A DEXA body scan and VO2 max test to measure fat, muscle, bone and fitness.", ["dexa", "body composition", "vo2 max", "fitness", "athletes"], [
    "A DEXA scan measures exactly how much fat, lean muscle and bone you have, region by region, with far more precision than a scale. VO2 max measures how well your body uses oxygen, one of the strongest markers of fitness and healthy aging.",
    "Together they give athletes and anyone training a precise starting point, and a way to see real change. A DEXA body scan on its own is $175.",
  ], ["DEXA body scan (fat, muscle and bone, by region)", "VO2 max fitness test", "Review with a Registered Dietitian"]),
  tx("kinesiology", "Kinesiology Consultations", "wellness", "Exercise plans built around your genetics, lifestyle and goals.", ["exercise", "training", "performance", "kinesiology"], [
    "NEA’s kinesiology consultations use kinesiogenomics: how your genes, lifestyle and current fitness shape the way you respond to exercise. The result is an exercise plan built for your body, whether your goal is strength, endurance, recovery or peak performance.",
  ]),
  tx("heart-health", "Heart Health", "wellness", "Inflammation and metabolic markers, nutrition and lifestyle for a healthier heart.", ["heart", "cholesterol", "inflammation", "blood pressure"], [
    "Heart health starts long before symptoms. NEA looks at inflammation (hs-CRP), metabolic and vascular markers from BioAro Labs, and body composition, then builds a nutrition and lifestyle plan with a Registered Dietitian.",
    "This does not replace care from your family doctor or cardiologist; it adds measurable, everyday steps alongside it.",
  ]),
  tx("healthspan-longevity", "Healthspan & Longevity", "wellness", "Measure how you are aging, then act on it: telomeres, inflammation, DNA and body composition.", ["longevity", "healthspan", "biological age", "anti-aging"], [
    "Healthspan is the number of years you live in good health. NEA measures the markers that track it, such as telomere length, inflammation, body composition and, where it fits, your DNA, and turns them into a plan for nutrition, movement, sleep and skin.",
    "Re-testing shows whether the plan is working, in numbers.",
  ], [], "healthy-aging"),
  tx("obesity-metabolic", "Obesity & Metabolic Syndrome", "wellness", "Gut, metabolism and nutrition care for weight and metabolic health.", ["obesity", "metabolic syndrome", "weight", "gut"], [
    "Weight and metabolic health are shaped by more than calories. Gut dysbiosis, an imbalance in gut bacteria, can affect how the body stores fat, handles sugar and manages inflammation.",
    "NEA combines the BioGut microbiome test, a DEXA body scan and a Registered Dietitian’s plan, with body treatments where they help.",
  ]),
  tx("diabetes", "Diabetes Nutrition Support", "wellness", "Registered Dietitian support for blood sugar, alongside your doctor’s care.", ["diabetes", "blood sugar", "prediabetes", "insulin resistance"], [
    "NEA’s Registered Dietitian helps people living with diabetes or prediabetes build an eating plan that supports steadier blood sugar, energy and weight, using body composition and gut health testing where they add insight.",
    "This works alongside the care from your family doctor or diabetes team and never replaces prescribed treatment.",
  ]),
  tx("arthritis-pain", "Arthritis, Knee & Back Pain", "wellness", "Laser pain therapy, muscle building and nutrition for joint and back pain.", ["arthritis", "knee pain", "back pain", "joint pain"], [
    "NEA’s arthritis and pain package combines medical laser pain management with truSculpt flex muscle building, which supports the joints, and nutrition care to calm inflammation.",
  ], ["Health assessment", "Gut microbiome test with nutrition consultation", "DEXA body scan", "12 truSculpt flex sessions", "12 mini facials", "6 laser pain management sessions"]),
];

// 4K photography per treatment (falls back to the original NEA image)
export const treatments: Treatment[] = [...fromSite, ...extra, ...added].map((t) => ({ ...t, image: treatmentImage[t.slug] ?? t.image }));

export function getTreatment(slug: string) {
  return treatments.find((t) => t.slug === slug);
}

export function treatmentsByCategory(c: TreatmentCategory) {
  return treatments.filter((t) => t.category === c);
}
