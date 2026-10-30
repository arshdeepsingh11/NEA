/** NEA's printed magazines, shown as flip books on /magazine. Page images live in public/magazine/<slug>/pNN.webp. */
export type Issue = {
  slug: string;
  title: string;
  season: string;
  pdf: string;
  pages: number;
  /** what's inside: magazine page number → topic, and the treatment page it leads to */
  toc: { page: number; title: string; treatment?: string }[];
};

export const issues: Issue[] = [
  {
    slug: "fall-2023",
    title: "The Fall Edition",
    season: "Autumn",
    pdf: "https://neaprecisionskin.com/wp-content/uploads/2023/12/Nea-Fall-Edition_V4_compressed.pdf",
    pages: 32,
    toc: [
      { page: 2, title: "Meet the founder", treatment: undefined },
      { page: 4, title: "3D Rejuvenation", treatment: "fotona-laser" },
      { page: 6, title: "Acne", treatment: "active-acne" },
      { page: 7, title: "Chemical peel", treatment: "alumier-peel" },
      { page: 8, title: "Cosmetic injectables", treatment: "neuromodulators" },
      { page: 10, title: "Dermaplaning", treatment: "facials" },
      { page: 11, title: "Dry skin", treatment: "facials" },
      { page: 12, title: "Facials", treatment: "facials" },
      { page: 13, title: "Fine lines and wrinkles", treatment: "lines-wrinkles-sun-damage" },
      { page: 14, title: "Fractional resurfacing", treatment: "fotona-laser" },
      { page: 15, title: "Glo Skin Beauty", treatment: "medical-grade-skincare" },
      { page: 16, title: "Nutrition and you", treatment: "weight-loss-programs" },
      { page: 17, title: "truSculpt iD", treatment: "body-contouring" },
      { page: 18, title: "Hair restoration", treatment: "hair-restoration" },
      { page: 20, title: "Hyperpigmentation", treatment: "hyperpigmentation-melasma" },
      { page: 21, title: "Intra-oral tightening", treatment: "facial-laser" },
      { page: 22, title: "Large pores", treatment: "large-pores" },
      { page: 23, title: "Laser hair removal", treatment: "laser-hair-removal" },
      { page: 24, title: "Luzern", treatment: "medical-grade-skincare" },
      { page: 25, title: "Microneedling", treatment: "acne-scarring" },
      { page: 26, title: "Oxygen infused facial", treatment: "facials" },
      { page: 27, title: "Rosacea", treatment: "rosacea" },
      { page: 28, title: "Sleep apnea", treatment: "snoring-sleep-apnea" },
      { page: 29, title: "Micro laser peel", treatment: "lines-wrinkles-sun-damage" },
      { page: 30, title: "Stress urinary incontinence", treatment: "feminine-health" },
      { page: 31, title: "The Perfect Derma Peel", treatment: "perfect-derma-peel" },
      { page: 32, title: "truSculpt flex", treatment: "muscle-sculpting" },
    ],
  },
];

export const pageSrc = (issue: Pick<Issue, "slug">, page: number) => `/magazine/${issue.slug}/p${String(page).padStart(2, "0")}.webp`;
