/**
 * The four flagship programs. Every existing NEA treatment still exists;
 * programs simply group them around the problem a client actually has.
 *
 * PRICING: `priceFrom` values are PLACEHOLDERS for layout. Replace them with
 * NEA's real starting prices before launch (see README → "Before launch").
 */
export type Program = {
  slug: string;
  name: string;
  problem: string;
  headline: string;
  forWho: string;
  summary: string;
  rootCauses: string[];
  phases: { name: string; detail: string }[];
  includes: string[];
  tests: string[]; // BioAro test slugs
  treatments: string[]; // treatment slugs
  priceFrom: number;
  duration: string;
  image: string;
  accent: "flora" | "dermis" | "lumen" | "ink";
};

export const programs: Program[] = [
  {
    slug: "clear-skin",
    name: "Clear Skin Program",
    problem: "Acne & breakouts",
    headline: "Clear skin that stays clear.",
    forWho: "Adults with persistent or hormonal acne, breakouts that keep returning, rosacea flare-ups or acne scarring.",
    summary:
      "Acne is rarely only a skin problem. We look at oil, bacteria, hormones, diet and stress together, treat the active breakouts in clinic, and change what is feeding them at home.",
    rootCauses: [
      "Excess oil production from sebaceous glands",
      "Clogged follicles from dead skin cells and oil",
      "Inflammation from acne bacteria",
      "Hormonal changes that raise sebum",
      "Diet and stress that can make acne worse",
    ],
    phases: [
      { name: "Test", detail: "Advanced skin scan, BioSkin microbiome swab and a nutrition assessment with a Registered Dietitian." },
      { name: "Treat", detail: "Medical peels, Fotona laser and a ZO or AlumierMD routine matched to your skin." },
      { name: "Track", detail: "Re-scan at day 45 and day 90 so you can see the change, not just feel it." },
      { name: "Maintain", detail: "A simple monthly plan to keep breakouts from coming back." },
    ],
    includes: [
      "Comprehensive skin and health assessment",
      "Advanced skin scan with report",
      "Skin microbiome test with skin consultation",
      "Nutrition consultation with a Registered Dietitian",
      "Series of medical-grade chemical peels",
      "Fotona laser sessions where indicated",
      "Personalized medical-grade home routine",
      "Day 45 and day 90 progress scans",
    ],
    tests: ["bioskin", "biogut", "hormone-health"],
    treatments: ["active-acne", "acne-scarring", "rosacea", "large-pores", "medical-grade-skincare"],
    priceFrom: 1200,
    duration: "90 days",
    image: "2025/07/pexels-anna-nekrashevich-6476081-b-scaled.jpg",
    accent: "flora",
  },
  {
    slug: "even-tone",
    name: "Even Tone Program",
    problem: "Pigmentation & melasma",
    headline: "Even, luminous tone, on every skin colour.",
    forWho:
      "Anyone with dark spots, melasma, sun damage or post-acne marks, including medium and deep skin tones that need a careful, experienced approach.",
    summary:
      "Pigmentation usually needs more than one method. We combine gentle in-clinic procedures that are safe for all skin types with a medical-grade home regimen, and we look at sun, hormones and nutrition behind it.",
    rootCauses: [
      "Chronic sun exposure and sun spots",
      "Melasma triggered by hormones",
      "Post-inflammatory marks after acne",
      "Skin barrier and microbiome imbalance",
    ],
    phases: [
      { name: "Test", detail: "Skin scan that maps hidden pigment and UV damage, plus a skin microbiome swab." },
      { name: "Treat", detail: "Perfect Derma Peel with glutathione, Fotona modes safe for darker skin, and brightening products." },
      { name: "Track", detail: "Side-by-side pigment maps at each checkpoint." },
      { name: "Maintain", detail: "Daily SPF strategy and quarterly glow sessions." },
    ],
    includes: [
      "Comprehensive skin assessment",
      "Advanced skin scan with pigment mapping",
      "Skin microbiome test with consultation",
      "Perfect Derma Peel series",
      "Fotona laser toning where indicated",
      "Brightening medical-grade home kit",
      "Progress scans and photos",
    ],
    tests: ["bioskin", "vitamin-d", "essential-vitamin-health"],
    treatments: ["hyperpigmentation-melasma", "perfect-derma-peel", "facials", "stretch-marks-and-scars"],
    priceFrom: 950,
    duration: "90 days",
    image: "2025/04/w4dj3mshhq0.jpg",
    accent: "dermis",
  },
  {
    slug: "hair-regrowth",
    name: "Hair Regrowth Program",
    problem: "Thinning hair",
    headline: "Wake up the follicles that went quiet.",
    forWho: "Women and men noticing thinning, a widening part, a receding hairline or more hair in the brush.",
    summary:
      "When hair thins, follicles often become dormant rather than disappearing. We combine PRP and Fotona laser restoration with nutrition and hormone insight to support regrowth from the inside too.",
    rootCauses: [
      "Dormant hair follicles",
      "Nutrient gaps that affect the hair cycle",
      "Hormone changes, including DHT",
      "Stress and cortisol",
    ],
    phases: [
      { name: "Test", detail: "Scalp check, hormone and vitamin markers, and a nutrition assessment." },
      { name: "Treat", detail: "PRP sessions alternating with Fotona laser hair restoration, two weeks apart." },
      { name: "Track", detail: "Standardized scalp photos at every visit." },
      { name: "Maintain", detail: "Maintenance PRP and a nutrition plan to protect results." },
    ],
    includes: [
      "Comprehensive medical assessment",
      "Comprehensive nutrition assessment with a Registered Dietitian",
      "Disease-based DNA test with consultation",
      "6 PRP treatments",
      "6 laser hair restoration treatments",
      "Pharmaceutical compound to help promote growth",
      "3 nutrition follow-ups",
    ],
    tests: ["dht", "cortisol", "essential-vitamin-health", "disease-based-dna"],
    treatments: ["hair-restoration", "prp-injections"],
    priceFrom: 2400,
    duration: "6 months",
    image: "2024/06/q-kkmb8go1e-683x1024.jpg",
    accent: "ink",
  },
  {
    slug: "healthy-aging",
    name: "Healthy Aging Program",
    problem: "Lines, laxity & 40+",
    headline: "Age well, measured from the inside.",
    forWho:
      "Adults 40+ noticing lines, loose skin, muscle loss or lower energy, and anyone who wants a longevity baseline to improve against.",
    summary:
      "Skin ages with the rest of the body. We pair Fotona tightening, injectables and facials with DEXA body composition, truSculpt flex for muscle, and inflammation and biological-age markers.",
    rootCauses: [
      "Loss of collagen, elastin, bone and fat in the face",
      "Muscle loss with age",
      "Chronic low-grade inflammation",
      "Sun damage over time",
    ],
    phases: [
      { name: "Test", detail: "Skin scan, DEXA body composition, inflammation and telomere markers." },
      { name: "Treat", detail: "Fotona 4D or intra-oral tightening, neuromodulators or fillers, PRP microneedling and Flex." },
      { name: "Track", detail: "Skin, muscle and marker changes on one report." },
      { name: "Maintain", detail: "A yearly re-test and a facial every two months." },
    ],
    includes: [
      "Comprehensive medical assessment",
      "Regular follow-ups",
      "2 nutrition consultations with a Registered Dietitian",
      "1 gut microbiome with nutrition consultation",
      "1 skin microbiome with skin consultation",
      "DEXA body composition",
      "4 Flex treatments to increase muscle mass and strength",
      "6 facials, 1 every 2 months",
      "2 PRP sessions with microneedling",
      "3 laser skin tightening sessions or intra-oral",
      "2 sessions with a kinesiologist",
    ],
    tests: ["core-inflammation-aging", "telomere-length", "biogut", "bioskin"],
    treatments: ["lines-wrinkles-sun-damage", "facial-laser", "neuromodulators", "dermal-fillers", "muscle-sculpting", "fotona-laser"],
    priceFrom: 3900,
    duration: "12 months",
    image: "2025/08/cherrydeck-4p77t8fzGFo-unsplash-3-2-scaled.jpg",
    accent: "lumen",
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
