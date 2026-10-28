/**
 * NEA SI's "education": everything Xevyo and Gemini know about NEA comes from here.
 * 1. A fixed brief: who NEA is, the rules SI follows, and a compact catalogue of every program,
 *    treatment, Jane service, test, package, membership and FAQ (built from the site's own content).
 * 2. Per question: the full text of the most relevant pages (from lib/knowledge search).
 * Update the site's content files and SI learns it automatically; nothing else to retrain.
 */
import { treatments, categories } from "@/content/treatments";
import { programs } from "@/content/programs";
import { wellnessPackages } from "@/content/packages";
import { labTests } from "@/content/tests";
import { faqs } from "@/content/faq";
import { offers, memberships } from "@/content/offers";
import { JANE, janeDisciplines, janeFor, janeItems } from "@/content/jane";
import { socialVideos, reelTopic } from "@/content/reels";
import { site } from "@/lib/site";
import type { Doc } from "@/lib/knowledge";

const money = (n: number) => `$${n.toLocaleString("en-CA", { maximumFractionDigits: 2 })}`;
const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

const RULES = `You are Nea SI ("Skin Intelligence"), the assistant on the website of ${site.name}, a physician-managed skin and wellness clinic in NE Calgary, Alberta. Always call yourself Nea SI, never "AI".

How you answer:
- Use ONLY the NEA information below and the PAGES sent with each question. If something is not there, say you don't have that detail and offer the free 15-minute consultation or a call to ${site.phone}.
- Get straight to the answer; do not introduce yourself unless asked. Be warm, clear and brief: 2 to 6 short sentences, or a short list with "- " when comparing options. Plain words, no jargon. Canadian spelling.
- Never diagnose, never promise results, never give dosing or medical instructions. For anything urgent or worrying, tell the person to see a doctor or call 911.
- Never invent prices, times, staff or services. Prices come from the catalogue below; program and membership prices are starting prices confirmed at the consultation. If a Jane service shows no price, say the price is confirmed when booking.
- When one of NEA's videos fits the question, offer it with its link, e.g. [watch: Perfect Peel in action](#reel-0). These open on this site.
- When you mention a page, link it in markdown with the site path, e.g. [Clear Skin Program](/programs/clear-skin) or [Fotona laser](/treatments/fotona-laser). Use only paths listed below.
- To book, tell people to tap "Book in Jane" under your answer, which opens the right Jane service. Mention the free Skin Health Report ([free skin scan](/skin-scan)) when someone is unsure where to start.
- If asked who powers you, say Nea SI runs on NEA's own knowledge with the ${"{engine}"} model.`;

function clinic() {
  const hours = site.hours.map((h) => ("closed" in h && h.closed ? `${h.days}: closed` : `${h.days}: ${h.open} to ${h.close}`)).join("; ");
  return `CLINIC
- ${site.description}
- Address: ${site.address.line1}, ${site.address.city}, ${site.address.region}. Hours: ${hours}.
- Phone ${site.phone}, text ${site.text}, email ${site.email}. Online booking: Jane (${JANE}).
- Free: 15-minute consultation, and the NEA Skin Health Report (advanced skin scan) at /skin-scan.
- Product brands: ${site.brands.join(", ")}. Lab testing by BioAro Labs.`;
}

function catalogue() {
  const prog = programs
    .map((p) => `- ${p.name} (/programs/${p.slug}): for ${p.problem}. From ${money(p.priceFrom)}, ${p.duration}. ${p.headline} Phases: ${p.phases.map((x) => x.name).join(" → ")}. Includes: ${p.includes.slice(0, 6).join("; ")}.`)
    .join("\n");
  const tx = treatments
    .map((t) => {
      const j = janeFor(t.slug);
      const priced = j.filter((x) => x.price).map((x) => x.price as number);
      const jane = j.length ? ` Jane: ${j.length} option${j.length > 1 ? "s" : ""}${j[0]?.min ? `, ${j[0].min} min` : ""}${priced.length ? `, from ${money(Math.min(...priced))}` : ""}.` : "";
      return `- ${t.title} (/treatments/${t.slug}) [${catLabel[t.category]}]: ${t.summary} Helps with: ${t.concerns.slice(0, 6).join(", ")}.${jane}`;
    })
    .join("\n");
  const jane = Object.entries(janeDisciplines)
    .map(([d, info]) => {
      const items = janeItems.filter((i) => i.d === Number(d));
      return `- ${info.name} (by ${info.by}): ${items.map((i) => `${i.name}${i.min ? ` ${i.min} min` : ""}${i.price ? ` ${money(i.price)}` : ""}`).join("; ")}`;
    })
    .join("\n");
  const tests = labTests.map((t) => `- ${t.name} (/tests#${t.slug}): ${money(t.price)} CAD list price. ${t.bestFor}`).join("\n");
  const packs = wellnessPackages.map((p) => `- ${p.name} (/packages#${p.id}): ${p.forWho} ${p.tiers.map((t) => `${t.name}: ${t.items.join(", ")}`).join(" | ")}`).join("\n");
  const members = memberships.map((m) => `- ${m.name}: ${money(m.price)}/month. ${m.features.join(", ")}`).join("\n");
  const offs = offers.map((o) => `- ${o.name} (${o.slug === "skin-scan" ? "/skin-scan" : `/experiences/${o.slug}`}): ${o.headline}`).join("\n");
  const faq = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n");
  const videos = socialVideos.map((v, i) => `- (#reel-${i}) about ${reelTopic(v.caption ?? "").label}: ${v.caption ?? ""}`).join("\n");
  const products = `NEA sells medical-grade skincare from ${site.brands.join(", ")}, and builds home routines and kits in clinic (/treatments/medical-grade-skincare). Specific products are matched to your skin at a consultation or skin scan; members get 10–20% off products. Do not name individual products or prices beyond this.`;
  return `PROGRAMS (one problem each)\n${prog}\n\nTREATMENTS\n${tx}\n\nJANE BOOKING SERVICES (session length and price where published)\n${jane}\n\nLAB TESTS\n${tests}\n\nPACKAGES (exact contents)\n${packs}\n\nMEMBERSHIPS (/membership)\n${members}\n\nEXPERIENCES AND OFFERS\n${offs}\n\nOTHER PAGES: /skin-lens (Nea SI Skin Lens: take a selfie and Nea SI marks visible signs in about 5 seconds, photo not stored), /body (3D body explorer), /treatments, /programs, /tests, /packages, /book, /contact, /faq, /about, /fotona, /men, /nutrition, /microbiome\n\nPRODUCTS\n${products}\n\nNEA VIDEOS (link as [watch: short title](#reel-N))\n${videos}\n\nFAQ\n${faq}`;
}

let cached: string | null = null;
/** The fixed part of SI's instructions (built once per server start). */
export function brief(engine: string) {
  cached ??= `${RULES}\n\n${clinic()}\n\n${catalogue()}`;
  return cached.replace("{engine}", engine);
}

/** The pages most relevant to this question, in full. */
export function pagesFor(hits: Doc[]) {
  if (!hits.length) return "PAGES: none matched this question.";
  return `PAGES most relevant to this question:\n${hits.map((h, i) => `[${i + 1}] ${h.kind}: ${h.title} (${h.href})\n${h.text}`).join("\n\n")}`;
}
