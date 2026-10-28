/**
 * Extra depth for each region of the Body Explorer: quick numbers, signs to notice,
 * what NEA measures (with typical healthy ranges), when change usually shows, and common questions.
 * Figures are general, widely cited reference values, written in plain words. Not a diagnosis.
 */
export type RegionData = {
  stats: { v: string; l: string }[];
  signs: string[];
  markers?: { name: string; range: string; why: string }[];
  results: string;
  faq: { q: string; a: string }[];
};

export const regionData: Record<string, RegionData> = {
  scalp: {
    stats: [
      { v: "~100k", l: "hair follicles on the scalp" },
      { v: "50–100", l: "hairs shed a day is normal" },
      { v: "~3 mo", l: "delay between a trigger and shedding" },
    ],
    signs: ["More hair in the shower or on the pillow", "A wider part or thinning crown", "A receding hairline", "Finer, weaker strands"],
    markers: [
      { name: "Ferritin (iron stores)", range: "about 50–150 µg/L", why: "Low iron is one of the most common fixable causes of shedding." },
      { name: "Vitamin D", range: "about 75–150 nmol/L", why: "Supports the hair growth cycle." },
      { name: "DHT", range: "read with your practitioner", why: "Drives pattern hair loss in people who are sensitive to it." },
    ],
    results: "Shedding usually slows first. Visible new growth tends to show from about 3 to 6 months.",
    faq: [
      { q: "Does PRP hurt?", a: "The scalp is numbed first. Most people feel pressure rather than pain." },
      { q: "How many sessions?", a: "Usually a short series spaced a few weeks apart, then maintenance. Your plan sets the exact number." },
    ],
  },
  face: {
    stats: [
      { v: "~28 days", l: "for skin to renew its surface in young adults" },
      { v: "~1%", l: "less collagen a year from the mid-20s" },
      { v: "Up to 80%", l: "of visible aging is linked to sun" },
    ],
    signs: ["Breakouts that keep coming back", "Dark spots or melasma", "Dullness or uneven texture", "Redness or stinging", "Fine lines"],
    markers: [
      { name: "Skin scan layers", range: "scored 0–100", why: "Hydration, pigment, UV damage, pores, redness and lines, mapped across the face." },
      { name: "Skin microbiome (BioSkin)", range: "diversity and balance", why: "An unbalanced skin flora often goes with breakouts and sensitivity." },
    ],
    results: "Hydration and glow can improve within weeks. Pigment and acne usually need 6–12 weeks; collagen work keeps improving for months.",
    faq: [
      { q: "Is laser safe for brown skin?", a: "Fotona settings and peels are chosen for your skin tone. NEA treats all skin types." },
      { q: "What does the free scan show?", a: "Six layers, including sun damage and pigment that are not visible yet." },
    ],
  },
  neck: {
    stats: [
      { v: "~20 g", l: "the weight of a thyroid gland" },
      { v: "24 h", l: "cortisol follows a daily rhythm" },
      { v: "Most", l: "adult acne has a hormonal part" },
    ],
    signs: ["Breakouts on the jaw and chin", "Flares around your cycle", "Melasma after pregnancy or the pill", "Hair thinning with tiredness"],
    markers: [
      { name: "Hormone Health panel", range: "read with your practitioner", why: "Shows androgens, estrogen and progesterone together." },
      { name: "Morning cortisol", range: "about 6–18 µg/dL", why: "High stress hormone slows healing and can trigger flares." },
    ],
    results: "When a hormonal driver is found and addressed, breakouts usually calm over 2–3 cycles.",
    faq: [{ q: "Do I need a doctor's referral?", a: "No. NEA arranges BioAro tests and reviews the results with you." }],
  },
  chest: {
    stats: [
      { v: "~100k km", l: "of blood vessels in the body" },
      { v: "7–9 h", l: "of sleep recommended for adults" },
      { v: "1 test", l: "hs-CRP gives a simple inflammation check" },
    ],
    signs: ["Dull, tired-looking skin", "Snoring or waking unrefreshed", "Weight around the middle", "Slow healing"],
    markers: [
      { name: "hs-CRP", range: "under about 1 mg/L is low risk", why: "A simple marker of whole-body inflammation." },
      { name: "Body fat (DEXA)", range: "read by age and sex", why: "Shows fat around the organs, not just on the scale." },
    ],
    results: "Better sleep and lower inflammation show in energy within weeks and in skin over 1–3 months.",
    faq: [{ q: "What is DEXA?", a: "A quick, low-dose scan that measures fat, muscle and bone, region by region." }],
  },
  arms: {
    stats: [
      { v: "3–8%", l: "muscle lost per decade after 30" },
      { v: "45 min", l: "a truSculpt flex session" },
      { v: "1 scan", l: "DEXA separates muscle, fat and bone" },
    ],
    signs: ["Losing tone even at the same weight", "Feeling weaker", "Loose skin after weight loss"],
    markers: [{ name: "Lean mass (DEXA)", range: "tracked against your own baseline", why: "The most accurate way to see muscle change." }],
    results: "Most people feel firmer after a few sessions; DEXA shows the change at the re-scan.",
    faq: [{ q: "Does it replace the gym?", a: "No, it adds to it. Flex targets specific muscles with stimulation you cannot do alone." }],
  },
  gut: {
    stats: [
      { v: "~38 trillion", l: "bacteria live in and on you" },
      { v: "~70%", l: "of the immune system sits around the gut" },
      { v: "Gut–skin", l: "axis: gut inflammation can show on skin" },
    ],
    signs: ["Bloating or irregular digestion", "Acne, rosacea or eczema flares", "Food reactions", "Low energy after meals"],
    markers: [{ name: "BioGut microbiome", range: "diversity and balance", why: "Shows which microbes dominate and which are missing." }],
    results: "Digestion often feels better within weeks; skin usually follows over 6–12 weeks.",
    faq: [
      { q: "How is the sample taken?", a: "A simple at-home stool sample kit, processed by BioAro Labs." },
      { q: "Who explains the results?", a: "NEA's Registered Dietitian turns them into a food plan with follow-ups." },
    ],
  },
  pelvis: {
    stats: [
      { v: "1 in 3", l: "women have bladder leaks at some point" },
      { v: "No surgery", l: "IntimaLase and IncontiLase are non-invasive" },
      { v: "Lactobacillus", l: "the protective bacteria of a healthy vaginal microbiome" },
    ],
    signs: ["Leaks when you laugh, sneeze or exercise", "Dryness or laxity", "Recurring infections"],
    markers: [{ name: "BioFemme microbiome", range: "balance of protective bacteria", why: "Guides care for recurring BV, yeast or UTIs." }],
    results: "Many people notice a difference after the first sessions; a short series is usual.",
    faq: [{ q: "Is there downtime?", a: "Usually none. Most return to normal activities the same day." }],
  },
  thighs: {
    stats: [
      { v: "0 days", l: "downtime for TightSculpting" },
      { v: "1 session", l: "treats fat and skin together" },
      { v: "DEXA", l: "measures regional fat change" },
    ],
    signs: ["Fat that does not shift with diet", "Loose skin after pregnancy or weight loss", "Cellulite"],
    markers: [{ name: "Regional fat (DEXA)", range: "tracked against your own baseline", why: "Shows real change in that area." }],
    results: "Skin tightening continues for weeks after each session as collagen rebuilds.",
    faq: [{ q: "Does it hurt?", a: "It feels warm. Most people find it comfortable." }],
  },
  knees: {
    stats: [
      { v: "12", l: "Flex sessions in the Arthritis package" },
      { v: "Laser", l: "pain management, no needles" },
      { v: "hs-CRP", l: "checks inflammation" },
    ],
    signs: ["Stiffness in the morning", "Pain on stairs", "Swelling after activity"],
    markers: [{ name: "hs-CRP", range: "under about 1 mg/L is low risk", why: "Inflammation can drive joint pain." }],
    results: "Strength and pain scores usually improve over the 12-session programme.",
    faq: [{ q: "Is this a replacement for physio?", a: "It works well alongside it. Your practitioner can coordinate." }],
  },
  feet: {
    stats: [
      { v: "2–14%", l: "of people have nail fungus" },
      { v: "~45 min", l: "to treat ten nails" },
      { v: "Up to 12 mo", l: "for a clear nail to grow out" },
    ],
    signs: ["Thick, yellow or brittle nails", "Nails lifting from the bed", "Warts on the soles"],
    results: "The new nail grows in clear from the base; the old part grows out over months.",
    faq: [{ q: "How many sessions?", a: "Usually 3 to 4, a few weeks apart." }],
  },
  brain: {
    stats: [
      { v: "7–9 h", l: "of sleep recommended for adults" },
      { v: "Deep sleep", l: "is when growth hormone and repair peak" },
      { v: "HPA axis", l: "the brain’s stress chain to the adrenals" },
    ],
    signs: ["Stress breakouts", "Snoring or poor sleep", "Migraines", "Feeling wired and tired"],
    markers: [{ name: "Morning cortisol", range: "about 6–18 µg/dL", why: "Puts a number on stress load." }],
    results: "Sleep and stress changes often show in skin within 2–6 weeks.",
    faq: [{ q: "How does NightLase help sleep?", a: "A gentle laser tightens tissue in the throat to reduce snoring, without surgery." }],
  },
  liver: {
    stats: [
      { v: "500+", l: "jobs the liver does" },
      { v: "~1.5 kg", l: "the weight of an adult liver" },
      { v: "Estrogen", l: "is broken down here" },
    ],
    signs: ["Melasma that keeps returning", "Hormonal acne", "Sluggish digestion", "Weight around the middle"],
    markers: [{ name: "Inflammation & aging panel", range: "read with your practitioner", why: "Shows whole-body inflammation that affects skin." }],
    results: "Diet and lifestyle changes support the liver over weeks to months.",
    faq: [{ q: "Do you offer liver function tests?", a: "Your practitioner can advise which BioAro panel fits; ask at your consultation." }],
  },
  adrenals: {
    stats: [
      { v: "2", l: "adrenal glands, one on each kidney" },
      { v: "Cortisol", l: "peaks in the morning, drops at night" },
      { v: "DHEA-S", l: "an adrenal hormone linked to oil and acne" },
    ],
    signs: ["Breakouts with stress", "Oily skin", "Shedding", "Energy crashes"],
    markers: [
      { name: "Morning cortisol", range: "about 6–18 µg/dL", why: "The main stress hormone." },
      { name: "DHEA-S", range: "read by age and sex", why: "High levels can raise oil and breakouts." },
    ],
    results: "When stress hormones come back into range, skin usually calms over 1–3 months.",
    faq: [{ q: "Can stress really cause acne?", a: "Yes. Cortisol and adrenal androgens can raise oil and inflammation." }],
  },
  // face zones
  forehead: { stats: [{ v: "3–6 mo", l: "how long neuromodulators last" }, { v: "~3 days", l: "until they start to work" }], signs: ["Lines when you frown or raise brows", "Oily T-zone breakouts"], results: "Lines soften within days; full effect in about 2 weeks.", faq: [{ q: "Will I look frozen?", a: "Doses are tailored to keep natural movement." }] },
  undereye: { stats: [{ v: "~0.5 mm", l: "the thinnest skin on the face" }], signs: ["Hollows or shadows", "Crepey texture", "Puffiness"], results: "Filler shows immediately; laser texture changes build over weeks.", faq: [{ q: "Is filler under the eyes safe?", a: "It is a delicate area; your injector will assess whether it suits you." }] },
  cheeks: { stats: [{ v: "#1", l: "spot for melasma and sun spots" }], signs: ["Dark patches", "Redness or broken capillaries", "Loss of volume"], results: "Pigment improves over a 6–12 week peel and laser series.", faq: [{ q: "Is it safe for brown skin?", a: "Yes, with tone-safe peels and laser settings." }] },
  tzone: { stats: [{ v: "Most", l: "oil glands are in the T-zone" }], signs: ["Shine by midday", "Large pores", "Blackheads"], results: "Pores look refined after a few sessions; oil control improves with the right routine.", faq: [{ q: "Can pores shrink?", a: "They can look smaller and clearer when kept clean and tight." }] },
  mouth: { stats: [{ v: "Intra-oral", l: "laser treats lines from inside the mouth" }], signs: ["Smile lines", "Lip lines", "Thinning lips"], results: "Collagen tightening builds over weeks after each session.", faq: [{ q: "What is intra-oral laser?", a: "Fotona SmoothLiftin works from inside the mouth to plump lines, with no needles." }] },
  jaw: { stats: [{ v: "Hormonal", l: "breakouts cluster on the jaw and chin" }], signs: ["Jaw and chin breakouts", "Double chin", "Loss of definition"], results: "Belkyra and truSculpt results build over a few sessions.", faq: [{ q: "Can a double chin go without surgery?", a: "Often yes, with Belkyra or truSculpt iD." }] },
};
