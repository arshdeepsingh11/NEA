/**
 * NEA Smart Search: instant, typo-tolerant search across everything on the site, in the browser (no server round trip).
 * - Understands typos ("acen" → acne), plurals, synonyms ("botox" → neuromodulators, "pimples" → acne) and partial words as you type.
 * - Reads intent: prices ("how much"), booking ("book laser"), budgets ("$1500"), hours ("open saturday"), questions → Nea SI.
 * - Covers treatments, programs, tests, packages, Glow Feed videos, answers (FAQ), body areas, experiences and pages.
 */
import { docs, tokenize, buildPlan, SYN, type Plan } from "@/lib/knowledge";
import { socialVideos, cleanCaption, reelTopic } from "@/content/reels";
import { treatments } from "@/content/treatments";
import { labTests, testPhoto } from "@/content/tests";
import { janeFor } from "@/content/jane";
import { site } from "@/lib/site";

export type Kind = "Treatment" | "Program" | "Lab test" | "Package" | "Video" | "Answer" | "Body" | "Experience" | "Page";
export type Hit = {
  id: string;
  kind: Kind;
  title: string;
  href: string;
  /** opens the Glow Feed at this video instead of navigating */
  reel?: number;
  text: string;
  image?: string;
  price?: number;
  priceFrom?: boolean;
  minutes?: number | null;
  bookKey?: string;
};
export type Intent = { price: boolean; book: boolean; hours: boolean; question: boolean; budget?: number };
export type Result = { hits: Hit[]; intent: Intent; plan?: Plan; suggestion?: string };

const KIND_OF: Record<string, Kind> = { Program: "Program", Treatment: "Treatment", Package: "Package", "Lab test": "Lab test", FAQ: "Answer", Experience: "Experience", Body: "Body", Visit: "Page" };

const PAGES: Hit[] = [
  { id: "p-why", kind: "Page", title: "Why NEA?", href: "/why-nea", text: "why nea different better compare choose difference other clinics medspa reason" },
  { id: "p-lens", kind: "Page", title: "Nea SI Skin Lens (selfie analysis)", href: "/skin-lens", text: "skin lens selfie photo camera ai analysis analyse face scan online instant" },
  { id: "p-scan", kind: "Page", title: "Free Skin Health Report", href: "/skin-scan", text: "free skin scan analyzer report face analysis complimentary" },
  { id: "p-book", kind: "Page", title: "Book an appointment", href: "/book", text: "book booking appointment schedule consultation" },
  { id: "p-body", kind: "Page", title: "3D Body Explorer", href: "/body", text: "3d body explorer anatomy organs map regions" },
  { id: "p-member", kind: "Page", title: "Membership", href: "/membership", text: "membership monthly glow plus elite subscription save" },
  { id: "p-pack", kind: "Page", title: "Beauty & wellness packages", href: "/packages", text: "packages bundles wellness beauty" },
  { id: "p-contact", kind: "Page", title: "Contact & directions", href: "/contact", text: `contact address map directions parking phone email ${site.phone} hours open closed saturday sunday` },
  { id: "p-about", kind: "Page", title: "About NEA & the team", href: "/about", text: "about team founder raman kapoor mission staff practitioners" },
  { id: "p-faq", kind: "Page", title: "Questions & answers", href: "/faq", text: "faq questions answers" },
  { id: "p-men", kind: "Page", title: "Treatments for men", href: "/men", text: "men male guys beard" },
  { id: "p-fotona", kind: "Page", title: "Fotona laser", href: "/fotona", text: "fotona laser 4d er:yag nd:yag" },
  { id: "p-micro", kind: "Page", title: "Microbiome testing", href: "/microbiome", text: "microbiome gut skin vaginal bacteria test" },
  { id: "p-ask", kind: "Page", title: "Ask Nea SI", href: "/ask", text: "ask ai assistant chat nea si skin intelligence help" },
];

let INDEX: { hit: Hit; title: string[]; body: string[] }[] | null = null;
let VOCAB: string[] = [];

/** Words that say what you want to do, not what you are looking for. */
const INTENT_WORDS = new Set("price prices pricing cost costs much fee fees book booking appointment schedule reserve open hours close closed today tomorrow weekend under below budget max cheap cheapest near me".split(" "));

function build() {
  const tx = new Map(treatments.map((t) => [t.slug, t]));
  const tests = new Map(labTests.map((t) => [t.slug, t]));
  const hits: Hit[] = [];
  for (const d of docs) {
    const kind = KIND_OF[d.kind];
    if (!kind) continue;
    const h: Hit = { id: d.id, kind, title: d.title, href: d.href, text: d.meta?.summary ?? d.text.slice(0, 160), image: d.meta?.image };
    if (kind === "Treatment") {
      const slug = d.href.split("/").pop()!;
      const j = janeFor(slug);
      const priced = j.filter((x) => x.price).map((x) => x.price as number);
      h.price = priced.length ? Math.min(...priced) : undefined;
      h.priceFrom = true;
      h.minutes = j[0]?.min ?? null;
      h.bookKey = slug;
      h.image = tx.get(slug)?.image ?? h.image;
    }
    if (kind === "Program") {
      h.price = d.meta?.price;
      h.priceFrom = true;
      h.bookKey = d.href.split("/").pop();
    }
    if (kind === "Lab test") {
      const slug = d.href.split("#")[1];
      h.price = tests.get(slug)?.price;
      const t = tests.get(slug);
      h.image = t ? testPhoto(t) : undefined;
      h.text = tests.get(slug)?.bestFor ?? h.text;
    }
    hits.push(h);
  }
  socialVideos.forEach((v, i) => {
    const topic = reelTopic(v.caption ?? "");
    hits.push({ id: `v-${i}`, kind: "Video", title: cleanCaption(v.caption ?? "NEA video").split(/(?<=[.!?])\s/)[0].slice(0, 70), href: "#", reel: i, text: `${cleanCaption(v.caption ?? "")} ${topic.label} video reel glow feed watch`, bookKey: topic.key === "popular" ? undefined : topic.key });
  });
  hits.push(...PAGES);
  const raw = new Set<string>(Object.keys(SYN));
  for (const h of hits) for (const w of `${h.title} ${h.text}`.toLowerCase().split(/[^a-z0-9-]+/)) if (w.length > 3) raw.add(w);
  for (const d of docs) for (const w of `${d.title} ${d.keywords} ${d.aliases ?? ""}`.toLowerCase().split(/[^a-z0-9-]+/)) if (w.length > 3) raw.add(w);
  VOCAB = [...raw];
  INDEX = hits.map((hit) => {
    const d = docs.find((x) => x.id === hit.id);
    return { hit, title: tokenize(`${hit.title} ${d?.aliases ?? ""}`), body: tokenize(`${hit.text} ${d?.text ?? ""} ${d?.keywords ?? ""}`) };
  });
  return INDEX;
}

/** Edit distance with transpositions, stopping early past `max`. */
function close(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return false;
  const m = a.length;
  const n = b.length;
  let prev2: number[] = [];
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= n; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      best = Math.min(best, v);
    }
    if (best > max) return false;
    prev2 = prev;
    prev = cur;
  }
  return prev[n] <= max;
}

/** How well a query word matches a document word: exact 1, prefix (typing) 0.85, typo 0.6. */
function wordScore(q: string, t: string, last: boolean) {
  if (q === t) return 1;
  if (t.startsWith(q) && (last || q.length >= 4)) return 0.85;
  if (q.length >= 4 && t.length >= 4 && close(q, t, q.length >= 7 ? 2 : 1)) return 0.6;
  return 0;
}

export function intentOf(raw: string): Intent {
  const q = raw.toLowerCase();
  const budget = q.replace(/,/g, "").match(/(?:\$|budget|under|below|max)\s*\$?\s?(\d{3,6})\s?(k)?/);
  return {
    price: /\b(price|prices|cost|costs|how much|fee|fees|\$)/.test(q),
    book: /\b(book|booking|appointment|schedule|reserve)\b/.test(q),
    hours: /\b(open|hours|close|closed|saturday|sunday|today|tomorrow|weekend)\b/.test(q),
    question: /\?$/.test(q.trim()) || /^(what|why|how|can|do|does|is|are|which|should|will|when|where|who)\b/.test(q) || q.split(/\s+/).length >= 6,
    budget: budget ? Number(budget[1]) * (budget[2] ? 1000 : 1) : undefined,
  };
}

const KIND_BOOST: Partial<Record<Kind, number>> = { Program: 1.2, Treatment: 1.15, "Lab test": 1.05, Video: 0.9, Answer: 0.85, Body: 0.8 };

export function smartSearch(raw: string, limit = 14): Result {
  const index = INDEX ?? build();
  const intent = intentOf(raw);
  // fix typos against NEA's own vocabulary first ("botoxx" → botox, "thining" → thinning), then drop intent words
  if (!INDEX) build();
  const fixed = raw
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      const c = w.replace(/[^a-z0-9-]/g, "");
      if (c.length < 4 || /^\d+$/.test(c) || VOCAB.includes(c)) return c;
      let best = "";
      for (const v of VOCAB) if (close(c, v, c.length >= 7 ? 2 : 1) && (!best || Math.abs(v.length - c.length) < Math.abs(best.length - c.length))) best = v;
      return best || c;
    })
    .filter((w) => w && !/^\d+k?$/.test(w));
  const all = tokenize(fixed.join(" "));
  const words = all.filter((w) => !INTENT_WORDS.has(w));
  if (!words.length) {
    if (intent.hours) return { hits: index.filter((x) => x.hit.id === "p-contact").map((x) => x.hit), intent };
    if (intent.book) return { hits: index.filter((x) => x.hit.id === "p-book").map((x) => x.hit), intent };
    return { hits: [], intent, plan: buildPlan(raw) };
  }
  const scored = index
    .map(({ hit, title, body }) => {
      let s = 0;
      let matched = 0;
      words.forEach((w, wi) => {
        const last = wi === words.length - 1;
        let tBest = 0;
        for (const t of title) tBest = Math.max(tBest, wordScore(w, t, last));
        let bBest = 0;
        for (const t of body) {
          bBest = Math.max(bBest, wordScore(w, t, last));
          if (bBest === 1) break;
        }
        if (tBest || bBest) matched++;
        s += tBest * 4 + bBest * 1.2;
      });
      if (!matched) return { hit, s: 0 };
      s *= (matched / words.length) ** 1.5; // reward matching every word
      s *= KIND_BOOST[hit.kind] ?? 1;
      if (intent.price && hit.price) s *= 1.25;
      if (intent.book && hit.bookKey) s *= 1.2;
      if (intent.hours && hit.id === "p-contact") s += 6;
      return { hit, s };
    })
    .filter((x) => x.s > 1.1)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.hit);

  let suggestion: string | undefined;
  if (!scored.length) {
    // "did you mean": the closest title word to the longest query word
    const w = [...words].sort((a, b) => b.length - a.length)[0];
    let best = "";
    for (const { title } of index) for (const t of title) if (t.length > 3 && close(w, t, 2) && (!best || Math.abs(t.length - w.length) < Math.abs(best.length - w.length))) best = t;
    suggestion = best || undefined;
  }
  return { hits: scored, intent, plan: buildPlan(raw), suggestion };
}

export const TRENDING = ["acne", "melasma on brown skin", "botox price", "laser hair removal", "hair thinning", "microbiome test", "open saturday", "under $1,500"];
