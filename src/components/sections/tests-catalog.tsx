"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, PersonStanding, Sparkles } from "lucide-react";
import { useAi } from "@/components/ai/ai-provider";
import { VIZ } from "@/components/viz/palette";
import type { LabTest } from "@/content/tests";
import { cn, money } from "@/lib/utils";

type Group = { id: LabTest["group"]; label: string; blurb: string };
type Link_ = { id: string; name: string };

export function TestsCatalog({ tests, groups, regionsByTest = {} }: { tests: LabTest[]; groups: Group[]; regionsByTest?: Record<string, Link_[]> }) {
  const ai = useAi();
  const [g, setG] = useState<LabTest["group"] | "all">("all");
  const [hot, setHot] = useState<string | null>(null);
  const list = tests.filter((t) => g === "all" || t.group === g);
  const label = Object.fromEntries(groups.map((x) => [x.id, x.label]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All tests", blurb: "" }, ...groups].map((x) => (
          <button
            key={x.id}
            onClick={() => setG(x.id)}
            aria-pressed={g === x.id}
            className={cn("rounded-full border px-4 py-2 text-[14px] transition", g === x.id ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/60 text-graphite hover:text-ink")}
          >
            {x.label}
            <span className="tabular ml-2 text-[12px] opacity-60">{x.id === "all" ? tests.length : tests.filter((t) => t.group === x.id).length}</span>
          </button>
        ))}
      </div>

      <PriceMap tests={list} hot={hot} setHot={setHot} />

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <article
            key={t.slug}
            id={t.slug}
            onPointerEnter={() => setHot(t.slug)}
            onPointerLeave={() => setHot(null)}
            className={cn("surface flex scroll-mt-32 flex-col rounded-[28px] p-6 transition", hot === t.slug && "border-ink/20", t.featured && "aurora-border")}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="chip !text-[11px]">{label[t.group]}</span>
              {t.featured && <span className="text-[11px] text-flora">Most used at NEA</span>}
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-ink">{t.name}</h3>
              <span className="tabular shrink-0 font-display text-lg font-semibold text-ink">{money(t.price)}</span>
            </div>
            <p className="mt-1 text-[13px] text-graphite">Best for: {t.bestFor}</p>
            <p className="mt-4 flex-1 text-[14.5px] leading-relaxed text-ink/90">{t.neaUse}</p>

            {(regionsByTest[t.slug]?.length ?? 0) > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                <PersonStanding className="h-3.5 w-3.5 text-graphite" />
                {regionsByTest[t.slug].map((r) => (
                  <Link key={r.id} href={`/body?focus=${r.id}`} className="rounded-full bg-white/60 px-2 py-0.5 text-[11.5px] text-ink/80 hover:bg-white/90">
                    {r.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-[13px]">
              <span className="flex items-center gap-1.5 text-graphite">
                <Clock className="h-3.5 w-3.5" /> {t.results ? `Results in ${t.results}` : "BioAro Labs"}
              </span>
              <span className="flex items-center gap-3">
                <button onClick={() => ai.open({ query: `Should I take the ${t.name} test?`, context: t.name })} className="flex items-center gap-1 text-flora hover:text-ink">
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI
                </button>
                <Link href={`/book?topic=${encodeURIComponent(t.name)}`} className="flex items-center gap-0.5 text-ink hover:text-ink">
                  Book <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Dot plot of list prices: one axis, one hue. Hover a dot (or a card) to link the two. */
function PriceMap({ tests, hot, setHot }: { tests: LabTest[]; hot: string | null; setHot: (s: string | null) => void }) {
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
