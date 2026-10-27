/**
 * Advanced testing fulfilled by BioAro Labs (CLIA-registered laboratories).
 * Only tests that support NEA's skin, hair, body and feminine-health work are listed.
 * Prices are BioAro list prices from bioarolabs.com/shop (CAD), October 2026.
 */
export type LabTest = {
  slug: string;
  name: string;
  price: number;
  group: "microbiome" | "hormones" | "nutrition" | "aging" | "genetics";
  bestFor: string;
  neaUse: string;
  /** Only shown when confirmed on bioarolabs.com */
  sample?: string;
  results?: string;
  featured?: boolean;
};

export const testGroups: { id: LabTest["group"]; label: string; blurb: string }[] = [
  { id: "microbiome", label: "Microbiome", blurb: "Skin, gut and vaginal ecosystems." },
  { id: "hormones", label: "Hormones", blurb: "Acne, hair, energy and cycle." },
  { id: "nutrition", label: "Vitamins & nutrition", blurb: "Building blocks for skin and hair." },
  { id: "aging", label: "Inflammation & aging", blurb: "Biological age and healthspan." },
  { id: "genetics", label: "DNA", blurb: "Inherited risk and how you respond." },
];

export const labTests: LabTest[] = [
  {
    slug: "bioskin",
    name: "BioSkin",
    price: 279,
    group: "microbiome",
    bestFor: "Persistent skin concerns, irritation, or skincare response.",
    neaUse:
      "Identifies the bacterial, fungal and archaeal species on your skin so your aesthetician can choose peels, products and laser settings with your skin’s ecosystem in mind.",
    sample: "Skin swab of the affected area. No antibiotics in the prior 2 months.",
    results: "3–4 weeks",
    featured: true,
  },
  {
    slug: "biogut",
    name: "BioGut",
    price: 279,
    group: "microbiome",
    bestFor: "Digestive symptoms and gut microbiome assessment.",
    neaUse: "The core of NEA’s inside-out approach: your Registered Dietitian uses it to build a gut-to-skin nutrition plan.", 
    featured: true,
  },
  {
    slug: "biofemme",
    name: "BioFemme",
    price: 279,
    group: "microbiome",
    bestFor: "Recurring yeast infections, BV, irritation, odor, or discharge.",
    neaUse: "Vaginal microbiome insight that guides NEA’s feminine health and UTI packages.", 
    featured: true,
  },
  {
    slug: "hormone-health",
    name: "Hormone Health",
    price: 499,
    group: "hormones",
    bestFor: "People looking to understand their hormone status and balance.",
    neaUse: "Useful for hormonal acne, hair thinning and unexplained changes in skin.", 
  },
  { slug: "dht", name: "DHT (Dihydrotestosterone)", price: 95, group: "hormones", bestFor: "Assessing testosterone-related hormone changes.", neaUse: "A key marker behind pattern hair loss.",  },
  { slug: "cortisol", name: "Cortisol", price: 129, group: "hormones", bestFor: "Understanding cortisol balance and stress-related changes.", neaUse: "Stress shows up in breakouts and shedding; this puts a number on it.",  },
  { slug: "total-testosterone", name: "Total Testosterone", price: 110, group: "hormones", bestFor: "Understanding testosterone status and hormone balance.", neaUse: "Supports men’s health, acne and hair assessments.",  },
  { slug: "estradiol", name: "Estradiol (E2)", price: 85, group: "hormones", bestFor: "Estrogen balance and reproductive health assessment.", neaUse: "Relevant to melasma, perimenopause skin and feminine health.",  },
  { slug: "dhea-s", name: "DHEA-S", price: 180, group: "hormones", bestFor: "Understanding hormone changes over time.", neaUse: "Adrenal androgen linked to oil production and acne.",  },
  {
    slug: "essential-vitamin-health",
    name: "Essential Vitamin Health",
    price: 349.99,
    group: "nutrition",
    bestFor: "Vitamin status and supplementation monitoring.",
    neaUse: "Vitamins A, D, E and K status for healing, tone and hair.", 
  },
  { slug: "vitamin-d", name: "Vitamin D, 25-Hydroxy", price: 115, group: "nutrition", bestFor: "Low vitamin D, limited sun exposure, or supplementation monitoring.", neaUse: "Long Calgary winters make this one of the most useful skin and mood markers.",  },
  { slug: "vitamin-a", name: "Vitamin A (Retinol)", price: 115, group: "nutrition", bestFor: "Vitamin A status and supplementation monitoring.", neaUse: "Vitamin A drives skin cell turnover.",  },
  { slug: "core-amino-acid", name: "Core Amino Acid Balance", price: 149.99, group: "nutrition", bestFor: "Protein building blocks for collagen and muscle.", neaUse: "Pairs with DEXA and truSculpt flex for muscle and collagen support.",  },
  {
    slug: "core-inflammation-aging",
    name: "Core Inflammation Aging",
    price: 489.99,
    group: "aging",
    bestFor: "Monitoring low-grade inflammation.",
    neaUse: "Inflammation ages skin. This gives your Healthy Aging plan a baseline.", 
  },
  { slug: "hs-crp", name: "hs-CRP", price: 60, group: "aging", bestFor: "Inflammation and cardiovascular risk assessment.", neaUse: "A simple inflammation check for rosacea, acne and aging plans.",  },
  { slug: "telomere-length", name: "Telomere Length Testing", price: 299, group: "aging", bestFor: "Longevity and biological aging insights.", neaUse: "A biological-age baseline to re-test against each year.",  },
  {
    slug: "disease-based-dna",
    name: "Disease-Based DNA Test",
    price: 499,
    group: "genetics",
    bestFor: "Condition-specific genetic evaluation.",
    neaUse: "Included in NEA’s hair and feminine health packages.", 
  },
  { slug: "pharmacogenomics", name: "Pharmacogenomics Test", price: 499, group: "genetics", bestFor: "Medication selection and dose optimization.", neaUse: "Know how your body processes medicines before a treatment plan.",  },
  { slug: "wgs-30x", name: "Whole Genome Sequencing 30X", price: 699, group: "genetics", bestFor: "Broad genetic and inherited-risk insights.", neaUse: "Your DNA read once and used for life across the BioAro ecosystem.",  },
];

export const getTest = (slug: string) => labTests.find((t) => t.slug === slug);
