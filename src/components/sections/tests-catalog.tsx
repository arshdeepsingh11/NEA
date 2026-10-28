"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NeaImage } from "@/components/ui/nea-image";
import { useBooking } from "@/components/booking/booking";
import { IMG, testImage } from "@/content/media";
import Link from "next/link";
import { CalendarHeart, Clock, PersonStanding, Sparkles } from "lucide-react";
import { useAi } from "@/components/ai/ai-provider";
import { VIZ } from "@/components/viz/palette";
import type { LabTest } from "@/content/tests";
import { revealOnMobile } from "@/lib/reveal";
import { cn, money } from "@/lib/utils";

type Group = { id: LabTest["group"]; label: string; blurb: string };
type Link_ = { id: string; name: string };
const imgFor = (g: LabTest["group"]) => ({ microbiome: IMG.labPipette, hormones: IMG.lab, nutrition: IMG.gutFood, aging: IMG.aging2, genetics: IMG.dna })[g];

export function TestsCatalog({ tests, groups, regionsByTest = {} }: { tests: LabTest[]; groups: Group[]; regionsByTest?: Record<string, Link_[]> }) {
  const ai = useAi();
  const [hot, setHot] = useState<string | null>(null);
  const list = tests;
  const book = useBooking();
  const [sel, setSel] = useState<string | null>(null);
  const cur = list.find((t) => t.slug === sel) ?? list[0];
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h && tests.some((t) => t.slug === h)) setSel(h);
  }, [tests]);
  const label = Object.fromEntries(groups.map((x) => [x.id, x.label]));

  return (
    <div>
      <PriceMap tests={list} hot={hot} setHot={setHot} onPick={setSel} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ul className="space-y-1.5">
          {list.map((t, i) => {
            const on = cur?.slug === t.slug;
            const head = i === 0 || list[i - 1].group !== t.group;
            return (
              <li key={t.slug} id={t.slug} className="scroll-mt-32">
                {head && <p className={cn("px-4 pb-1 text-[11.5px] uppercase tracking-[0.14em] text-graphite", i > 0 && "pt-4")}>{label[t.group]}</p>}
                <button
                  onMouseEnter={() => (setHot(t.slug), setSel(t.slug))}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => (setSel(t.slug), revealOnMobile("test-preview"))}
                  className={cn("flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition", on ? "border-ink/15 bg-white shadow-[0_12px_30px_-20px_rgba(var(--shadow-tint),0.6)]" : "border-transparent hover:bg-white/60")}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                    <NeaImage src={testImage[t.slug] ?? imgFor(t.group)} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[15px] text-ink">
                      <span className="truncate">{t.name}</span>
                      {t.featured && <Sparkles className="h-3.5 w-3.5 shrink-0 text-flora" />}
                    </span>
                    <span className="block truncate text-[12.5px] text-graphite">{t.bestFor}</span>
                  </span>
                  <span className="tabular shrink-0 font-display text-[1.2rem] text-ink">{money(t.price)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div id="test-preview" data-lenis-prevent className="scroll-mt-20 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-[32px] [scrollbar-width:thin]">
          <AnimatePresence mode="wait">
            {cur && (
              <motion.article key={cur.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className={cn("surface overflow-hidden rounded-[32px]", cur.featured && "aurora-border")}>
                <div className="relative aspect-[16/8]">
                  <NeaImage src={testImage[cur.slug] ?? imgFor(cur.group)} alt={cur.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[12px] text-ink backdrop-blur">{label[cur.group]}{cur.featured ? " · most used at NEA" : ""}</span>
                  <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 text-white">
                    <h3 className="font-display text-[clamp(1.9rem,3.2vw,2.6rem)] leading-none">{cur.name}</h3>
                    <span className="tabular font-display text-[2rem] leading-none">{money(cur.price)}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[12.5px] text-graphite">Best for</p>
                  <p className="text-[15px] text-ink">{cur.bestFor}</p>
                  <p className="mt-4 text-[12.5px] text-graphite">How NEA uses it</p>
                  <p className="text-[16px] leading-relaxed text-ink">{cur.neaUse}</p>
                  <dl className="mt-5 grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3">
                      <dt className="text-[11.5px] text-graphite">Sample</dt>
                      <dd className="mt-1 text-[14px] text-ink">{cur.sample ?? "Explained at booking"}</dd>
                    </div>
                    <div className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3">
                      <dt className="flex items-center gap-1 text-[11.5px] text-graphite">
                        <Clock className="h-3 w-3" /> Results
                      </dt>
                      <dd className="mt-1 text-[14px] text-ink">{cur.results ?? "To your secure BioAro dashboard"}</dd>
                    </div>
                  </dl>
                  {(regionsByTest[cur.slug]?.length ?? 0) > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <PersonStanding className="h-3.5 w-3.5 text-graphite" />
                      {regionsByTest[cur.slug].map((r) => (
                        <Link key={r.id} href={`/body?focus=${r.id}`} className="rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-[12px] text-ink/80 hover:bg-ink/10">
                          {r.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button onClick={() => book.open("microbiome", cur.name)} className="btn-light">
                      <CalendarHeart className="h-4 w-4" /> Book a test consult
                    </button>
                    <button onClick={() => ai.open({ query: `Should I take the ${cur.name} test?`, context: cur.name })} className="btn-ghost">
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

/** Dot plot of list prices: one axis, one hue. Hover a dot (or a card) to link the two. */
function PriceMap({ tests, hot, setHot, onPick }: { tests: LabTest[]; hot: string | null; setHot: (s: string | null) => void; onPick: (s: string) => void }) {
  const max = useMemo(() => Math.ceil(Math.max(1, ...tests.map((t) => t.price)) / 250) * 250, [tests]);
  const step = max <= 1000 ? 250 : 500;
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const h = hot ? tests.find((t) => t.slug === hot) : undefined;
  // Stagger dots that sit close together onto three rows so none overlap.
  const rows = useMemo(() => {
    const sorted = [...tests].sort((a, b) => a.price - b.price);
    const lastX: number[] = [-1, -1, -1];
    const out: Record<string, number> = {};
    for (const t of sorted) {
      const x = t.price / max;
      let r = lastX.findIndex((lx) => x - lx > 0.035);
      if (r < 0) r = 0;
      lastX[r] = x;
      out[t.slug] = r;
    }
    return out;
  }, [tests, max]);

  return (
    <div className="surface rounded-[28px] p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">Price map</p>
        <p className="text-[13px] text-graphite">{h ? `${h.name} · ${money(h.price)}` : `${tests.length} tests · hover a dot`}</p>
      </div>
      <div className="relative h-24">
        {ticks.map((t) => (
          <div key={t} className="absolute bottom-0 top-0 border-l border-ink/10" style={{ left: `${(t / max) * 100}%` }}>
            <span className={cn("tabular absolute -bottom-0.5 whitespace-nowrap text-[11px] text-graphite/80", t === max ? "right-1" : "left-1")}>{money(t)}</span>
          </div>
        ))}
        {tests.map((t) => {
          const on = hot === t.slug;
          return (
            <a
              key={t.slug}
              href={`#${t.slug}`}
              onPointerEnter={() => setHot(t.slug)}
              onPointerLeave={() => setHot(null)}
              onClick={(e) => (e.preventDefault(), onPick(t.slug))}
              aria-label={`${t.name}, ${money(t.price)}`}
              className="absolute grid h-6 w-6 -translate-x-1/2 place-items-center"
              style={{ left: `${(t.price / max) * 100}%`, top: 6 + rows[t.slug] * 20 }}
            >
              <span className="rounded-full transition-all" style={{ width: on ? 14 : 10, height: on ? 14 : 10, background: VIZ.series[0], boxShadow: `0 0 0 2px ${VIZ.surface}${on ? ", 0 0 14px rgb(var(--c-accent) / 0.8)" : ""}`, opacity: hot && !on ? 0.45 : 1 }} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
