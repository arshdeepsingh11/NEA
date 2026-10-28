/**
 * Nea SI Skin Lens: the visible signs a photo can show, and where each one leads at NEA.
 * Used by /api/lens (to ask Gemini the right question) and by the results screen (to explain and book).
 */
export type SignKey = "acne" | "redness" | "pigmentation" | "pores" | "lines" | "texture" | "dryness" | "dark_circles" | "oiliness";

export const SIGNS: Record<SignKey, { label: string; plain: string; program?: string; treatments: string[]; book: string }> = {
  acne: { label: "Breakouts", plain: "Active spots or blocked pores.", program: "clear-skin", treatments: ["active-acne", "perfect-derma-peel"], book: "active-acne" },
  redness: { label: "Redness", plain: "Flushing or visible redness, often on the cheeks and nose.", treatments: ["rosacea", "facials"], book: "rosacea" },
  pigmentation: { label: "Uneven tone", plain: "Dark spots, sun spots or patches of darker colour.", program: "even-tone", treatments: ["hyperpigmentation-melasma", "perfect-derma-peel"], book: "hyperpigmentation-melasma" },
  pores: { label: "Visible pores", plain: "Pores that look enlarged, often on the nose and cheeks.", treatments: ["large-pores", "facials"], book: "large-pores" },
  lines: { label: "Lines", plain: "Fine lines or wrinkles, for example on the forehead or around the eyes.", program: "healthy-aging", treatments: ["lines-wrinkles-sun-damage", "neuromodulators"], book: "lines-wrinkles-sun-damage" },
  texture: { label: "Texture", plain: "Uneven surface, bumps or marks left by old breakouts.", treatments: ["acne-scarring", "perfect-derma-peel"], book: "acne-scarring" },
  dryness: { label: "Dryness", plain: "Skin that looks dull, flaky or tight.", treatments: ["facials", "medical-grade-skincare"], book: "facials" },
  dark_circles: { label: "Under-eye", plain: "Shadows or darkness under the eyes.", treatments: ["dermal-fillers", "facials"], book: "facials" },
  oiliness: { label: "Shine", plain: "Extra oil or shine, often on the T-zone.", program: "clear-skin", treatments: ["active-acne", "medical-grade-skincare"], book: "active-acne" },
};

export const SIGN_KEYS = Object.keys(SIGNS) as SignKey[];

export type LensSign = { key: SignKey; level: number; where: string; x: number; y: number; note: string };
export type LensResult = { quality: { ok: boolean; issue?: string }; summary: string; signs: LensSign[] };
