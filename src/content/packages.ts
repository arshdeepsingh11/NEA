/** Beauty & Wellness (Longevity) Packages — content kept word-for-word from the current site. */
export type PackageTier = { name: string; items: string[] };
export type WellnessPackage = {
  id: string;
  group: "beauty" | "wellness";
  name: string;
  question: string;
  forWho: string;
  image: string;
  tiers: PackageTier[];
};

export const wellnessPackages: WellnessPackage[] = [
  {
    id: "antiaging",
    group: "beauty",
    name: "Anti-Aging Package",
    question: "Prepare your skin for longevity, all year round.",
    forWho: "For anyone who wants a full-year plan for skin, muscle and healthspan.",
    image: "2024/01/neurotoxins-e1718734527479.jpg",
    tiers: [
      {
        name: "Anti-Aging",
        items: [
          "Comprehensive medical assessment",
          "Regular follow-ups",
          "2 nutrition consultations with a Registered Dietitian",
          "1 gut microbiome with nutrition consultation",
          "1 skin microbiome with skin consultation",
          "DEXA body composition",
          "4 Flex treatments – increase muscle mass and strength",
          "6 facials – 1 every 2 months",
          "2 PRP sessions with microneedling",
          "3 laser skin tightening sessions or intraoral",
          "2 sessions with a kinesiologist",
        ],
      },
    ],
  },
  {
    id: "hair",
    group: "beauty",
    name: "Hair Packages",
    question: "Are you experiencing hair loss?",
    forWho: "For thinning hair, alopecia or anyone wanting to restore density.",
    image: "2024/06/q-kkmb8go1e-683x1024.jpg",
    tiers: [
      {
        name: "Hair Thinning & Alopecia",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "Regular follow-ups",
          "3 nutrition follow-ups",
          "Disease-based DNA test with consultation",
          "6 PRP treatments",
          "6 laser hair restoration treatments",
          "Pharmaceutical compound to help promote growth",
        ],
      },
      {
        name: "Hair Restoration",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "DEXA body composition",
          "4 mini facials",
          "4 laser hair restoration treatments",
          "4 scalp massages",
          "Pharmaceutical compound to help promote growth",
        ],
      },
    ],
  },
  {
    id: "nutritional",
    group: "wellness",
    name: "Nutrition Wellness Programs with a Registered Dietitian",
    question: "Check how nutrition affects your overall health.",
    forWho: "For anyone who wants to understand how food affects their skin, energy and health.",
    image: "2024/06/stpy-oea3h0-819x1024.jpg",
    tiers: [
      {
        name: "Risk Assessment",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment and follow-up",
          "DEXA body composition with assessment",
          "1 month daily nutrition feedback",
        ],
      },
      {
        name: "Customized Meal Plan",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment and follow-up",
          "Personalized meal plan",
          "1 month daily nutrition feedback",
        ],
      },
      {
        name: "Precision Nutrition – Microbiome",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment",
          "1 month daily nutrition feedback",
          "Understand gut health",
          "Gut microbiome with assessment",
        ],
      },
    ],
  },
  {
    id: "scarring",
    group: "beauty",
    name: "Scarring Package",
    question: "Are you seeking to reduce or eliminate scars?",
    forWho: "For acne scars, surgical scars or uneven texture.",
    image: "2024/01/facial-laser-treatments-e1718734631828.jpg",
    tiers: [
      { name: "On the Surface", items: ["Comprehensive medical assessment", "Gut microbiome with nutrition consultation", "1 Perfect Peel"] },
      { name: "Let’s Go Deeper", items: ["Comprehensive medical assessment", "DEXA body composition with assessment", "1 Perfect Peel", "2 oxygen facials"] },
    ],
  },
  {
    id: "facial",
    group: "beauty",
    name: "Facial Package",
    question: "Give your skin the perfect radiant look.",
    forWho: "For regular glow, hydration and firmness.",
    image: "2024/06/pqyzuzfiqfy-e1718734645748-1024x948.jpg",
    tiers: [
      {
        name: "Facial",
        items: ["Comprehensive medical assessment", "Skin microbiome with assessment", "8 oxygen facials", "3 laser skin tightening"],
      },
    ],
  },
  {
    id: "sports",
    group: "wellness",
    name: "Sports Package",
    question: "For athletes or those wanting to focus on their game.",
    forWho: "For athletes, active adults and anyone training for performance.",
    image: "2024/06/zqndcje06vm-e1718734658676-1024x996.jpg",
    tiers: [
      {
        name: "Sports & Athletics",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive kinesiology assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "Regular follow-ups",
          "Gut microbiome with nutrition consultation",
          "Sports genomics DNA test with kinesiology consultation",
          "2 DEXA body compositions",
          "12 Flex treatments, once a month",
          "4 facials, once every 3 months",
        ],
      },
    ],
  },
  {
    id: "arthritis",
    group: "wellness",
    name: "Arthritis Package",
    question: "Non-surgical treatment for knee & back pain.",
    forWho: "For knee and back pain where you want a non-surgical option.",
    image: "2024/06/arthritis-8754003_1280-1024x768.jpg",
    tiers: [
      {
        name: "Arthritis",
        items: [
          "Comprehensive health assessment",
          "Gut microbiome with nutrition consultation",
          "DEXA body composition",
          "12 Flex treatments",
          "12 mini facials",
          "6 laser pain management sessions",
        ],
      },
    ],
  },
  {
    id: "feminine",
    group: "wellness",
    name: "Wellness Packages",
    question: "Prioritize your health for a happy and longer life.",
    forWho: "For feminine health concerns and heart health.",
    image: "2023/11/Photo-2023-01-25-13-18-35-819x1024.png",
    tiers: [
      {
        name: "Feminine Health – Urinary Incontinence / Prolapse",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "Regular follow-ups",
          "Vaginal microbiome with nutrition consultation",
          "Disease-based DNA test with consultation",
          "4 Flex treatments – core strength",
          "3 laser incontinence treatments",
          "Non-surgical intervention",
        ],
      },
      {
        name: "Heart Health",
        items: [
          "Comprehensive medical consultation",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "Regular follow-ups",
          "Cardiac genomics DNA test with consultation",
          "2 DEXA body compositions",
          "12 Flex treatments – core strength",
          "4 facials, once every 3 months",
        ],
      },
    ],
  },
  {
    id: "sleep",
    group: "wellness",
    name: "Sleep Apnea",
    question: "Trouble sleeping at night? Snoring?",
    forWho: "For snoring and sleep apnea without a device at night.",
    image: "2024/01/slepping-2-e1718734705881.png",
    tiers: [
      {
        name: "Sleep Apnea",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive cardiac assessment",
          "Regular follow-ups",
          "Gut microbiome with nutrition consultation",
          "Cardiac DNA genomic test with consultation",
          "DEXA body composition",
          "6 Flex treatments",
          "Sleep apnea study",
          "3 laser sleep apnea treatments",
          "3 chin tightening",
        ],
      },
    ],
  },
  {
    id: "laser",
    group: "beauty",
    name: "Laser Hair Reduction",
    question: "Do you struggle with excessive hair growth?",
    forWho: "For unwanted hair, ingrown hairs and hormonal hair growth.",
    image: "2024/06/aq6d5cimeb0-683x1024.jpg",
    tiers: [
      {
        name: "Laser Hair Reduction",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "8 sessions of laser hair removal",
          "3 dermaplaning facials",
          "Gut microbiome with nutrition consultation",
        ],
      },
    ],
  },
  {
    id: "skin",
    group: "beauty",
    name: "Skin Rejuvenation",
    question: "Looking to restore your skin health and vitality?",
    forWho: "For dull, tired or stressed skin that needs a full reset.",
    image: "2023/11/Nea-may.edit-9-819x1024.png",
    tiers: [
      {
        name: "Skin Rejuvenation",
        items: [
          "Comprehensive medical assessment",
          "3 nutrition consultations with a Registered Dietitian",
          "Gut microbiome with nutrition consultation",
          "Skin microbiome with skin consultation",
          "DEXA body composition",
          "3 oxygen facials",
          "3 microneedling sessions",
          "3 skin tightening facials",
          "Vivier signature kit",
        ],
      },
    ],
  },
  {
    id: "get",
    group: "beauty",
    name: "Get Your Glow",
    question: "Renew your skin’s natural glow.",
    forWho: "For a fast, visible glow before an event or season.",
    image: "2024/06/longevity-wellness-packages.jpg",
    tiers: [
      {
        name: "Get Your Glow",
        items: [
          "Comprehensive medical assessment",
          "Comprehensive nutrition assessment with a Registered Dietitian",
          "3 Alumier peels",
          "3 infused oxygen facials",
          "Gut microbiome with nutrition consultation",
        ],
      },
    ],
  },
];

/** Nutrition & weight-loss programs (from /weight-loss-program). */
export const nutritionPrograms = [
  {
    name: "Nutrition Consult – Nutrition Start Up!",
    items: ["Nutrition consultation with a Registered Dietitian", "Full body analysis", "Customized monthly meal plan"],
    addons: "Add-ons $75 each: virtual grocery store tour, pantry clean up, label reading, cooking with the experts (breakfast, lunch or dinner), eating out.",
  },
  {
    name: "6 Visit Program – Nutrition for Life!",
    items: [
      "1 hour nutrition assessment",
      "Full body analysis – pre/post",
      "Follow up week 2, 5, 8, 10 and 14",
      "Includes any two add-ons",
      "Customized monthly meal plan, preference based",
      "Includes email, text and picture follow-ups",
    ],
    addons: "Add-ons: virtual grocery store tour, pantry clean up, label reading, cooking with the experts, eating out.",
  },
  {
    name: "1 Year Subscription – Nutrition Your Way!",
    items: [
      "1 hour nutrition assessment",
      "Full body analysis – pre/post",
      "10 visit card – appointments booked when you need them",
      "Includes any 3 add-ons",
      "Customized monthly meal plan, preference based",
      "Includes email, text and picture follow-ups",
    ],
    addons: "Additional add-ons $50: virtual grocery store tour, pantry clean up, label reading, cooking with the experts, eating out.",
  },
];
