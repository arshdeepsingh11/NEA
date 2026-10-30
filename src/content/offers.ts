/**
 * Growth plan offers — the "front doors" that bring new clients in.
 * Each one is honest by design: the scan shows what is there, and the
 * recommendation matches it, including "your skin is healthy".
 */
export type Offer = {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  summary: string;
  value?: string;
  spots?: string;
  steps: { title: string; detail: string }[];
  leadsTo: string[];
  image: string;
  audience: string;
  /** optional silent film shown instead of the photo */
  film?: { src: string; poster: string };
};

export const offers: Offer[] = [
  {
    slug: "skin-scan",
    name: "NEA Skin Health Report",
    kicker: "Complimentary this month",
    headline: "See what your skin has been trying to tell you.",
    summary:
      "Our AI skin imager photographs your face in 8 kinds of light and looks below the surface: hidden pigmentation, UV damage, pores, texture, redness and hydration. You leave with a clear report and two or three priorities, never a hard sell.",
    value: "A $150 assessment",
    spots: "20 scans each week",
    steps: [
      { title: "Book your spot", detail: "Pick a time online. Tell us your age and your main concern so we prepare." },
      { title: "The scan", detail: "About 15 seconds, no contact. 8 kinds of light capture layers you cannot see in a mirror." },
      { title: "See it on screen", detail: "Your aesthetician walks you through each image and what it means." },
      { title: "Your report", detail: "Two or three priorities, the likely causes (including gut and nutrition) and a simple three-level plan." },
      { title: "Re-scan in 90 days", detail: "If you start products or treatment, we scan again for free so you can see the change." },
    ],
    leadsTo: ["Products to start at home", "A treatment program", "Membership to maintain results"],
    image: "2024/01/clinical-facial-treatments.jpg",
    audience: "Anyone curious about their skin.",
  },
  {
    slug: "body-truth-scan",
    name: "Body Truth Scan",
    kicker: "DEXA body composition",
    headline: "See what your body is really made of.",
    summary:
      "DEXA measures fat, lean muscle and bone, region by region, far beyond what a scale can tell you. It is the honest baseline for weight loss, muscle building, GLP-1 support and athletic training.",
    steps: [
      { title: "Book", detail: "Wear comfortable clothes without metal." },
      { title: "Scan", detail: "Lie still for a few minutes on the open scanner." },
      { title: "Understand", detail: "Review fat, muscle and bone with a Registered Dietitian or kinesiologist." },
      { title: "Plan", detail: "Nutrition, truSculpt flex or body contouring, matched to your numbers." },
    ],
    leadsTo: ["Nutrition programs", "truSculpt flex", "TightSculpting", "Sports package"],
    image: "2024/06/zqndcje06vm-e1718734658676.jpg",
    audience: "Gyms, athletes, weight-loss journeys and people on GLP-1 medication.",
    film: { src: "/media/nea-body-hologram.mp4", poster: "/media/nea-body-hologram.jpg" },
  },
  {
    slug: "bring-your-bag",
    name: "Bring Your Bag Skincare Audit",
    kicker: "Bring your products",
    headline: "What is working, what is wasting money, what is hurting your skin.",
    summary:
      "Bring the products you use today. We review ingredients against your skin scan and tell you what to keep, what to stop and what is missing, so your routine is shorter and works better.",
    steps: [
      { title: "Pack your bag", detail: "Cleansers, serums, SPF, moisturizers, even supplements." },
      { title: "Scan + review", detail: "We read every label against your skin report." },
      { title: "Keep, stop, add", detail: "A simple list you can follow from tomorrow morning." },
    ],
    leadsTo: ["Personalized medical-grade routine", "Skin Health Report"],
    image: "2024/01/tab-1.jpg",
    audience: "Anyone with a crowded bathroom shelf and unsure results.",
  },
  {
    slug: "calgary-skin",
    name: "Calgary Skin Program",
    kicker: "Built for this city",
    headline: "Calgary is hard on your skin. Here is what it is doing to yours.",
    summary:
      "Dry prairie air, chinook swings, long cold winters and strong sun at high altitude. A seasonal plan that protects your barrier in winter and your tone in summer.",
    steps: [
      { title: "Season check", detail: "Skin scan focused on barrier, hydration and UV damage." },
      { title: "Winter barrier", detail: "Hydrating facials, barrier repair and vitamin D support." },
      { title: "Summer defence", detail: "SPF strategy, antioxidants and post-sun recovery." },
    ],
    leadsTo: ["Facials", "Even Tone Program", "Membership"],
    image: "2023/11/ryunosuke-kikuno-idsy4oNeY_Q-unsplash.jpg",
    audience: "Every Calgarian, especially in winter and after Stampede.",
  },
  {
    slug: "bridal-glow",
    name: "Bridal Glow Countdown",
    kicker: "6 to 12 months before",
    headline: "Look like yourself, on your best day.",
    summary:
      "A skin scan 6–12 months before the wedding and a timeline plan to peak on the day. Options for the bride, the groom and the family, with nothing new tried in the final weeks.",
    steps: [
      { title: "12–6 months", detail: "Scan, nutrition plan and corrective work for acne, pigment or texture." },
      { title: "6–2 months", detail: "Peels, laser and injectables timed safely." },
      { title: "Final 4 weeks", detail: "Glow facials and calm, proven products only." },
    ],
    leadsTo: ["Clear Skin or Even Tone Program", "Facials", "Laser hair removal"],
    image: "2024/06/longevity-wellness-packages.jpg",
    audience: "Couples and families planning a wedding.",
  },
  {
    slug: "mens-skin-check",
    name: "Men’s Skin Check",
    kicker: "At your barbershop",
    headline: "Two minutes in the chair you already trust.",
    summary:
      "We set up skin check days at partner barbershops. Quick scan, straight answers on acne, razor bumps, hair thinning and sun damage, and a card to book at NEA.",
    steps: [
      { title: "Quick check", detail: "A fast scan at the barbershop." },
      { title: "Straight talk", detail: "What we see and what actually helps." },
      { title: "Book if you want", detail: "A referral card for a full Skin Health Report." },
    ],
    leadsTo: ["Treatments for men", "Hair Regrowth Program", "Laser hair removal"],
    image: "2024/01/1-1.jpg",
    audience: "Men who rarely visit a skin clinic.",
  },
];

export const getOffer = (slug: string) => offers.find((o) => o.slug === slug);

/** Membership tiers. PRICES ARE PLACEHOLDERS — confirm before launch. */
export const memberships = [
  {
    id: "glow",
    name: "Glow",
    price: 99,
    blurb: "Stay consistent between visits.",
    features: ["1 signature facial each month", "10% off medical-grade products", "Quarterly skin re-scan", "Member booking window"],
  },
  {
    id: "glow-plus",
    name: "Glow Plus",
    price: 189,
    popular: true,
    blurb: "Results you can measure, every quarter.",
    features: [
      "Everything in Glow",
      "1 advanced treatment credit each month (peel, laser facial or dermaplaning)",
      "15% off products and injectables",
      "Quarterly Registered Dietitian check-in",
      "Priority booking",
    ],
  },
  {
    id: "glow-elite",
    name: "Glow Elite",
    price: 349,
    blurb: "Skin and healthspan, tracked yearly.",
    features: [
      "Everything in Glow Plus",
      "Annual BioSkin + BioGut microbiome re-test",
      "Annual DEXA body composition",
      "20% off all treatments",
      "WhatsApp nutrition support",
      "Same-week appointments",
    ],
  },
] as const;

export const membershipMatrix: { label: string; tiers: [boolean | string, boolean | string, boolean | string] }[] = [
  { label: "Monthly signature facial", tiers: [true, true, true] },
  { label: "Quarterly skin re-scan", tiers: [true, true, true] },
  { label: "Product discount", tiers: ["10%", "15%", "20%"] },
  { label: "Advanced treatment credit", tiers: [false, "Monthly", "Monthly"] },
  { label: "Registered Dietitian check-in", tiers: [false, "Quarterly", "Quarterly"] },
  { label: "Microbiome re-test", tiers: [false, false, "Yearly"] },
  { label: "DEXA body composition", tiers: [false, false, "Yearly"] },
  { label: "WhatsApp nutrition support", tiers: [false, false, true] },
  { label: "Booking", tiers: ["Member window", "Priority", "Same-week"] },
];
