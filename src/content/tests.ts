/**
 * Every BioAro Labs test, shown on NEA's own site (CLIA-registered laboratories).
 * Names, prices, "best suited for", sample, preparation, turnaround and biomarker counts are from bioarolabs.com/shop
 * (CAD list prices, October 2026). "plain" and "neaUse" are NEA's own plain-language summaries.
 * Buy now opens the exact test on BioAro's shop with its Add to Cart button: buyUrl(handle).
 */
export type TestGroup = "microbiome" | "hormones" | "nutrition" | "aging" | "organs" | "brain" | "genetics";

export type LabTest = {
  slug: string;
  /** BioAro's product handle (bioarolabs.com/shop?test=…) */
  handle: string;
  name: string;
  price: number;
  group: TestGroup;
  bestFor: string;
  /** one plain sentence: what the result tells you */
  plain: string;
  /** how NEA uses it */
  neaUse: string;
  sample?: string;
  prep?: string;
  results?: string;
  markers?: string;
  /** BioAro offers it in the USA only, with a referral or prescription */
  usaOnly?: boolean;
  featured?: boolean;
  /** BioAro has no product image; use this photo instead */
  photo?: string;
};

/** Every BioAro group (program pages still label tests from any group). */
export const allTestGroups: { id: TestGroup; label: string; blurb: string; system: string }[] = [
  { id: "microbiome", label: "Gut & skin", blurb: "The tiny living things on your skin and in your gut.", system: "Gut & skin" },
  { id: "hormones", label: "Hormones", blurb: "Chin breakouts, hair thinning, cycle skin and stress.", system: "Hormones" },
  { id: "nutrition", label: "Vitamins", blurb: "What your skin and hair are built from.", system: "Vitamins" },
  { id: "aging", label: "Inflammation & aging", blurb: "Hidden inflammation and how fast your body is aging.", system: "Aging" },
  { id: "organs", label: "Heart, kidney & tissue", blurb: "Vascular strain, kidney filtration and tissue repair.", system: "Heart & kidney" },
  { id: "brain", label: "Brain health", blurb: "Blood markers linked to memory and brain aging.", system: "Brain" },
  { id: "genetics", label: "DNA & genome", blurb: "Inherited risk and how your body responds to medicines.", system: "DNA" },
];

const S = "Serum";
const P = "Plasma";
const NONE = "No special instructions";
const W23 = "2–3 weeks";
const ABX = "No antibiotics in the prior 2 months";

/** The full BioAro Labs catalogue (used by program pages and lookups). */
export const bioaroTests: LabTest[] = [
  // Microbiome
  { slug: "bioskin", handle: "the-bioskin-test", name: "BioSkin", price: 279, group: "microbiome", bestFor: "Persistent skin concerns, irritation, or skincare response.", plain: "Which bacteria, fungi and archaea live on your skin, and whether they are in balance.", neaUse: "Your aesthetician uses it to choose peels, products and laser settings that suit your skin’s ecosystem.", sample: "Skin swab of the affected area", prep: ABX, results: "3–4 weeks", markers: "1 biomarker", featured: true },
  { slug: "biogut", handle: "the-biogut-test", name: "BioGut", price: 279, group: "microbiome", bestFor: "Digestive symptoms and gut microbiome assessment.", plain: "The full mix of microbes in your gut, and which ones are too high or too low.", neaUse: "The core of NEA’s inside-out approach: your Registered Dietitian turns it into a gut-to-skin nutrition plan.", sample: "Stool sample", prep: ABX, results: "3–4 weeks", markers: "1 biomarker", featured: true },
  { slug: "biofemme", handle: "the-biofemme-test", name: "BioFemme", price: 279, group: "microbiome", bestFor: "Recurring yeast infections, BV, irritation, odor, or discharge.", plain: "The balance of microbes in your vaginal microbiome.", neaUse: "Guides NEA’s feminine health and UTI care.", sample: "Vaginal swabs", prep: ABX, results: "3–4 weeks", markers: "1 biomarker", featured: true },
  { slug: "biodental", handle: "the-biodental-test", name: "BioDental", price: 279, group: "microbiome", bestFor: "Gum concerns, bad breath, cavities, or recurring oral issues.", plain: "The microbes in your mouth that affect gums, breath and teeth.", neaUse: "Completes the microbiome picture alongside gut and skin.", sample: "Oral swab", prep: ABX, results: "3–4 weeks", markers: "1 biomarker" },

  // Hormones
  { slug: "hormone-health", handle: "hormone-health", name: "Hormone Health", price: 499, group: "hormones", bestFor: "People looking to understand their hormone status and balance.", plain: "Six key hormone markers: androgens, adrenal function and how much hormone is available to your body.", neaUse: "Useful for hormonal acne, hair thinning and unexplained skin changes.", sample: S, prep: NONE, results: W23, markers: "6 biomarkers" },
  { slug: "ultra-hormone-health", handle: "ultra-hormone-health", name: "Ultra Hormone Health", price: 649, group: "hormones", bestFor: "People seeking a broader understanding of their hormone health.", plain: "Everything in Hormone Health plus estradiol and DHT, for the full androgen–estrogen picture.", neaUse: "The fuller panel for hair loss, melasma and perimenopause skin.", sample: S, prep: NONE, results: W23, markers: "8 biomarkers" },
  { slug: "dht", handle: "dht-dihydrotestosterone", name: "DHT (Dihydrotestosterone)", price: 95, group: "hormones", bestFor: "Assessing testosterone-related hormone changes.", plain: "The strong androgen made from testosterone that can shrink hair follicles.", neaUse: "A key marker behind pattern hair loss.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "cortisol", handle: "cortisol", name: "Cortisol", price: 129, group: "hormones", bestFor: "Understanding cortisol balance and stress-related changes.", plain: "Your main stress hormone, made by the adrenal glands.", neaUse: "Stress shows up as breakouts and shedding; this puts a number on it.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "total-testosterone", handle: "testosterone", name: "Total Testosterone", price: 110, group: "hormones", bestFor: "Understanding testosterone status and hormone balance.", plain: "The hormone behind muscle, energy, mood and libido.", neaUse: "Supports men’s health, acne and hair assessments.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "estradiol", handle: "estradiol-e2", name: "Estradiol (E2)", price: 85, group: "hormones", bestFor: "Estrogen balance and reproductive health assessment.", plain: "The main estrogen in your reproductive years.", neaUse: "Relevant to melasma, perimenopause skin and feminine health.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "progesterone", handle: "progesterone", name: "Progesterone", price: 150, group: "hormones", bestFor: "Cycle, fertility, and hormone evaluation.", plain: "The hormone that shapes your cycle and fertility.", neaUse: "Helps explain breakouts that follow your cycle.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "dhea-s", handle: "dhea-s", name: "DHEA-S", price: 180, group: "hormones", bestFor: "Understanding hormone changes over time.", plain: "An adrenal hormone your body turns into testosterone and estrogen; it falls with age.", neaUse: "Linked to oil production and acne.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "shbg", handle: "shbg-sex-hormone-binding-globulin", name: "SHBG", price: 79, group: "hormones", bestFor: "Understanding hormone levels and interpretation.", plain: "The protein that decides how much of your sex hormones are actually active.", neaUse: "Makes testosterone and estradiol results meaningful.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "androstenedione", handle: "androstenedione", name: "Androstenedione", price: 105, group: "hormones", bestFor: "Assessing reproductive and hormone balance.", plain: "A building block your body uses to make androgens and estrogens.", neaUse: "Adds context for hormonal acne and excess hair growth.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },

  // Vitamins & nutrition
  { slug: "essential-vitamin-health", handle: "essential-vitamin-health", name: "Essential Vitamin Health", price: 349.99, group: "nutrition", bestFor: "Vitamin status and supplementation monitoring.", plain: "Vitamins D, E, A and K together, the fat-soluble vitamins skin depends on.", neaUse: "Healing, tone and hair all draw on these.", sample: S, prep: NONE, results: W23, markers: "6 biomarkers" },
  { slug: "vitamin-d", handle: "vitamin-d2-d3", name: "Vitamin D, 25-Hydroxy (D2 + D3)", price: 115, group: "nutrition", bestFor: "Low vitamin D, limited sun exposure, or supplementation monitoring.", plain: "Your vitamin D level, for bones, immunity and mood.", neaUse: "Long Calgary winters make this one of the most useful skin and mood markers.", sample: S, prep: NONE, results: W23, markers: "2 biomarkers" },
  { slug: "vitamin-a", handle: "vitamin-a-retinol", name: "Vitamin A (Retinol)", price: 115, group: "nutrition", bestFor: "Vitamin A status and supplementation monitoring.", plain: "Your vitamin A level, which drives skin cell renewal.", neaUse: "Important before and during retinoid-based skincare.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "vitamin-e", handle: "vitamin-e-α-γ", name: "Vitamin E (Alpha & Gamma)", price: 115, group: "nutrition", bestFor: "Vitamin E status and supplementation monitoring.", plain: "Your vitamin E level, the antioxidant that protects cell membranes.", neaUse: "Part of the antioxidant picture for sun-damaged and aging skin.", sample: S, prep: NONE, results: W23, markers: "2 biomarkers", photo: "1648139346494-2b961c5a2bb7" },
  { slug: "vitamin-k1", handle: "vitamin-k1", name: "Vitamin K1", price: 115, group: "nutrition", bestFor: "Vitamin K status and supplementation monitoring.", plain: "Your vitamin K1 level, for normal clotting and bones.", neaUse: "Useful before procedures that can bruise.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "resveratrol", handle: "resveratrol", name: "Resveratrol", price: 120, group: "nutrition", bestFor: "Dietary or supplementation monitoring.", plain: "How much resveratrol (a plant antioxidant) is in your blood from food or supplements.", neaUse: "Checks whether an antioxidant supplement is actually absorbed.", sample: S, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "core-amino-acid", handle: "core-amino-acid-balance", name: "Core Amino Acid Balance", price: 149.99, group: "nutrition", bestFor: "Protein building blocks for collagen and muscle.", plain: "The essential amino acids your body builds collagen, muscle and hormones from.", neaUse: "Pairs with DEXA and truSculpt flex for muscle and collagen support.", sample: "Blood", prep: "No special preparation", results: W23, markers: "10 biomarkers", photo: "1482049016688-2d3e1b311543" },
  { slug: "advanced-amino-acid", handle: "advanced-amino-acid-metabolism", name: "Advanced Amino Acid Metabolism", price: 199.99, group: "nutrition", bestFor: "Muscle metabolism, protein turnover and cardiometabolic pathways.", plain: "Core amino acids plus nine metabolites for muscle, energy and heart pathways.", neaUse: "For body composition and sports nutrition plans.", sample: "Blood", prep: "No special preparation", results: W23, photo: "1532550907401-a500c9a57435" },
  { slug: "ultra-amino-acid", handle: "ultra-amino-acid-profile", name: "Ultra Amino Acid Profile", price: 249.99, group: "nutrition", bestFor: "The most complete amino acid and metabolism picture.", plain: "BioAro’s fullest amino acid profile, adding 16 specialised metabolites.", neaUse: "For detailed nutrition work with your Registered Dietitian.", sample: "Blood", prep: "No special preparation", results: W23, photo: "1693996046865-19217d179161" },

  // Inflammation & aging
  { slug: "core-inflammation-aging", handle: "core-inflammation-aging", name: "Core Inflammation Aging", price: 489.99, group: "aging", bestFor: "Monitoring low-grade inflammation.", plain: "Five markers of the quiet, low-grade inflammation that ages skin and body.", neaUse: "Gives your Healthy Aging plan a baseline to beat.", sample: P, prep: NONE, results: W23, markers: "5 biomarkers" },
  { slug: "advanced-inflammation-aging", handle: "advanced-inflammation-aging", name: "Advanced Inflammation Aging", price: 699.99, group: "aging", bestFor: "Inflammation and metabolic health insights.", plain: "Eight markers of inflammation, cellular stress and metabolic strain.", neaUse: "For longevity plans that track change year on year.", sample: P, prep: NONE, results: W23, markers: "8 biomarkers" },
  { slug: "ultra-inflammation-aging", handle: "ultra-inflammation-aging", name: "Ultra Inflammation Aging", price: 899, group: "aging", bestFor: "Overall inflammation and biological health insights.", plain: "Eleven markers covering inflammation, organ stress, kidney filtration and tissue repair.", neaUse: "The most complete biological-aging baseline.", sample: P, prep: NONE, results: W23, markers: "11 biomarkers" },
  { slug: "hs-crp", handle: "high-sensitive-crp-hs-crp", name: "hs-CRP", price: 60, group: "aging", bestFor: "Inflammation and cardiovascular risk assessment.", plain: "A sensitive check for low-grade inflammation in the body.", neaUse: "A simple inflammation check for rosacea, acne and aging plans.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "il-6", handle: "il-6", name: "IL-6 (Interleukin-6)", price: 140, group: "aging", bestFor: "Assessing active inflammation and immune activity.", plain: "A messenger the immune system releases when inflammation is active.", neaUse: "Adds depth to an inflammation baseline.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "il-10", handle: "il-10", name: "IL-10 (Interleukin-10)", price: 105, group: "aging", bestFor: "Understanding inflammatory regulation and immune balance.", plain: "The immune messenger that calms inflammation down.", neaUse: "Shows whether inflammation is being kept in check.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "tnf-alpha", handle: "tnf-alpha", name: "TNF-α", price: 140, group: "aging", bestFor: "Inflammation and immune-response assessment.", plain: "A central driver of inflammatory signalling.", neaUse: "For chronic inflammatory skin and metabolic concerns.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "gdf-15", handle: "gdf-15", name: "GDF-15", price: 130, group: "aging", bestFor: "Cellular stress and metabolic health assessment.", plain: "A signal your cells send when they are under stress.", neaUse: "An early marker of strain on the body.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "mcp-1", handle: "mcp-1-ccl2", name: "MCP-1 (CCL2)", price: 105, group: "aging", bestFor: "Inflammatory and immune activity assessment.", plain: "A signal that calls immune cells to inflamed areas.", neaUse: "Adds context to metabolic and inflammatory risk.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "telomere-length", handle: "telomere-length-testing", name: "Telomere Length Testing", price: 299, group: "aging", bestFor: "Longevity and biological aging insights.", plain: "The length of the protective caps on your chromosomes, a window on biological age.", neaUse: "A biological-age baseline to re-test against each year.", sample: "Whole blood", prep: "Prescription required", results: "4–6 weeks", markers: "1 biomarker", usaOnly: true },

  // Heart, kidney & tissue
  { slug: "pai-1", handle: "pai-1-total", name: "PAI-1 Total", price: 105, group: "organs", bestFor: "Metabolic and vascular health assessment.", plain: "A protein that controls how well the body breaks down clots; it rises with metabolic stress.", neaUse: "For heart health and metabolic syndrome plans.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "cystatin-c", handle: "cystatin-c", name: "Cystatin C", price: 99, group: "organs", bestFor: "Kidney function assessment.", plain: "A sensitive measure of how well your kidneys filter.", neaUse: "An early kidney check alongside metabolic plans.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "b2m", handle: "β2-microglobulin-b2m", name: "β2-Microglobulin (B2M)", price: 89, group: "organs", bestFor: "Immune activity and kidney health assessment.", plain: "A protein that reflects immune activity and kidney clearance.", neaUse: "Adds to kidney and immune insight.", sample: P, prep: NONE, results: W23, markers: "1 biomarker", photo: "1579154341184-22069e4614d2" },
  { slug: "timp-1", handle: "timp-1", name: "TIMP-1", price: 105, group: "organs", bestFor: "Tissue remodeling and fibrosis assessment.", plain: "A regulator of tissue repair and remodelling.", neaUse: "Relevant to how tissues, including skin, rebuild.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },

  // Brain
  { slug: "brain-health", handle: "brain-health", name: "Brain Health", price: 749.99, group: "brain", bestFor: "Memory or cognitive health evaluation.", plain: "Beta-amyloid and p-Tau217 blood markers linked to brain aging, read together.", neaUse: "Part of a medically guided longevity plan.", sample: P, prep: NONE, results: W23, markers: "3 biomarkers" },
  { slug: "p-tau217", handle: "p-tau-217", name: "p-Tau217", price: 430, group: "brain", bestFor: "Adults with cognitive symptoms undergoing medical evaluation.", plain: "A blood marker associated with Alzheimer’s-related changes.", neaUse: "Only with medical guidance.", sample: P, prep: NONE, results: W23, markers: "1 biomarker" },
  { slug: "beta-amyloid", handle: "beta-amyloid-40-42", name: "Beta-Amyloid 40/42 Ratio", price: 450, group: "brain", bestFor: "Memory concerns or medically guided cognitive evaluation.", plain: "The balance of two amyloid proteins linked to brain plaque.", neaUse: "Only with medical guidance.", sample: P, prep: NONE, results: W23, markers: "2 biomarkers" },

  // DNA & genome
  { slug: "disease-based-dna", handle: "disease-based-dna-test", name: "Disease-Based DNA Test", price: 499, group: "genetics", bestFor: "Condition-specific genetic evaluation.", plain: "Your genes checked for variants linked to specific conditions.", neaUse: "Included in NEA’s hair and feminine health packages.", sample: "Whole blood", prep: "Referral needed", results: "4–6 weeks", markers: "1 biomarker", usaOnly: true },
  { slug: "pharmacogenomics", handle: "pharmacogenomics-test", name: "Pharmacogenomics Test", price: 499, group: "genetics", bestFor: "Medication selection and dose optimization.", plain: "How your genes affect the way you process medicines.", neaUse: "Know how your body handles medicines before a treatment plan.", sample: "Whole blood", prep: "Referral needed", results: "4–6 weeks", markers: "1 biomarker", usaOnly: true },
  { slug: "wgs-30x", handle: "whole-genome-sequencing-30x", name: "Whole Genome Sequencing 30X", price: 699, group: "genetics", bestFor: "Broad genetic and inherited-risk insights.", plain: "Nearly your entire genome read once, for inherited-risk insight for life.", neaUse: "Your DNA read once and used across the BioAro ecosystem.", usaOnly: true },
  { slug: "wgs-100x", handle: "genome-testing", name: "Whole Genome Sequencing 100X", price: 1499, group: "genetics", bestFor: "Comprehensive genetic and inherited-risk assessment.", plain: "Your whole genome at high depth for the most detailed genetic picture.", neaUse: "For complex or unexplained conditions with your doctor.", sample: "Whole blood", prep: "Referral needed", results: "4–6 weeks", markers: "1 biomarker", usaOnly: true },
  { slug: "wes-100x", handle: "whole-exome-sequencing-100x", name: "Whole Exome Sequencing 100X", price: 499, group: "genetics", bestFor: "Rare disease and inherited-variant assessment.", plain: "The protein-coding parts of nearly every gene, read at high depth.", neaUse: "For rare or inherited conditions with your doctor.", usaOnly: true },
  { slug: "cfdna", handle: "comprehensive-cell-free-dna-analysis", name: "Comprehensive Cell-free DNA Analysis", price: 1700, group: "genetics", bestFor: "Tumor profiling, treatment selection, or therapy monitoring.", plain: "Tumour and inherited DNA compared from one blood draw, for cancer care decisions.", neaUse: "Ordered with your oncology team, not for screening.", sample: "Whole blood (cell-free DNA tube)", prep: "Referral needed", results: "4–6 weeks", markers: "1 biomarker", usaOnly: true },
];

/** The tests NEA shows: only what explains your skin, meaning hormones, gut and skin, and vitamins. */
const SHOWN_GROUPS: TestGroup[] = ["hormones", "microbiome", "nutrition"];
const NOT_SHOWN = new Set(["biodental", "resveratrol", "advanced-amino-acid", "ultra-amino-acid"]);
export const labTests: LabTest[] = bioaroTests.filter((t) => SHOWN_GROUPS.includes(t.group) && !NOT_SHOWN.has(t.slug)).sort((a, b) => SHOWN_GROUPS.indexOf(a.group) - SHOWN_GROUPS.indexOf(b.group));
export const testGroups = allTestGroups.filter((g) => SHOWN_GROUPS.includes(g.id)).sort((a, b) => SHOWN_GROUPS.indexOf(a.id) - SHOWN_GROUPS.indexOf(b.id));

export const getTest = (slug: string) => bioaroTests.find((t) => t.slug === slug);

/** Opens the exact test on BioAro Labs' shop, with its Add to Cart button. */
export const buyUrl = (t: Pick<LabTest, "handle">) => `https://bioarolabs.com/shop?test=${encodeURIComponent(t.handle)}`;

/** BioAro's own product image, or NEA's photo when BioAro has none. */
export const testPhoto = (t: Pick<LabTest, "handle" | "photo">) => (t.photo ? `https://images.unsplash.com/photo-${t.photo}` : `https://bioarolabs.com/pdp/heroes/${t.handle}.jpg`);
