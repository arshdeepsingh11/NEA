/**
 * Data behind the program pages' visuals.
 * Every number here is ILLUSTRATIVE (a typical shape, not a promise or a clinical result).
 * Pages label these charts "Illustrative". Replace with NEA's own anonymised averages when available.
 */
export type ProgramInsight = {
  /** Which body systems usually drive this concern (0–100 = relative weight) and why */
  systems: { label: string; weight: number; note: string; region: string }[];
  /** The scan score we track, its checkpoints and an illustrative trajectory */
  metric: { name: string; unit: string; labels: string[]; values: number[]; projectFrom: number; better: "up" | "down" };
  /** Radar of the scan dimensions this program focuses on: typical starting point vs goal */
  radar: { label: string; value: number; target: number }[];
  /** One-line answers the AI uses as starter questions */
  questions: string[];
};

export const programInsights: Record<string, ProgramInsight> = {
  "clear-skin": {
    systems: [
      { label: "Oil & follicles", weight: 90, note: "Sebum and dead skin clog pores and feed acne bacteria.", region: "face" },
      { label: "Hormones", weight: 75, note: "Androgens raise oil; flares often follow the cycle or stress.", region: "neck" },
      { label: "Gut microbiome", weight: 65, note: "Gut inflammation can make breakouts and redness worse.", region: "gut" },
      { label: "Skin microbiome", weight: 60, note: "An imbalanced skin flora weakens the barrier.", region: "face" },
      { label: "Diet & stress", weight: 50, note: "High-glycemic food and cortisol can push flares.", region: "gut" },
    ],
    metric: { name: "Clarity score", unit: "", labels: ["Day 0", "Day 15", "Day 30", "Day 45", "Day 60", "Day 75", "Day 90"], values: [48, 54, 61, 67, 72, 76, 80], projectFrom: 3, better: "up" },
    radar: [
      { label: "Clarity", value: 48, target: 80 },
      { label: "Oil balance", value: 42, target: 72 },
      { label: "Redness", value: 55, target: 78 },
      { label: "Pores", value: 50, target: 70 },
      { label: "Texture", value: 58, target: 76 },
      { label: "Barrier", value: 60, target: 80 },
    ],
    questions: ["Is my acne hormonal?", "What does the BioSkin test show?", "How many peels will I need?"],
  },
  "even-tone": {
    systems: [
      { label: "UV exposure", weight: 90, note: "Sun is the main trigger for dark spots and melasma.", region: "face" },
      { label: "Hormones", weight: 70, note: "Estrogen and pregnancy can drive melasma.", region: "neck" },
      { label: "Inflammation", weight: 65, note: "Breakouts and irritation leave post-inflammatory marks, common in brown skin.", region: "face" },
      { label: "Nutrition", weight: 45, note: "Vitamin D and antioxidants support repair.", region: "gut" },
      { label: "Barrier", weight: 40, note: "A weak barrier makes pigment treatments sting and rebound.", region: "face" },
    ],
    metric: { name: "Tone evenness", unit: "", labels: ["Day 0", "Day 15", "Day 30", "Day 45", "Day 60", "Day 75", "Day 90"], values: [46, 50, 56, 61, 66, 70, 74], projectFrom: 3, better: "up" },
    radar: [
      { label: "Evenness", value: 46, target: 74 },
      { label: "UV spots", value: 44, target: 70 },
      { label: "Brightness", value: 52, target: 75 },
      { label: "Redness", value: 62, target: 78 },
      { label: "Texture", value: 60, target: 76 },
      { label: "Hydration", value: 55, target: 78 },
    ],
    questions: ["Is laser safe for brown skin?", "How do you treat melasma?", "How long until spots fade?"],
  },
  "hair-regrowth": {
    systems: [
      { label: "DHT", weight: 85, note: "DHT shrinks follicles in pattern hair loss.", region: "scalp" },
      { label: "Stress & cortisol", weight: 65, note: "Stress pushes hair into the resting, shedding phase.", region: "neck" },
      { label: "Nutrition", weight: 70, note: "Low iron, vitamin D or protein starves the follicle.", region: "gut" },
      { label: "Scalp blood flow", weight: 60, note: "Follicles need circulation to receive growth signals.", region: "scalp" },
      { label: "Thyroid", weight: 45, note: "Thyroid changes often show up as diffuse thinning.", region: "neck" },
    ],
    metric: { name: "Density score", unit: "", labels: ["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"], values: [40, 41, 44, 49, 54, 58, 62], projectFrom: 3, better: "up" },
    radar: [
      { label: "Density", value: 40, target: 62 },
      { label: "Shedding", value: 45, target: 75 },
      { label: "Scalp health", value: 58, target: 80 },
      { label: "Hair calibre", value: 48, target: 66 },
      { label: "Nutrient status", value: 50, target: 78 },
    ],
    questions: ["How does PRP work for hair?", "When will I see regrowth?", "Which tests check hair loss causes?"],
  },
  "healthy-aging": {
    systems: [
      { label: "Collagen loss", weight: 85, note: "Collagen production falls about 1% a year from your mid-20s.", region: "face" },
      { label: "UV damage", weight: 80, note: "The main cause of visible aging: lines, spots, laxity.", region: "face" },
      { label: "Inflammation", weight: 65, note: "Chronic inflammation speeds up skin aging.", region: "gut" },
      { label: "Muscle & body", weight: 55, note: "Muscle and fat changes alter how skin drapes.", region: "arms" },
      { label: "Hormones", weight: 55, note: "Perimenopause thins skin and dries it out.", region: "neck" },
    ],
    metric: { name: "Skin age gap (years)", unit: "", labels: ["Month 0", "Month 2", "Month 4", "Month 6", "Month 8", "Month 10", "Month 12"], values: [6, 5, 4, 3, 2.5, 2, 1.5], projectFrom: 2, better: "down" },
    radar: [
      { label: "Firmness", value: 50, target: 72 },
      { label: "Lines", value: 46, target: 70 },
      { label: "Tone", value: 55, target: 75 },
      { label: "Texture", value: 58, target: 78 },
      { label: "Hydration", value: 52, target: 76 },
      { label: "Volume", value: 54, target: 70 },
    ],
    questions: ["Botox or fillers, which first?", "What does the telomere test tell me?", "How does Fotona tighten skin?"],
  },
};
