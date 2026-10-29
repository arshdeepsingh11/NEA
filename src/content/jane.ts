/**
 * NEA's real Jane booking catalogue (neamedicalaesthetic.janeapp.com), read from the live booking page, October 2026.
 * Every "Book" button deep-links to the exact Jane treatment, so clients land on the right service instead of the home page.
 * Prices shown only where Jane shows them. If NEA adds or renames a service in Jane, update it here.
 */
export const JANE = "https://neamedicalaesthetic.janeapp.com";

export const janeDisciplines: Record<number, { name: string; slug: string; by: string }> = {
  1: { name: "Laser Hair Removal", slug: "laser-hair-removal", by: "Anshpreet Hothi and Miss Reva Iesa" },
  2: { name: "Facials", slug: "facials", by: "Anshpreet Hothi and Miss Reva Iesa" },
  4: { name: "Advanced Facial Treatments", slug: "advanced-facial-treatments", by: "Anshpreet Hothi and Miss Reva Iesa" },
  7: { name: "Laser Treatments", slug: "laser-treatments", by: "Miss Reva Iesa and Raman Kapoor" },
  11: { name: "Feminine Health", slug: "feminine-health", by: "Miss Reva Iesa" },
  19: { name: "Injectables", slug: "injectables-filler-botox-belkyara", by: "Miss Reva Iesa, Manmit Jaswal, Raman Kapoor and Gurpreet Kaur" },
  20: { name: "Nutrition Program", slug: "nutrition-program", by: "Anshpreet Hothi, Miss Reva Iesa, Raman Kapoor and Gurpreet Kaur" },
  21: { name: "Dermatology", slug: "dermatology", by: "Miss Reva Iesa, Raman Kapoor and Gurpreet Kaur" },
  24: { name: "Consultation", slug: "consultation", by: "5 practitioners" },
  27: { name: "Platelet Rich Plasma (PRP)", slug: "platelet-rich-plasma-prp", by: "Miss Reva Iesa, Manmit Jaswal, Raman Kapoor and Gurpreet Kaur" },
  30: { name: "truSculpt iD", slug: "trusculptid", by: "Miss Reva Iesa and Raman Kapoor" },
  31: { name: "truSculpt flex", slug: "trusculpt-flex", by: "Anshpreet Hothi and Miss Reva Iesa" },
};

export const janeStaff = [
  { id: 1, name: "Raman Kapoor" },
  { id: 11, name: "Miss Reva Iesa" },
  { id: 47, name: "Manmit Jaswal" },
  { id: 50, name: "Anshpreet Hothi" },
  { id: 51, name: "Gurpreet Kaur" },
];

export type JaneItem = { d: number; id: number; name: string; min: number | null; price: number | null };
export const janeItems: JaneItem[] = [
  { d: 1, id: 110, name: "Full Back LHR", min: 30, price: null },
  { d: 1, id: 2, name: "Underarms LHR", min: 15, price: null },
  { d: 1, id: 55, name: "Full Face LHR", min: 15, price: null },
  { d: 1, id: 66, name: "Back LHR Upper or Lower", min: 30, price: null },
  { d: 1, id: 57, name: "Front Neck LHR", min: 10, price: null },
  { d: 1, id: 58, name: "Back Neck LHR", min: 10, price: null },
  { d: 1, id: 59, name: "Chin LHR", min: 10, price: null },
  { d: 1, id: 61, name: "Half Arms LHR", min: 25, price: null },
  { d: 1, id: 62, name: "Full Arms LHR", min: 40, price: null },
  { d: 1, id: 63, name: "Chest LHR", min: 30, price: null },
  { d: 1, id: 64, name: "Abdomen/Stomach LHR", min: 20, price: null },
  { d: 1, id: 68, name: "Bikini LHR", min: 20, price: null },
  { d: 1, id: 69, name: "Brazilian LHR", min: 30, price: null },
  { d: 1, id: 70, name: "Buttocks LHR", min: 20, price: null },
  { d: 1, id: 71, name: "Thighs LHR", min: 30, price: null },
  { d: 1, id: 72, name: "Upper or Lower Legs LHR", min: 30, price: null },
  { d: 1, id: 73, name: "Hands and Feet LHR", min: 20, price: null },
  { d: 1, id: 109, name: "Full Legs LHR", min: 60, price: null },
  { d: 1, id: 184, name: "Half Face LHR", min: 25, price: null },
  { d: 1, id: 223, name: "Extra Small Area", min: 15, price: 40 },
  { d: 1, id: 373, name: "Full Face + Ears LHR", min: 30, price: 100 },
  { d: 2, id: 4, name: "Infused Oxygenation Facial", min: 60, price: null },
  { d: 2, id: 6, name: "Dermaplaning", min: 75, price: null },
  { d: 2, id: 76, name: "Infused Oxygenation Add On", min: 30, price: null },
  { d: 2, id: 246, name: "Add-on Dermaplane", min: 30, price: 60 },
  { d: 2, id: 282, name: "Extraction Facial", min: 30, price: null },
  { d: 2, id: 358, name: "Brightening Facial", min: 60, price: 150 },
  { d: 2, id: 360, name: "Anti-Aging Facial", min: 60, price: 150 },
  { d: 2, id: 367, name: "Add-on Chemical Peel", min: 30, price: 60 },
  { d: 4, id: 45, name: "Chemical Peel", min: 30, price: null },
  { d: 4, id: 347, name: "Chemical Peel + Facial", min: 45, price: 210 },
  { d: 4, id: 3, name: "Microneedling", min: 60, price: null },
  { d: 4, id: 275, name: "The Perfect Peel", min: null, price: null },
  { d: 4, id: 316, name: "Perfect Peel Booster", min: null, price: null },
  { d: 7, id: 7, name: "Rosacea", min: 30, price: null },
  { d: 7, id: 203, name: "NightLase Treatment", min: 45, price: null },
  { d: 7, id: 204, name: "Onychomycosis (Nail Fungus Treatment)", min: 15, price: null },
  { d: 7, id: 29, name: "Fractional Resurfacing", min: 60, price: null },
  { d: 7, id: 9, name: "Intra-Oral Facial Rejuvenation", min: 40, price: 300 },
  { d: 7, id: 23, name: "3D Skin Resurfacing - Buttocks", min: 60, price: null },
  { d: 7, id: 30, name: "2D Skin Resurfacing", min: 90, price: null },
  { d: 7, id: 16, name: "Micro Laser Peel", min: 60, price: null },
  { d: 7, id: 194, name: "Lift, Tone and Firm 4TX - Arms (per treatment)", min: 45, price: null },
  { d: 7, id: 200, name: "Body Contouring 4TX - Abdomen & Flanks (per treatment)", min: 55, price: null },
  { d: 7, id: 25, name: "3D Skin Resurfacing - Arms", min: 60, price: null },
  { d: 7, id: 207, name: "Laser Wart Removal", min: 15, price: null },
  { d: 7, id: 201, name: "Body Contouring 4TX - Inner Thigh (per treatment)", min: 45, price: null },
  { d: 7, id: 26, name: "3D Skin Resurfacing - Legs", min: 60, price: null },
  { d: 7, id: 202, name: "Body Contouring 4TX - Back (per treatment)", min: 45, price: null },
  { d: 7, id: 15, name: "Medical Pain Management - Laser", min: 15, price: null },
  { d: 7, id: 240, name: "Spider Vein Removal (2 \u00d7 4 cm)", min: null, price: null },
  { d: 7, id: 241, name: "Spider Vein Removal (4 \u00d7 8 cm)", min: null, price: null },
  { d: 7, id: 242, name: "Spider Vein Removal (8 \u00d7 16 cm)", min: null, price: null },
  { d: 7, id: 338, name: "Skin Tightening", min: 15, price: 265 },
  { d: 7, id: 322, name: "Hair Restoration Laser", min: null, price: null },
  { d: 7, id: 346, name: "Acne Laser Treatment", min: 60, price: 250 },
  { d: 11, id: 19, name: "IntimaLase", min: 60, price: null },
  { d: 11, id: 20, name: "IncontiLase", min: 60, price: null },
  { d: 11, id: 366, name: "Women's PRP Shots", min: 90, price: 900 },
  { d: 19, id: 227, name: "Botox", min: 45, price: null },
  { d: 19, id: 104, name: "Filler", min: 45, price: null },
  { d: 19, id: 331, name: "Belkyra", min: 45, price: 1100 },
  { d: 19, id: 379, name: "Mini Lip Filler", min: 60, price: 350 },
  { d: 21, id: 326, name: "Skin Tag Removal", min: 45, price: 150 },
  { d: 24, id: 108, name: "Consultation", min: 30, price: null },
  { d: 24, id: 225, name: "Follow Up", min: 30, price: null },
  { d: 24, id: 271, name: "Virtual Consultation", min: null, price: null },
  { d: 27, id: 219, name: "PRP with Beauty Gun Microneedling - Face", min: 75, price: 650 },
  { d: 27, id: 205, name: "PRP Hair Restoration", min: 75, price: 650 },
  { d: 27, id: 362, name: "PRP with Microneedling - Face + Neck", min: 90, price: 750 },
  { d: 27, id: 363, name: "PRP with Microneedling - Face + Neck + Hairline", min: 90, price: 850 },
  { d: 27, id: 372, name: "PRP with Regular Microneedling - Face", min: 75, price: 550 },
  { d: 30, id: 245, name: "truSculpt iD Add-on Nutrition", min: null, price: null },
  { d: 30, id: 283, name: "Chin Treatment #1", min: 60, price: null },
  { d: 30, id: 315, name: "truSculpt iD 6 Paddles", min: 35, price: null },
  { d: 30, id: 344, name: "Chin Tightening", min: 20, price: 250 },
  { d: 30, id: 337, name: "truSculpt iD 1 Paddle", min: 15, price: 300 },
  { d: 20, id: 267, name: "DEXA Body Scan with Nutrition Counselling", min: null, price: null },
  { d: 20, id: 269, name: "Nutrition Counselling - 60 min", min: null, price: null },
  { d: 20, id: 284, name: "Nutrition Counselling Session", min: 60, price: 125 },
  { d: 20, id: 303, name: "Mini Nutrition", min: 60, price: 175 },
  { d: 20, id: 277, name: "Nutrition Initial Assessment", min: null, price: null },
  { d: 20, id: 320, name: "Medical Management", min: null, price: null },
  { d: 20, id: 321, name: "Medical Management without truSculpt iD", min: null, price: null },
  { d: 20, id: 357, name: "DEXA Body Scan", min: 30, price: 175 },
  { d: 31, id: 287, name: "truSculpt flex Package of 4 (per treatment)", min: null, price: null },
  { d: 31, id: 296, name: "truSculpt flex add-on to iD - 4 tx (per treatment)", min: null, price: null },
  { d: 31, id: 297, name: "truSculpt flex Monthly Maintenance", min: null, price: null },
  { d: 31, id: 340, name: "Platinum Package", min: null, price: null },
  { d: 31, id: 341, name: "Gold Flex Package", min: null, price: null },
  { d: 31, id: 342, name: "Silver Flex Package", min: null, price: null },
  { d: 31, id: 343, name: "Bronze Flex Package", min: null, price: null },
];

export const janeUrl = (it: Pick<JaneItem, "d" | "id">) => `${JANE}/#/discipline/${it.d}/treatment/${it.id}`;
export const janeDisciplineUrl = (d: number) => `${JANE}/#/${janeDisciplines[d].slug}`;
export const janeStaffUrl = (id: number) => `${JANE}/#/staff_member/${id}`;
export const janeConsult = { d: 24, id: 108 };
export const janeVirtual = { d: 24, id: 271 };

const T = (d: number, id: number) => ({ d, id });
/** Which Jane services each NEA page books. First entry is the main "Book" action. */
export const janeMap: Record<string, { d: number; id: number }[]> = {
  // treatments
  "large-pores": [T(7, 29), T(7, 16), T(4, 45)],
  "fotona-laser": [T(7, 29), T(7, 30), T(7, 16), T(7, 338)],
  "stretch-marks-and-scars": [T(7, 23), T(7, 25), T(7, 26), T(4, 3)],
  "muscle-sculpting": [T(31, 287), T(31, 297), T(31, 340), T(31, 341), T(31, 342), T(31, 343)],
  "perfect-derma-peel": [T(4, 275), T(4, 316)],
  "weight-loss-programs": [T(20, 277), T(20, 320), T(20, 321), T(20, 267)],
  "hair-restoration": [T(27, 205), T(7, 322)],
  "migraine-treatment": [T(24, 108), T(19, 227)],
  "dermal-fillers": [T(19, 104), T(19, 379)],
  neuromodulators: [T(19, 227)],
  "botox-dysport": [T(19, 227)],
  "active-acne": [T(7, 346), T(2, 282), T(4, 45), T(4, 347)],
  "acne-scarring": [T(7, 29), T(4, 3), T(27, 372)],
  rosacea: [T(7, 7), T(7, 240), T(7, 241), T(7, 242)],
  "lines-wrinkles-sun-damage": [T(7, 29), T(7, 30), T(7, 16), T(2, 360)],
  "hyperpigmentation-melasma": [T(4, 275), T(2, 358), T(7, 16), T(4, 45)],
  facials: [T(2, 4), T(2, 358), T(2, 360), T(2, 282), T(2, 6), T(4, 347)],
  "facial-laser": [T(7, 9), T(7, 338)],
  "body-contouring": [T(7, 200), T(7, 201), T(7, 202), T(7, 194), T(30, 315), T(30, 337)],
  "laser-hair-removal": [T(1, 55), T(1, 2), T(1, 69), T(1, 68), T(1, 109), T(1, 110), T(1, 62), T(1, 59), T(1, 373), T(1, 223)],
  "wart-removal": [T(7, 207), T(21, 326)],
  "snoring-sleep-apnea": [T(7, 203)],
  "feminine-health": [T(11, 19), T(11, 20), T(11, 366)],
  "fungal-nail": [T(7, 204)],
  "medical-grade-skincare": [T(24, 108), T(24, 271)],
  "prp-injections": [T(27, 372), T(27, 219), T(27, 362), T(27, 363), T(27, 205)],
  belkyra: [T(19, 331), T(30, 344), T(30, 283)],
  hyperhidrosis: [T(19, 227)],
  "tmj-disorder": [T(19, 227)],
  "alumier-peel": [T(4, 45), T(4, 347), T(2, 367)],
  "vivier-signature-kits": [T(24, 108), T(24, 271)],
  "uti-vaginal-microbiome": [T(24, 108), T(11, 19), T(11, 20)],
  lipolysis: [T(30, 315), T(30, 337), T(7, 200)],
  "biosport-dexa-vo2": [T(20, 357), T(20, 267)],
  kinesiology: [T(24, 108)],
  "heart-health": [T(24, 108), T(20, 277)],
  "healthspan-longevity": [T(24, 108), T(20, 357)],
  "obesity-metabolic": [T(20, 277), T(20, 357), T(20, 267)],
  diabetes: [T(20, 277), T(20, 284)],
  "arthritis-pain": [T(7, 15), T(31, 287), T(24, 108)],
  // programs
  "clear-skin": [T(24, 108), T(7, 346), T(2, 282), T(4, 45)],
  "even-tone": [T(24, 108), T(4, 275), T(2, 358), T(7, 16)],
  "hair-regrowth": [T(24, 108), T(27, 205), T(7, 322)],
  "healthy-aging": [T(24, 108), T(7, 29), T(7, 338), T(19, 227), T(19, 104)],
  popular: [T(19, 227), T(2, 4), T(7, 346), T(1, 55), T(27, 372), T(20, 357), T(4, 275)],
  // offers & services
  "skin-scan": [T(24, 108)],
  "body-truth-scan": [T(20, 357), T(20, 267)],
  nutrition: [T(20, 277), T(20, 284), T(20, 303)],
  microbiome: [T(24, 108)],
};

const byKey = new Map(janeItems.map((i) => [`${i.d}/${i.id}`, i]));
export function janeFor(key?: string): (JaneItem & { url: string; discipline: string; by: string })[] {
  const refs = (key && janeMap[key]) || [janeConsult];
  return refs.flatMap((r) => {
    const it = byKey.get(`${r.d}/${r.id}`);
    return it ? [{ ...it, url: janeUrl(it), discipline: janeDisciplines[it.d].name, by: janeDisciplines[it.d].by }] : [];
  });
}
/** Main booking link for a page: its first mapped Jane service, or a consultation. */
export const bookUrl = (key?: string) => janeFor(key)[0]?.url ?? janeUrl(janeConsult);
