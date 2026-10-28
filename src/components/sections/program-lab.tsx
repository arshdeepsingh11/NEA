"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarHeart } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import { ProgramJourney } from "@/components/sim/program-journey";
import type { Program } from "@/content/programs";
import type { ProgramInsight } from "@/content/program-insights";
import { cn, money } from "@/lib/utils";

/**
 * Program Lab: one program on screen at a time, with what drives the concern, the journey and the price.
 * Switch programs from the rail; nothing is hidden in a grid of cards.
 */
export function ProgramLab({ programs, insights }: { programs: Program[]; insights: Record<string, ProgramInsight> }) {
  const [slug, setSlug] = useState(programs[0].slug);
  const p = programs.find((x) => x.slug === slug)!;
  const ins = insights[p.slug];
  const book = useBooking();
  const ai = useAi();

  return (
    <div>
      {/* rail */}
      <div role="tablist" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {programs.map((x, i) => {
          const on = x.slug === slug;
          return (
            <button key={x.slug} role="tab" aria-selected={on} onClick={() => setSlug(x.slug)} className={cn("group relative overflow-hidden rounded-[22px] border p-2 text-left transition", on ? "border-ink/20 bg-white shadow-[0_18px_40px_-26px_rgba(var(--shadow-tint),0.7)]" : "border-ink/[0.06] bg-white/40 hover:bg-white/70")}>
              <span className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  <NeaImage src={x.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="tabular block text-[11px] text-graphite">0{i + 1}</span>
                  <span className="block truncate text-[15px] text-ink">{x.name.replace(" Program", "")}</span>
                  <span className="block truncate text-[12px] text-graphite">{x.problem}</span>
                </span>
              </span>
              {on && <motion.span layoutId="lab-on" className="absolute inset-x-4 bottom-0 h-[3px] rounded-full" style={{ background: "var(--grad-text)" }} />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={p.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-6 space-y-6">
          {/* hero */}
          <div className="relative overflow-hidden rounded-[36px]">
            <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
              <NeaImage src={p.image} alt={p.name} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10">
              <p className="text-[14px] text-white/80">{p.problem}</p>
              <h2 className="mt-1 max-w-2xl font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">{p.headline}</h2>
              <p className="mt-3 max-w-xl text-[15px] text-white/85">{p.summary}</p>
              <dl className="mt-6 flex flex-wrap gap-2">
                {[
                  ["From", money(p.priceFrom)],
                  ["Length", p.duration],
                  ["Tests to choose from", String(p.tests.length)],
                  ["Treatments", String(p.treatments.length)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md">
                    <dt className="text-[11px] text-white/70">{k}</dt>
                    <dd className="tabular font-display text-[1.25rem] leading-none">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* what drives it */}
          {ins && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <div className="surface rounded-[32px] p-6 md:p-8">
                <p className="text-[13px] text-graphite">What usually drives it</p>
                <ul className="mt-4 space-y-3.5">
                  {ins.systems.map((s, i) => (
                    <li key={s.label}>
                      <div className="flex items-baseline justify-between text-[14px]">
                        <span className="text-ink">{s.label}</span>
                        <span className="tabular text-[12px] text-graphite">{s.weight}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-ink/[0.06]">
                        <motion.div className="h-full rounded-full" style={{ background: `rgb(var(--viz-${(i % 3) + 1}))` }} initial={{ width: 0 }} animate={{ width: `${s.weight}%` }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                      </div>
                      <p className="mt-1 text-[12.5px] leading-snug text-graphite">{s.note}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11.5px] text-graphite/80">How often each one matters for this concern. Your tests decide what applies to you.</p>
              </div>
              <ProgramJourney phases={p.phases} insight={ins} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={() => book.open(p.slug, p.name)} className="btn-light">
              <CalendarHeart className="h-4 w-4" /> Book in Jane
            </button>
            <Link href={`/programs/${p.slug}`} className="btn-ghost">
              Everything about this program <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button onClick={() => ai.open({ context: p.name, query: `Is the ${p.name} right for me?` })} className="btn-ghost">
              <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
