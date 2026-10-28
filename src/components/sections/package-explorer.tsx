"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Check, FlaskConical, Salad, Sparkles, Stethoscope, Syringe } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import type { WellnessPackage } from "@/content/packages";
import { IMG } from "@/content/media";
import { revealOnMobile } from "@/lib/reveal";
import { cn } from "@/lib/utils";

/** Photo and Jane booking key for each package (Jane services are mapped in content/jane.ts). */
const META: Record<string, { image: string; book: string; goals: Goal[] }> = {
  antiaging: { image: IMG.aging, book: "healthy-aging", goals: ["skin", "longevity", "body"] },
  hair: { image: IMG.hair, book: "hair-regrowth", goals: ["hair"] },
  nutritional: { image: IMG.gutFood, book: "nutrition", goals: ["energy", "body", "longevity"] },
  scarring: { image: IMG.microneedling, book: "acne-scarring", goals: ["skin"] },
  facial: { image: IMG.facialMask, book: "facials", goals: ["skin"] },
  sports: { image: IMG.fitness, book: "muscle-sculpting", goals: ["body", "energy"] },
  arthritis: { image: IMG.consultTalk, book: "prp-injections", goals: ["body", "longevity"] },
  feminine: { image: IMG.consult, book: "feminine-health", goals: ["body", "longevity"] },
  sleep: { image: IMG.heroAlt, book: "snoring-sleep-apnea", goals: ["energy", "longevity"] },
  laser: { image: IMG.laserArm, book: "laser-hair-removal", goals: ["hair", "body"] },
  skin: { image: IMG.skinClose, book: "lines-wrinkles-sun-damage", goals: ["skin"] },
  get: { image: IMG.serum, book: "popular", goals: ["skin", "energy"] },
};

type Goal = "skin" | "hair" | "body" | "energy" | "longevity";
const GOALS: { id: Goal | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "skin", label: "Better skin" },
  { id: "hair", label: "Hair" },
  { id: "body", label: "Body & strength" },
  { id: "energy", label: "Energy & sleep" },
  { id: "longevity", label: "Long-term health" },
];

/** Every item is sorted into one of four kinds of care, so you can see how a package is built. */
const KINDS = [
  { k: "doctor", label: "Doctor care", icon: Stethoscope, color: "var(--viz-1)", test: /assessment|follow-up|follow up|consultation with|physician|medical/i },
  { k: "tests", label: "Tests", icon: FlaskConical, color: "var(--viz-2)", test: /dna|microbiome|dexa|test|blood|panel|scan|sleep study|analysis/i },
  { k: "food", label: "Nutrition", icon: Salad, color: "var(--viz-3)", test: /nutrition|dietitian|meal|food|supplement/i },
  { k: "treat", label: "Treatments", icon: Syringe, color: "var(--c-accent)", test: /.*/ },
] as const;
type Kind = (typeof KINDS)[number]["k"];

function kindOf(item: string): Kind {
  // tests and nutrition win over "consultation" (e.g. "gut microbiome with nutrition consultation" is a test)
  if (KINDS[1].test.test(item)) return "tests";
  if (KINDS[2].test.test(item)) return "food";
  if (KINDS[0].test.test(item)) return "doctor";
  return "treat";
}
/** "6 PRP treatments" → 6 visits; items without a number count as one. */
function visits(item: string) {
  const m = item.match(/^(\d+)\s/);
  return m ? Number(m[1]) : 1;
}

function analyse(items: string[]) {
  const by: Record<Kind, { items: string[]; visits: number }> = { doctor: { items: [], visits: 0 }, tests: { items: [], visits: 0 }, food: { items: [], visits: 0 }, treat: { items: [], visits: 0 } };
  for (const it of items) {
    const k = kindOf(it);
    by[k].items.push(it);
    by[k].visits += /regular follow-ups/i.test(it) ? 0 : visits(it);
  }
  const total = Object.values(by).reduce((s, x) => s + x.visits, 0);
  return { by, total };
}

export function PackageExplorer({ packages }: { packages: WellnessPackage[] }) {
  const [goal, setGoal] = useState<Goal | "all">("all");
  const [id, setId] = useState(packages[0]?.id ?? "");
  const [tier, setTier] = useState(0);
  const book = useBooking();
  const ai = useAi();

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h && packages.some((p) => p.id === h)) setId(h);
  }, [packages]);

  const list = useMemo(() => packages.filter((p) => goal === "all" || META[p.id]?.goals.includes(goal)), [packages, goal]);
  useEffect(() => {
    if (list.length && !list.some((p) => p.id === id)) setId(list[0].id);
  }, [list, id]);
  useEffect(() => setTier(0), [id]);

  const cur = packages.find((p) => p.id === id) ?? list[0];
  if (!cur) return null;
  const t = cur.tiers[Math.min(tier, cur.tiers.length - 1)];
  const a = analyse(t.items);
  const meta = META[cur.id];

  return (
    <div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        <span className="flex shrink-0 items-center gap-1.5 pr-2 text-[13px] text-graphite">
          <Sparkles className="h-4 w-4 text-flora" /> What do you want most?
        </span>
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => setGoal(g.id)} aria-pressed={goal === g.id} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition", goal === g.id ? "bg-ink text-white" : "bg-ink/[0.05] text-ink/70 hover:text-ink")}>
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        {/* package rail */}
        <ul className="space-y-1.5">
          {list.map((p, i) => {
            const on = p.id === cur.id;
            const n = analyse(p.tiers[0].items).total;
            return (
              <li key={p.id}>
                <button onClick={() => (setId(p.id), revealOnMobile("package-preview"))} onMouseEnter={() => setId(p.id)} className={cn("flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition", on ? "border-ink/15 bg-white shadow-[0_12px_30px_-20px_rgba(var(--shadow-tint),0.6)]" : "border-transparent hover:bg-white/60")}>
                  <span className="tabular w-6 shrink-0 text-[12px] text-graphite">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                    <NeaImage src={META[p.id]?.image ?? p.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-ink">{p.name}</span>
                    <span className="block truncate text-[12px] text-graphite">
                      {p.group === "beauty" ? "Beauty" : "Wellness"} · {n} visits{p.tiers.length > 1 ? ` · ${p.tiers.length} levels` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* detail */}
        <div id="package-preview" className="scroll-mt-20 lg:sticky lg:top-24 lg:h-fit">
          <AnimatePresence mode="wait">
            <motion.article key={cur.id + tier} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="surface overflow-hidden rounded-[32px]">
              <div className="relative aspect-[16/9]">
                <NeaImage src={meta?.image ?? cur.image} alt={cur.name} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-[12px] text-ink backdrop-blur">{cur.group === "beauty" ? "Beauty package" : "Wellness package"}</span>
                <div className="absolute inset-x-6 bottom-5 text-white">
                  <h3 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1]">{cur.name}</h3>
                  <p className="mt-2 max-w-lg text-[15px] text-white/85">{cur.question}</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-[15px] text-graphite">{cur.forWho}</p>

                {cur.tiers.length > 1 && (
                  <div className="mt-5 flex flex-wrap gap-1.5" role="tablist">
                    {cur.tiers.map((x, i) => (
                      <button key={x.name} role="tab" aria-selected={tier === i} onClick={() => setTier(i)} className={cn("rounded-full px-3.5 py-1.5 text-[13px]", tier === i ? "bg-ink text-white" : "bg-ink/[0.05] text-ink/70")}>
                        {x.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* how it's built */}
                <div className="mt-6">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] text-graphite">How this package is built</p>
                    <p className="tabular text-[13px] text-ink">
                      <span className="font-display text-[1.6rem] leading-none">{a.total}</span> visits & tests
                    </p>
                  </div>
                  <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink/[0.06]">
                    {KINDS.map((k) => (
                      <motion.span key={k.k} initial={{ width: 0 }} animate={{ width: `${a.total ? (a.by[k.k].visits / a.total) * 100 : 0}%` }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} style={{ background: `rgb(${k.color})` }} />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {KINDS.map((k) => (
                      <div key={k.k} className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3">
                        <span className="flex items-center gap-1.5 text-[11.5px] text-graphite">
                          <span className="h-2 w-2 rounded-full" style={{ background: `rgb(${k.color})` }} />
                          {k.label}
                        </span>
                        <span className="tabular mt-1 block font-display text-[1.4rem] leading-none text-ink">{a.by[k.k].visits}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[12px] text-graphite">Counted straight from the list below: “6 facials” counts as 6, regular follow-ups are extra.</p>
                </div>

                {/* items grouped */}
                <div className="mt-6 space-y-4">
                  {KINDS.filter((k) => a.by[k.k].items.length).map((k) => (
                    <div key={k.k}>
                      <p className="mb-1.5 flex items-center gap-2 text-[12.5px] font-medium text-ink">
                        <k.icon className="h-4 w-4" style={{ color: `rgb(${k.color})` }} /> {k.label}
                      </p>
                      <ul className="space-y-1.5">
                        {a.by[k.k].items.map((it) => (
                          <li key={it} className="flex gap-2.5 text-[14.5px] leading-snug text-ink">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <button onClick={() => book.open(meta?.book ?? "popular", cur.name)} className="btn-light">
                    <CalendarHeart className="h-4 w-4" /> Book in Jane
                  </button>
                  <Link href={`/book?topic=${encodeURIComponent(cur.name)}`} className="btn-ghost">
                    Request a consultation
                  </Link>
                  <button onClick={() => ai.open({ context: cur.name, query: `Is the ${cur.name} right for me?` })} className="btn-ghost">
                    <Sparkles className="h-4 w-4" /> Ask SI
                  </button>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
