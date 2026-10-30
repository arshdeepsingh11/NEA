"use client";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, FlaskConical, ChartLine, Repeat2, Sparkles } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { NeaImage } from "@/components/ui/nea-image";
import { SplitReveal } from "@/components/motion/split-reveal";
import { HeroBody, type ScanRegion } from "./hero-body";
import { cn, money } from "@/lib/utils";
import { IMG } from "@/content/media";

/* ------------------------------------------------------------------ */
/* Concerns marquee: two rows of large serif words, opposite directions */
/* ------------------------------------------------------------------ */
const ROW_A = ["Acne", "Melasma", "Rosacea", "Hair thinning", "Fine lines", "Sun damage", "Large pores", "Dull skin"];
const ROW_B = ["Gut health", "Hormones", "Microbiome", "Nutrition", "Collagen", "Sleep", "Stress", "Longevity"];

export function ConcernsMarquee() {
  const row = (words: string[], reverse?: boolean, italic?: boolean) => (
    <div className="flex overflow-hidden mask-fade-x">
      <div className="flex shrink-0 animate-[marquee-x_48s_linear_infinite] items-center gap-10 pr-10" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
        {[...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className={cn("font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-none", italic ? "italic text-flora" : "text-ink")}>{w}</span>
            <span className="h-2 w-2 rounded-full bg-dermis" />
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <section aria-label="What NEA treats" className="relative space-y-4 border-y border-ink/[0.06] py-10">
      {row(ROW_A)}
      {row(ROW_B, true, true)}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The NEA Method: Apple-style pinned story (desktop), stacked (mobile) */
/* ------------------------------------------------------------------ */
type Step = { n: string; title: string; kicker: string; text: string; chips: string[]; image: string; metric: { label: string; value: string } };
const STEPS: Step[] = [
  {
    n: "01",
    title: "Test",
    kicker: "Measure what is underneath",
    text: "A 15-minute advanced skin scan maps UV damage, hidden pigment, pores, redness and hydration. Where it matters, BioAro tests read your skin and gut microbiome, hormones and vitamins.",
    chips: ["Advanced skin scan", "BioSkin microbiome", "Hormones & vitamins"],
    image: IMG.labPipette,
    metric: { label: "Skin layers mapped", value: "6" },
  },
  {
    n: "02",
    title: "Treat",
    kicker: "In clinic and at home",
    text: "Fotona laser, medical peels and injectables work in clinic. A medical-grade routine and a Registered Dietitian's plan work on the cause at home.",
    chips: ["Fotona laser", "Medical peels", "Dietitian plan"],
    image: IMG.laserFace,
    metric: { label: "Treatments in one plan", value: "29" },
  },
  {
    n: "03",
    title: "Track",
    kicker: "Progress you can see in numbers",
    text: "We re-scan at day 45 and day 90 and put the results side by side, so you can see the change, not just feel it.",
    chips: ["Day 45 re-scan", "Day 90 re-scan", "Before / after report"],
    image: IMG.consult,
    metric: { label: "Re-scans per program", value: "2" },
  },
  {
    n: "04",
    title: "Maintain",
    kicker: "Keep the result",
    text: "A simple monthly plan and a quarterly re-scan keep breakouts, pigment and ageing from creeping back.",
    chips: ["Monthly plan", "Quarterly re-scan", "Glow membership"],
    image: IMG.serum,
    metric: { label: "Re-scan every", value: "3 mo" },
  },
];
const ICONS = [FlaskConical, Sparkles, ChartLine, Repeat2];

export function MethodStory() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length * 0.999))));
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative lg:h-[400vh]" aria-label="The NEA Method">
      {/* desktop: pinned */}
      <div className="sticky top-0 hidden h-screen items-center lg:flex">
        <div className="container grid grid-cols-[0.95fr_1.05fr] items-center gap-16">
          <div>
            <p className="eyebrow">The NEA Method</p>
            <h2 className="mt-5 font-display text-display-lg text-ink">
              Four steps. <em className="aurora-text">Every</em> program.
            </h2>
            <div className="relative mt-12 min-h-[300px]">
              {STEPS.map((s, i) => {
                const Icon = ICONS[i];
                return (
                  <motion.div
                    key={s.n}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : active > i ? -24 : 24, filter: active === i ? "blur(0px)" : "blur(6px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden={active !== i}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="tabular font-display text-[5.5rem] leading-none text-ink/15">{s.n}</span>
                      <div>
                        <p className="flex items-center gap-2 text-[13px] text-flora">
                          <Icon className="h-4 w-4" /> {s.kicker}
                        </p>
                        <h3 className="mt-1 font-display text-[3.2rem] leading-none text-ink">{s.title}</h3>
                      </div>
                    </div>
                    <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-graphite">{s.text}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {s.chips.map((c) => (
                        <span key={c} className="chip !py-1.5 !text-[13px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="relative h-[3px] w-56 overflow-hidden rounded-full bg-ink/10">
                <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: bar, background: "var(--grad-text)" }} />
              </div>
              <span className="tabular text-[12px] text-graphite">
                {STEPS[active].n} / 04
              </span>
            </div>
          </div>

          <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[40px] border border-white/80 shadow-[0_50px_120px_-60px_rgba(var(--shadow-tint),0.6)]">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="absolute inset-0"
                initial={false}
                animate={{ clipPath: i <= active ? "inset(0% 0% 0% 0% round 40px)" : "inset(100% 0% 0% 0% round 40px)", scale: i === active ? 1 : 1.08 }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                style={{ zIndex: i }}
              >
                <NeaImage src={s.image} alt="" fill sizes="50vw" className="object-cover" />
              </motion.div>
            ))}
            <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-abyss/45 to-transparent" />
            <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass absolute bottom-6 left-6 z-20 rounded-2xl px-5 py-4">
              <p className="text-[12px] text-graphite">{STEPS[active].metric.label}</p>
              <p className="tabular font-display text-4xl leading-none text-ink">{STEPS[active].metric.value}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* mobile + tablet: stacked */}
      <div className="container py-20 lg:hidden">
        <p className="eyebrow">The NEA Method</p>
        <h2 className="mt-4 font-display text-display-md text-ink">
          Four steps. <em className="aurora-text">Every</em> program.
        </h2>
        <ol className="mt-10 space-y-10">
          {STEPS.map((s) => (
            <li key={s.n}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
                <NeaImage src={s.image} alt="" fill sizes="100vw" className="object-cover" />
              </div>
              <p className="mt-5 text-[13px] text-flora">
                {s.n} · {s.kicker}
              </p>
              <h3 className="mt-1 font-display text-4xl text-ink">{s.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-graphite">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Body Intelligence: the 3D hologram with an editorial frame          */
/* ------------------------------------------------------------------ */
export function BodyIntelChapter({ regions }: { regions: ScanRegion[] }) {
  return (
    <section className="chapter relative overflow-hidden">
      <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Body Intelligence</p>
          <SplitReveal text={"Ten systems.\n*One* skin."} className="mt-5 font-display text-display-lg text-ink" />
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-graphite">
            Breakouts, pigment, hair loss and ageing start in places a mirror can’t see. Tap any glowing point to open it, or switch on the X-ray lens to look inside.
          </p>
          <ul className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-ink/10 pt-6">
            {[
              ["10", "body systems"],
              ["6", "facial zones"],
              ["1", "connected plan"],
            ].map(([n, l]) => (
              <li key={l}>
                <p className="tabular font-display text-4xl leading-none text-ink">{n}</p>
                <p className="mt-1 text-[12.5px] text-graphite">{l}</p>
              </li>
            ))}
          </ul>
          <Link href="/body" className="btn-light mt-9">
            Open the 3D Body Explorer <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative lg:h-[78svh] lg:min-h-[560px]">
          <HeroBody regions={regions} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Programs rail: vertical scroll drives a horizontal gallery (desktop) */
/* ------------------------------------------------------------------ */
type ProgramLite = { slug: string; name: string; problem: string; headline: string; priceFrom: number; duration: string; image: string };

export function ProgramsRail({ programs }: { programs: ProgramLite[] }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current;
      if (el) setDist(Math.max(0, el.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  const card = (p: ProgramLite, i: number) => (
    <Link
      key={p.slug}
      href={`/programs/${p.slug}`}
      className="group relative block aspect-[4/5] w-[min(80vw,440px)] shrink-0 snap-start overflow-hidden rounded-[36px] border border-white/80 shadow-[0_40px_100px_-60px_rgba(var(--shadow-tint),0.7)]"
    >
      <NeaImage src={p.image} alt="" fill sizes="440px" className="object-cover transition duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/10 to-transparent" />
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <span className="tabular rounded-full bg-white/85 px-3 py-1 text-[12px] text-ink backdrop-blur">0{i + 1}</span>
        <span className="rounded-full bg-white/85 px-3 py-1 text-[12px] text-ink backdrop-blur">{p.problem}</span>
      </div>
      <div className="absolute inset-x-6 bottom-6 text-white">
        <h3 className="font-display text-[2.4rem] leading-[1] !text-white">{p.name.replace(" Program", "")}</h3>
        <p className="mt-2 max-w-xs text-[15px] leading-snug text-white/85">{p.headline}</p>
        <div className="mt-5 flex items-center justify-between border-t border-white/25 pt-4 text-[13px] text-white/85">
          <span>
            From <strong className="font-medium text-white">{money(p.priceFrom)}</strong> · {p.duration}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition group-hover:scale-110">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );

  const intro = (
    <div className="w-[min(80vw,380px)] shrink-0 self-center pr-6">
      <p className="eyebrow">Programs</p>
      <h2 className="mt-5 font-display text-display-lg text-ink">
        Four problems, <em className="aurora-text">solved</em> start to finish.
      </h2>
      <p className="mt-5 text-[16px] leading-relaxed text-graphite">Each program brings the right tests, treatments and nutrition together around one goal, with a price you see before you book.</p>
      <Link href="/programs" className="btn-ghost mt-8">
        Compare programs
      </Link>
    </div>
  );

  return (
    <section ref={ref} className={cn("relative", !reduce && "lg:h-[260vh]")} aria-label="NEA programs">
      <div className={cn("overflow-hidden", !reduce && "lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center")}>
        {/* desktop: scroll-driven */}
        <motion.div ref={track} style={reduce ? undefined : { x }} className="hidden gap-6 pl-[max(2rem,calc((100vw-1240px)/2+2rem))] lg:flex">
          {intro}
          {programs.map(card)}
        </motion.div>
        {/* mobile: native swipe */}
        <div className="container py-16 lg:hidden">{intro}</div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-16 lg:hidden">{programs.map(card)}</div>
      </div>
    </section>
  );
}
