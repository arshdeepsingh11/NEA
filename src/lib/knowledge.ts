import { treatments } from "@/content/treatments";
import { programs } from "@/content/programs";
import { wellnessPackages } from "@/content/packages";
import { labTests } from "@/content/tests";
import { faqs } from "@/content/faq";
import { offers } from "@/content/offers";
import { site } from "@/lib/site";
import { bodyRegions, faceZones } from "@/content/body";

export type DocMeta = { price?: number; duration?: string; image?: string; summary?: string };
export type Doc = { id: string; kind: string; title: string; href: string; text: string; keywords: string; aliases?: string; meta?: DocMeta };

const flatten = (blocks: { text: string }[][]) => blocks.flat().map((b) => b.text).join(" ");

export const docs: Doc[] = [
  ...programs.map((p) => ({
    id: `program-${p.slug}`,
    kind: "Program",
    title: p.name,
    href: `/programs/${p.slug}`,
    text: `${p.headline} ${p.summary} ${p.forWho}`,
    keywords: `${p.problem} ${p.rootCauses.join(" ")} ${p.includes.join(" ")}`,
    meta: { price: p.priceFrom, duration: p.duration, image: p.image, summary: p.headline },
  })),
  ...treatments.map((t) => ({
    id: `treatment-${t.slug}`,
    kind: "Treatment",
    title: t.title,
    href: `/treatments/${t.slug}`,
    text: `${t.summary} ${t.intro.join(" ")}`,
    keywords: `${t.concerns.join(" ")} ${t.list.join(" ")} ${t.subs.map((s) => s.title).join(" ")} ${flatten(t.subs.map((s) => s.body)).slice(0, 600)} ${flatten(t.more).slice(0, 600)}`,
    meta: { image: t.image, summary: t.summary },
  })),
  ...wellnessPackages.map((p) => ({
    id: `package-${p.id}`,
    kind: "Package",
    title: p.name,
    href: `/packages#${p.id}`,
    text: `${p.question} ${p.forWho}`,
    keywords: p.tiers.map((t) => `${t.name} ${t.items.join(" ")}`).join(" "),
  })),
  ...labTests.map((t) => ({
    id: `test-${t.slug}`,
    kind: "Lab test",
    title: t.name,
    href: `/tests#${t.slug}`,
    text: `${t.name} is a BioAro Labs test, ${t.price.toFixed(2).replace(".00", "")} CAD list price. ${t.neaUse} Best suited for: ${t.bestFor}`,
    keywords: `${t.group} test lab bioaro price cost`,
    aliases: { bioskin: "skin microbiome test acne eczema rosacea", biogut: "gut microbiome test bloating ibs", biofemme: "vaginal microbiome test uti yeast" }[t.slug] ?? "",
    meta: { price: t.price, summary: t.bestFor },
  })),
  ...faqs.map((f, i) => ({ id: `faq-${i}`, kind: "FAQ", title: f.q, href: `/faq#q-${i}`, text: f.a, keywords: f.topic })),
  ...offers.map((o) => ({
    id: `offer-${o.slug}`,
    kind: "Experience",
    title: o.name,
    href: o.slug === "skin-scan" ? "/skin-scan" : `/experiences/${o.slug}`,
    text: `${o.headline} ${o.summary}`,
    keywords: `${o.kicker} ${o.audience} ${o.leadsTo.join(" ")}`,
  })),
  ...[...bodyRegions, ...faceZones].map((r) => ({
    id: `body-${r.id}`,
    kind: "Body",
    title: r.name,
    href: `/body?focus=${r.id}`,
    text: `${r.headline} ${r.madeOf.join(" ")} ${r.improve}`,
    keywords: `${r.disruptors.join(" ")} ${r.tracks.join(" ")}`,
    meta: { summary: r.headline },
  })),
  {
    id: "visit",
    kind: "Visit",
    title: "Location, hours & booking",
    href: "/contact",
    text: `${site.address.line1}, ${site.address.city}, ${site.address.region}. Monday to Saturday 9:00 a.m. to 5:00 p.m., closed Sunday. Call ${site.phone} or email ${site.email}. Book online any time.`,
    keywords: "where address hours open closed phone email parking location book appointment",
  },
];

const STOP = new Set(
  "a an and are as at be by can do does for from have how i if in is it me my of on or should the to was what when where which who why will with you your about get even after keep keeps kept coming come still also just like want need think please tell help could would really suggest roughly any some".split(" ")
);

export const SYN: Record<string, string> = {
  pimples: "acne", pimple: "acne", breakouts: "acne", zits: "acne", spots: "pigmentation", melasma: "pigmentation", "dark": "pigmentation",
  wrinkles: "wrinkle", lines: "wrinkle", aging: "aging", ageing: "aging", balding: "hair", thinning: "hair", "hairloss": "hair",
  botox: "neuromodulator", dysport: "neuromodulator", snore: "snoring", gut: "microbiome", bloating: "microbiome", weight: "weight",
  price: "cost", prices: "cost", pricing: "cost", much: "cost", insurance: "insurance", benefits: "insurance", benefit: "insurance", covered: "insurance", cover: "insurance", coverage: "insurance", plan: "insurance", dietician: "dietitian", nutritionist: "dietitian", fat: "contouring", chin: "chin",
};

export function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => SYN[w] ?? w.replace(/(ies)$/, "y").replace(/s$/, ""));
}

const index = docs.map((d) => ({
  d,
  title: tokenize(`${d.title} ${d.aliases ?? ""}`),
  body: tokenize(`${d.text} ${d.keywords}`),
}));

const match = (t: string, w: string) => t === w || (w.length >= 5 && t.startsWith(w));

// Inverse document frequency: rare words (bioskin, melasma) matter more than common ones (skin, treatment).
const df = new Map<string, number>();
for (const { title, body } of index) for (const w of new Set([...title, ...body])) df.set(w, (df.get(w) ?? 0) + 1);
const idf = (w: string) => {
  let n = 0;
  for (const [k, v] of df) if (match(k, w)) n = Math.max(n, v);
  return Math.log(1 + index.length / (1 + n));
};

export function search(query: string, limit = 6) {
  const q = tokenize(query);
  if (!q.length) return [] as Doc[];
  return index
    .map(({ d, title, body }) => {
      let score = 0;
      for (const w of q) {
        const weight = idf(w);
        if (title.some((t) => match(t, w))) score += 4 * weight;
        const hits = body.filter((t) => match(t, w)).length;
        score += Math.min(hits, 4) * 0.8 * weight;
      }
      if (d.kind === "Program") score *= 1.25;
      if (d.kind === "Lab test" && q.some((w) => w.startsWith("test") || w === "microbiome" || w === "cost")) score *= 1.5;
      if (d.kind === "FAQ") score *= 0.85;
      return { d, score };
    })
    .filter((r) => r.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.d);
}

export type PlanItem = { title: string; href: string; price: number; duration: string; why: string };
export type Plan = { items: PlanItem[]; total: number; budget?: number; note: string };
export type Answer = { text: string; sources: Doc[]; plan?: Plan; steps: string[] };

const CONCERN_TO_PROGRAM: [RegExp, string][] = [
  [/acne|breakout|pimple|zit|blackhead|rosacea|oily|pores?/i, "clear-skin"],
  [/pigment|melasma|dark spot|uneven|sun ?spot|discolou?r|tone/i, "even-tone"],
  [/hair|bald|thinning|alopecia|scalp|receding/i, "hair-regrowth"],
  [/wrinkle|line|aging|ageing|sag|loose skin|firm|collagen|40\+|menopause/i, "healthy-aging"],
];

/** Turns "acne and dark spots, budget $2000" into a priced plan from real programs. */
export function buildPlan(question: string): Plan | undefined {
  const slugs = [...new Set(CONCERN_TO_PROGRAM.filter(([re]) => re.test(question)).map(([, s]) => s))];
  if (!slugs.length) return undefined;
  const budgetMatch = question.replace(/,/g, "").match(/\$?\s?(\d{3,6})\s?(k)?/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) * (budgetMatch[2] ? 1000 : 1) : undefined;
  const items = slugs
    .map((s) => programs.find((p) => p.slug === s)!)
    .map((p) => ({ title: p.name, href: `/programs/${p.slug}`, price: p.priceFrom, duration: p.duration, why: p.headline }))
    .sort((a, b) => a.price - b.price);
  const total = items.reduce((s, i) => s + i.price, 0);
  const note =
    budget && total > budget
      ? `That is above your budget of $${budget.toLocaleString("en-CA")}. Start with the ${items[0].title} and add the rest after your 90-day re-scan, or ask about monthly payment plans.`
      : "Every plan starts with a free Skin Health Report, so the tests and treatments are matched to what your scan actually shows.";
  return { items, total, budget, note };
}

/** A grounded answer built only from NEA's own content. Swap for an LLM via /api/ask when ready. */
export function answer(question: string): Answer {
  // greetings and thanks get a friendly reply, not "not found"
  const small = question.trim().toLowerCase().replace(/[!.?,]+$/g, "");
  if (/^(hi|hii+|hello|hey|hey there|good (morning|afternoon|evening)|yo|hola|namaste|sat sri akal)$/.test(small)) {
    return { text: `Hi! I’m Nea SI, NEA’s Skin Intelligence. Tell me what is bothering your skin, hair or body, and I’ll explain what is likely behind it, match you to a program, price it, and book the right service in Jane.`, sources: [], steps: ["Read your message"] };
  }
  if (/^(thanks|thank you|thx|ty|great|perfect|ok|okay|cool|awesome)( so much| a lot)?$/.test(small)) {
    return { text: `You’re welcome! Anything else about your skin, a treatment or a price I can check for you?`, sources: [], steps: ["Read your message"] };
  }
  const hits = search(question, 4);
  const plan = buildPlan(question);
  const steps = [`Read your question`, `Searched ${docs.length} NEA programs, treatments, tests and answers`, hits.length ? `Matched ${hits.length} relevant sources` : "No exact match found", ...(plan ? [`Priced a plan from ${plan.items.length} program${plan.items.length > 1 ? "s" : ""}`] : [])];
  if (!hits.length) {
    return {
      text: `I could not find that in NEA’s information yet. The team can answer it directly: call ${site.phone}, email ${site.email}, or book a free 15-minute consultation.`,
      sources: [],
      steps,
    };
  }
  const top = hits[0];
  const sentences = top.text.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ");
  const more = hits.slice(1, 3).map((h) => h.title);
  const tail = more.length ? ` You may also want to look at ${more.join(" and ")}.` : "";
  return { text: `${sentences}${tail}`, sources: hits, plan, steps };
}
