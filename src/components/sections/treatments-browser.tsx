"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CalendarHeart, Clock3, Search, Sparkles } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import type { TreatmentCategory } from "@/content/treatments";
import { revealOnMobile } from "@/lib/reveal";
import { cn, money } from "@/lib/utils";

export type TreatmentItem = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  category: TreatmentCategory;
  concerns: string[];
  jane: { services: number; min: number | null; price: number | null };
  regions: { id: string; name: string; face: boolean }[];
};

const FOCUS_MAP: Record<string, TreatmentCategory | "all"> = { skin: "skin", wellness: "wellness", body: "body", injectables: "injectables", laser: "laser", hair: "hair", feminine: "feminine" };
const QUICK = ["acne", "melasma", "wrinkles", "hair loss", "redness", "double chin", "scars", "pores", "snoring", "weight"];

/** Simple, explainable relevance: words in the title count most, then concerns, then summary. */
function score(t: TreatmentItem, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  let s = 0;
  for (const w of words) {
    if (t.title.toLowerCase().includes(w)) s += 3;
    if (t.concerns.join(" ").toLowerCase().includes(w)) s += 2;
    if (t.summary.toLowerCase().includes(w)) s += 1;
  }
  return s / (words.length * 3);
}

/**
 * Treatment Navigator: one list, one live preview. Type a concern and Nea SI ranks every treatment by fit,
 * showing session time and price straight from NEA's Jane booking system.
 */
export function TreatmentsBrowser({ items, categories }: { items: TreatmentItem[]; categories: { id: TreatmentCategory; label: string; blurb: string }[] }) {
  const params = useSearchParams();
  const initial = FOCUS_MAP[params.get("focus") ?? ""] ?? "all";
  const [cat, setCat] = useState<TreatmentCategory | "all">(initial);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>(items[0]?.slug ?? "");
  const book = useBooking();
  const ai = useAi();

  const order = (c: TreatmentCategory) => categories.findIndex((x) => x.id === c);
  const list = useMemo(() => {
    return items
      .map((t) => ({ t, s: score(t, q) }))
      .filter(({ t, s }) => (cat === "all" || t.category === cat) && s > 0)
      .sort((a, b) => (q ? b.s - a.s : order(a.t.category) - order(b.t.category)));
  }, [items, cat, q]);

  useEffect(() => {
    if (list.length && !list.some((x) => x.t.slug === active)) setActive(list[0].t.slug);
  }, [list, active]);

  const cur = items.find((t) => t.slug === active) ?? list[0]?.t;
  const catLabel = (id: TreatmentCategory) => categories.find((c) => c.id === id)?.label;

  return (
    <div>
      {/* Nea SI search */}
      <div className="surface rounded-[28px] p-3">
        <label className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-flora" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe what you want to fix, e.g. dark spots on my cheeks" className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-graphite/70 focus:outline-none" aria-label="Search treatments" />
          <Search className="h-4 w-4 shrink-0 text-graphite" />
        </label>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {cat !== "all" && (
            <button onClick={() => setCat("all")} className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-[13px] text-white">
              {catLabel(cat)} ✕
            </button>
          )}
          <span className="shrink-0 self-center px-1 text-[12.5px] text-graphite">Popular:</span>
          {QUICK.map((w) => (
            <button key={w} onClick={() => setQ(w)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] transition", q === w ? "border-ink text-ink" : "border-ink/10 text-graphite hover:text-ink")}>
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* ranked list */}
        <div>
          <p className="mb-2 px-1 text-[12.5px] text-graphite">
            {list.length} treatments{q ? ` ranked by fit for “${q}”` : cat !== "all" ? ` in ${catLabel(cat)}` : ""}
          </p>
          <ul className="space-y-1.5">
            {list.map(({ t, s }, i) => {
              const on = t.slug === cur?.slug;
              const head = !q && (i === 0 || list[i - 1].t.category !== t.category);
              return (
                <li key={t.slug}>
                  {head && <p className={cn("px-4 pb-1 text-[11.5px] uppercase tracking-[0.14em] text-graphite", i > 0 && "pt-4")}>{catLabel(t.category)}</p>}
                  <button
                    onMouseEnter={() => setActive(t.slug)}
                    onFocus={() => setActive(t.slug)}
                    onClick={() => (setActive(t.slug), revealOnMobile("treatment-preview"))}
                    className={cn("group flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition", on ? "border-ink/15 bg-white shadow-[0_12px_30px_-20px_rgba(var(--shadow-tint),0.6)]" : "border-transparent hover:bg-white/60")}
                  >
                    <span className="tabular w-6 shrink-0 text-[12px] text-graphite">{String(i + 1).padStart(2, "0")}</span>
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                      <NeaImage src={t.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-ink">{t.title}</span>
                      <span className="flex items-center gap-2 text-[12px] text-graphite">
                        {catLabel(t.category)}
                        {t.jane.min && (
                          <span className="flex items-center gap-1">
                            · <Clock3 className="h-3 w-3" /> {t.jane.min} min
                          </span>
                        )}
                      </span>
                    </span>
                    {q && (
                      <span className="hidden w-20 shrink-0 sm:block" title="How well it fits your search">
                        <span className="block h-1.5 rounded-full bg-ink/[0.07]">
                          <motion.span className="block h-full rounded-full bg-[rgb(var(--viz-1))]" animate={{ width: `${Math.round(Math.min(1, s) * 100)}%` }} />
                        </span>
                        <span className="tabular mt-0.5 block text-right text-[10.5px] text-graphite">{Math.round(Math.min(1, s) * 100)}% fit</span>
                      </span>
                    )}
                    <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition", on ? "text-ink" : "text-graphite/50")} />
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <div className="rounded-3xl border border-dashed border-ink/15 p-10 text-center">
              <p className="text-lg">Nothing matches “{q}”.</p>
              <button onClick={() => ai.open({ query: q })} className="btn-light mt-5">
                <NeaSiIcon className="h-4 w-4" /> Ask Nea SI instead
              </button>
            </div>
          )}
        </div>

        {/* live preview */}
        <div id="treatment-preview" data-lenis-prevent className="scroll-mt-20 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-[32px] [scrollbar-width:thin]">
          <AnimatePresence mode="wait">
            {cur && (
              <motion.article key={cur.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="surface overflow-hidden rounded-[32px]">
                <div className="relative aspect-[16/10]">
                  <NeaImage src={cur.image} alt={cur.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[12px] text-ink backdrop-blur">{catLabel(cur.category)}</span>
                  <h3 className="absolute inset-x-6 bottom-5 font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-[1] text-white">{cur.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-[16px] leading-relaxed text-ink">{cur.summary}</p>
                  <dl className="mt-5 grid grid-cols-3 gap-2.5">
                    <Stat k="Session" v={cur.jane.min ? `${cur.jane.min} min` : "Varies"} />
                    <Stat k="From" v={cur.jane.price ? money(cur.jane.price) : "Ask"} />
                    <Stat k="Options in Jane" v={String(cur.jane.services)} />
                  </dl>
                  {cur.concerns.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-[12.5px] text-graphite">Helps with</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cur.concerns.slice(0, 8).map((c) => (
                          <button key={c} onClick={() => setQ(c)} className="chip !text-[12.5px] hover:text-ink">
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {cur.regions.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-graphite">
                      Works on:
                      {cur.regions.map((r) => (
                        <Link key={r.id} href={`/body?${r.face ? "mode=face&" : ""}focus=${r.id}`} className="underline-offset-4 hover:text-ink hover:underline">
                          {r.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button onClick={() => book.open(cur.slug, cur.title.split(" (")[0])} className="btn-light">
                      <CalendarHeart className="h-4 w-4" /> Book in Jane
                    </button>
                    <Link href={`/treatments/${cur.slug}`} className="btn-ghost">
                      Full details <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => ai.open({ context: cur.title, query: `Is ${cur.title} right for me?` })} className="btn-ghost">
                      <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
                    </button>
                  </div>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3">
      <dt className="text-[11.5px] text-graphite">{k}</dt>
      <dd className="tabular mt-1 font-display text-[1.35rem] leading-none text-ink">{v}</dd>
    </div>
  );
}
