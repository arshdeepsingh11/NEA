"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Apple, Brain, CalendarHeart, Droplets, FlaskConical, Moon, Salad, Sparkles, Stethoscope, Users } from "lucide-react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { duration: 0.8, ease: EASE } };

/**
 * "Why NEA", told as a short story you scroll through: one feeling, one line and one picture per screen.
 * Built phone-first: every scene fits a phone screen, and the motion follows your scroll.
 */
export function WhyStory() {
  return (
    <div className="overflow-x-clip">
      <Tried />
      <NotYourFault />
      <WeLook />
      <OneTeam />
      <Compare />
      <Proof />
      <FirstStep />
    </div>
  );
}

/* 1. Tried everything? */
const TRIED = ["Creams", "Facials", "Peels", "Serums"];
function Tried() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const q = useTransform(p, [0.45, 0.6], [0, 1]);
  const qy = useTransform(p, [0.45, 0.6], [20, 0]);
  const a = useTransform(p, [0.65, 0.8], [0, 1]);
  const ay = useTransform(p, [0.65, 0.8], [20, 0]);
  return (
    <section ref={ref} className="relative h-[240svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-5 text-center">
        <p className="text-[13px] uppercase tracking-[0.2em] text-graphite">Why NEA</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,9vw,6.4rem)] leading-[0.98] tracking-[-0.02em] text-ink">Tried everything?</h1>
        <ul className="mt-9 flex max-w-2xl flex-wrap justify-center gap-2.5">
          {TRIED.map((t, i) => (
            <TriedChip key={t} text={t} p={p} i={i} />
          ))}
        </ul>
        <motion.p style={{ opacity: q, y: qy }} className="mt-10 max-w-xl font-display text-[clamp(1.5rem,4.4vw,2.4rem)] leading-snug text-graphite">
          And your skin still isn’t happy?
        </motion.p>
        <motion.p style={{ opacity: a, y: ay }} className="mt-3 font-display text-[clamp(1.9rem,5.6vw,3.2rem)] leading-tight">
          <span className="aurora-text italic">We find out why.</span>
        </motion.p>
      </div>
    </section>
  );
}
function TriedChip({ text, p, i }: { text: string; p: MotionValue<number>; i: number }) {
  const opacity = useTransform(p, [0.06 + i * 0.08, 0.14 + i * 0.08], [0, 1]);
  const y = useTransform(p, [0.06 + i * 0.08, 0.14 + i * 0.08], [16, 0]);
  return (
    <motion.li style={{ opacity, y }} className="rounded-full border border-ink/10 bg-white px-5 py-2.5 text-[17px] text-ink shadow-[0_10px_30px_-20px_rgba(var(--shadow-tint),0.6)] md:px-7 md:py-3 md:text-[21px]">
      {text}
    </motion.li>
  );
}

/* 2. It's not you: what you see is only the tip. */
const SEEN = ["Breakouts", "Dull skin", "Dark spots"];
const UNSEEN = [
  { label: "Sleep", icon: Moon },
  { label: "Stress", icon: Brain },
  { label: "Food", icon: Apple },
  { label: "Hormones", icon: Droplets },
  { label: "Gut", icon: Salad },
];
function NotYourFault() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dive = useTransform(p, [0.2, 0.6], ["0%", "-34%"]);
  const below = useTransform(p, [0.4, 0.62], [0, 1]);
  const words = useTransform(p, [0.62, 0.8], [0, 1]);
  return (
    <section ref={ref} className="relative h-[260svh] bg-ink text-white">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-6 overflow-hidden px-5 py-20 md:flex-row md:gap-16">
        <div className="text-center md:max-w-md md:text-left">
          <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.98]">It’s not you.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/75 md:text-[20px]">What you see is only the tip.</p>
          <motion.p style={{ opacity: words }} className="mt-2 text-[17px] leading-relaxed text-white md:text-[20px]">
            Most places treat the tip. <span className="text-[#f3d9a4]">We look at the rest.</span>
          </motion.p>
        </div>
        <div className="relative h-[min(56svh,520px)] w-[min(84vw,400px)] shrink-0 overflow-hidden rounded-[36px]">
          <motion.div style={{ y: dive }} className="absolute inset-x-0 top-0 h-[150%]">
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[#f6e7da] to-[#f3d9c8]" />
            <div className="absolute inset-x-0 bottom-0 top-[30%] bg-gradient-to-b from-[#7fa6b8] via-[#3f5f78] to-[#1c2a3a]" />
            <svg viewBox="0 0 300 450" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="ice-top" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#e3eef4" />
                </linearGradient>
                <linearGradient id="ice-deep" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#a9cfdf" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#6f9cb4" stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <path d="M150 62 L178 98 L196 135 L104 135 L122 100 Z" fill="url(#ice-top)" />
              <path d="M104 135 L196 135 L238 190 L262 270 L240 350 L190 410 L110 410 L62 350 L40 268 L66 190 Z" fill="url(#ice-deep)" />
              <line x1="0" x2="300" y1="135" y2="135" stroke="white" strokeOpacity="0.8" strokeWidth="1" />
            </svg>
            <div className="absolute inset-x-0 top-[4%] flex flex-wrap justify-center gap-1.5 px-4">
              {SEEN.map((t) => (
                <span key={t} className="rounded-full bg-white/90 px-3 py-1 text-[13px] font-medium text-ink shadow-sm">
                  {t}
                </span>
              ))}
            </div>
            <motion.div style={{ opacity: below }} className="absolute inset-x-0 top-[38%] flex flex-col items-center gap-2 px-6">
              <p className="mb-1 rounded-full bg-[#1c2a3a]/70 px-3 py-1 text-[11.5px] uppercase tracking-[0.2em] text-white">What’s causing it</p>
              <div className="flex max-w-[16rem] flex-wrap justify-center gap-2">
                {UNSEEN.map((d) => (
                  <span key={d.label} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1c2a3a]/75 px-3 py-1.5 text-[14px] font-medium text-white shadow-lg backdrop-blur-md">
                    <d.icon className="h-3.5 w-3.5 text-[#f3d9a4]" /> {d.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* 3. We don’t guess. We look. */
function WeLook() {
  const steps = [
    { w: "Look.", d: "We scan your skin up close." },
    { w: "Find.", d: "A simple test shows why it keeps happening." },
    { w: "Fix.", d: "We treat the why, not just the spot." },
  ];
  return (
    <section className="chapter">
      <div className="container mx-auto max-w-3xl">
        <div>
          <motion.h2 {...reveal} className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] text-ink">
            We don’t guess.
            <br />
            <span className="aurora-text italic">We look.</span>
          </motion.h2>
          <ol className="mt-10 space-y-7">
            {steps.map((s, i) => (
              <motion.li key={s.w} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }} className="flex gap-5">
                <span className="tabular mt-1 font-display text-[1.1rem] text-ink/30">0{i + 1}</span>
                <span>
                  <span className="block font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-ink">{s.w}</span>
                  <span className="mt-2 block max-w-md text-[16px] text-graphite">{s.d}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* 4. One team. One plan. Yours. */
function OneTeam() {
  const team = [
    { icon: Sparkles, t: "Skin experts", d: "They care for your skin" },
    { icon: Stethoscope, t: "Doctors", d: "They keep it safe, start to finish" },
    { icon: FlaskConical, t: "Dietitian", d: "Food that helps your skin" },
  ];
  return (
    <section className="chapter bg-mist/60">
      <div className="container text-center">
        <motion.h2 {...reveal} className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] text-ink">
          One team. One plan. <span className="aurora-text italic">Yours.</span>
        </motion.h2>
        <motion.p {...reveal} className="mx-auto mt-5 max-w-xl text-[17px] text-graphite">
          No menu. No guesswork. Just people who work together, on you.
        </motion.p>
        <div className="relative mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
          {team.map((m, i) => (
            <motion.div key={m.t} initial={{ opacity: 0, y: 30, x: (1 - i) * 40 }} whileInView={{ opacity: 1, y: 0, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }} className="rounded-[28px] border border-ink/[0.07] bg-white p-6 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-full [background:var(--aurora)]">
                <m.icon className="h-5 w-5 text-ink" />
              </span>
              <p className="mt-4 font-display text-[1.5rem] leading-tight text-ink">{m.t}</p>
              <p className="mt-1 text-[14.5px] text-graphite">{m.d}</p>
            </motion.div>
          ))}
        </div>
        {/* the three lines meet */}
        <svg viewBox="0 0 300 60" className="mx-auto hidden h-14 w-full max-w-4xl sm:block" aria-hidden>
          <motion.path d="M50 0 C50 40 150 30 150 60 M150 0 L150 60 M250 0 C250 40 150 30 150 60" fill="none" stroke="rgb(var(--c-ink))" strokeOpacity="0.25" strokeWidth="1" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4 }} />
        </svg>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.7, delay: 0.6, ease: EASE }} className="mx-auto mt-4 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-white shadow-[0_24px_60px_-24px_rgba(var(--shadow-tint),0.9)] sm:mt-0">
          <Users className="h-5 w-5 text-[#f3d9a4]" />
          <span className="font-display text-[1.4rem]">Your plan</span>
        </motion.div>
      </div>
    </section>
  );
}

/* 5. Somewhere else vs NEA: drag to compare. */
function Compare() {
  const [v, setV] = useState(100);
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.6 });
  const touched = useRef(false);
  // the first time it comes into view, the line sweeps across to reveal NEA's side
  useEffect(() => {
    if (!seen || touched.current) return;
    const c = animate(100, 0, { duration: 1.8, delay: 0.6, ease: [0.65, 0, 0.35, 1], onUpdate: (x) => !touched.current && setV(x) });
    return () => c.stop();
  }, [seen]);
  const other = ["Looks good for a few weeks", "Test results, nobody to explain them", "A diet that forgets your skin"];
  const nea = ["You know why it’s happening", "We fix the why, not just the surface", "You see it working, in numbers"];
  return (
    <section className="chapter">
      <div className="container">
        <motion.h2 {...reveal} className="text-center font-display text-[clamp(2.2rem,5.5vw,4rem)] leading-[1] text-ink">
          Somewhere else, or here?
        </motion.h2>
        <motion.p {...reveal} className="mt-4 text-center text-[15px] text-graphite">
          Drag the line to compare.
        </motion.p>
        <motion.div ref={box} {...reveal} className="relative mx-auto mt-10 h-[440px] max-w-4xl select-none overflow-hidden rounded-[36px] sm:h-[400px]">
          {/* somewhere else */}
          <div className="absolute inset-0 flex flex-col justify-center bg-[#ece9e6] p-7 sm:p-12">
            <p className="text-[13px] uppercase tracking-[0.18em] text-[#8b8580]">Somewhere else, you might get</p>
            <ul className="mt-5 space-y-4">
              {other.map((t) => (
                <li key={t} className="font-display text-[clamp(1.25rem,3vw,1.9rem)] leading-snug text-[#8b8580]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* NEA */}
          <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-12" style={{ clipPath: `inset(0 0 0 ${v}%)`, background: "linear-gradient(135deg,#f6e3c0,#ecc3a0 55%,#e2a8a8)" }}>
            <p className="text-[13px] uppercase tracking-[0.18em] text-ink/70">At NEA, you get</p>
            <ul className="mt-5 space-y-4">
              {nea.map((t) => (
                <li key={t} className="font-display text-[clamp(1.25rem,3vw,1.9rem)] leading-snug text-ink">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* handle */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_18px_rgba(0,0,0,0.25)]" style={{ left: `${Math.min(95, Math.max(5, v))}%` }}>
            <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-xl">
              <ArrowRight className="h-4 w-4 rotate-180" />
              <ArrowRight className="-ml-1 h-4 w-4" />
            </span>
          </div>
          <input type="range" min={0} max={100} value={v} onChange={(e) => ((touched.current = true), setV(Number(e.target.value)))} aria-label="Compare somewhere else with NEA" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
        </motion.div>
        <div className="mx-auto mt-4 flex max-w-4xl justify-between text-[13px] text-graphite">
          <button onClick={() => ((touched.current = true), setV(100))} className={cn("underline-offset-4 hover:underline", v > 90 && "text-ink")}>
            Somewhere else
          </button>
          <button onClick={() => ((touched.current = true), setV(0))} className={cn("underline-offset-4 hover:underline", v < 10 && "text-ink")}>
            At NEA
          </button>
        </div>
      </div>
    </section>
  );
}

/* 6. Don't take our word for it. */
function Proof() {
  // an illustration of how progress is shown, not a client's real data
  const pts = [38, 41, 47, 52, 58, 63, 69, 74];
  const path = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 300} ${100 - y}`).join(" ");
  return (
    <section className="chapter bg-ink text-white">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div>
          <motion.h2 {...reveal} className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98]">
            See it for yourself.
          </motion.h2>
          <motion.p {...reveal} className="mt-5 max-w-md text-[18px] leading-relaxed text-white/75">
            We scan again. You see the change.
          </motion.p>
          <motion.figure {...reveal} className="mt-10 max-w-md border-l-2 border-[#f3d9a4] pl-5">
            <blockquote className="font-display text-[1.35rem] leading-snug">“I struggled with adult acne and hyperpigmentation… they helped me build a skin care routine that I religiously follow now.”</blockquote>
            <figcaption className="mt-3 text-[14px] text-white/60">Kiranjot Bains · Google review</figcaption>
          </motion.figure>
        </div>
        <motion.div {...reveal} className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] text-white/70">Skin score over 90 days</p>
            <p className="text-[12px] text-white/40">Example</p>
          </div>
          <svg viewBox="0 -5 300 75" className="mt-4 w-full overflow-visible" aria-label="Example: a skin score rising over 90 days">
            {[0, 1, 2].map((i) => (
              <line key={i} x1="0" x2="300" y1={i * 30} y2={i * 30} stroke="white" strokeOpacity="0.08" />
            ))}
            <motion.path d={path} fill="none" stroke="#f3d9a4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1.8, ease: EASE }} />
            <motion.circle cx="300" cy={100 - pts[pts.length - 1]} r="4.5" fill="#f3d9a4" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.7 }} />
          </svg>
          <div className="mt-3 flex justify-between text-[12px] text-white/45">
            <span>First scan</span>
            <span>Day 45</span>
            <span>Day 90</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* 7. The first step costs nothing. */
function FirstStep() {
  return (
    <section className="relative overflow-hidden py-28 text-center md:py-40">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl" style={{ background: "var(--aurora)" }} />
      <div className="container">
        <motion.h2 {...reveal} className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,7vw,5.2rem)] leading-[0.98] text-ink">
          Start free.
        </motion.h2>
        <motion.p {...reveal} className="mx-auto mt-5 max-w-lg text-[18px] text-graphite">
          A 15-minute skin scan. No pressure. Just answers.
        </motion.p>
        <motion.div {...reveal} className="mt-10 flex flex-col items-center gap-4">
          <Link href="/skin-scan" className="btn-light !px-9 !py-4 !text-[17px]">
            <CalendarHeart className="h-5 w-5" /> Book my free skin scan
          </Link>
          <Link href="/skin-lens" className="inline-flex items-center gap-2 text-[15px] text-graphite underline-offset-4 hover:text-ink hover:underline">
            <NeaSiIcon className="h-4 w-4" /> or try Skin Lens on a selfie
          </Link>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5 }} className="mx-auto mt-20 max-w-xl font-display text-[clamp(1.3rem,3vw,1.8rem)] italic text-ink/70">
          Your skin is telling you something. We actually listen.
        </motion.p>
      </div>
    </section>
  );
}
