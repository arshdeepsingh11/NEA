"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Apple, Brain, CalendarHeart, Droplets, FlaskConical, Moon, Salad, Sparkles, Stethoscope, Users } from "lucide-react";
import { LoopVideo } from "@/components/ui/loop-video";
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

/* 1. You've probably been here before. */
const TRIED = ["The facial", "The peel", "The serum everyone swears by", "The new cream", "The cleanse"];
function Tried() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const strike = useTransform(p, [0.5, 0.7], [0, 1]);
  const fade = useTransform(p, [0.55, 0.75], [1, 0.45]);
  const after = useTransform(p, [0.68, 0.82], [0, 1]);
  const afterY = useTransform(p, [0.68, 0.82], [20, 0]);
  return (
    <section ref={ref} className="relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-5 text-center">
        <p className="text-[13px] uppercase tracking-[0.2em] text-graphite">Why NEA</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,8vw,6rem)] leading-[0.98] tracking-[-0.02em] text-ink">You’ve probably been here before.</h1>
        <ul className="mt-10 flex max-w-2xl flex-wrap justify-center gap-2.5">
          {TRIED.map((t, i) => (
            <TriedChip key={t} text={t} p={p} i={i} strike={strike} fade={fade} />
          ))}
        </ul>
        <motion.p style={{ opacity: after, y: afterY }} className="mt-10 max-w-xl font-display text-[clamp(1.4rem,4vw,2.2rem)] leading-snug text-ink">
          It looked better for two weeks.
          <br />
          <span className="text-graphite">Then it came back.</span>
        </motion.p>
      </div>
    </section>
  );
}
function TriedChip({ text, p, i, strike, fade }: { text: string; p: MotionValue<number>; i: number; strike: MotionValue<number>; fade: MotionValue<number> }) {
  const o = useTransform(p, [0.05 + i * 0.07, 0.13 + i * 0.07], [0, 1]);
  const y = useTransform(p, [0.05 + i * 0.07, 0.13 + i * 0.07], [16, 0]);
  const opacity = useTransform([o, fade], ([a, b]: number[]) => a * b);
  return (
    <motion.li style={{ opacity, y }} className="relative rounded-full border border-ink/10 bg-white px-4 py-2 text-[15px] text-ink shadow-[0_10px_30px_-20px_rgba(var(--shadow-tint),0.6)] md:px-6 md:py-3 md:text-[20px]">
      {text}
      <motion.span aria-hidden style={{ scaleX: strike }} className="absolute inset-x-3 top-1/2 h-px origin-left bg-ink/60" />
    </motion.li>
  );
}

/* 2. It's not your fault. */
const INSIDE = [
  { label: "Gut", icon: Salad, x: "18%", y: "30%" },
  { label: "Hormones", icon: Droplets, x: "78%", y: "26%" },
  { label: "Food", icon: Apple, x: "14%", y: "66%" },
  { label: "Sleep", icon: Moon, x: "82%", y: "62%" },
  { label: "Stress", icon: Brain, x: "50%", y: "86%" },
];
function NotYourFault() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const cut = useTransform(p, [0.15, 0.6], [100, 0]);
  const clip = useTransform(cut, (v) => `inset(0 0 0 ${v}%)`);
  const line = useTransform(cut, (v) => `${v}%`);
  const labels = useTransform(p, [0.45, 0.65], [0, 1]);
  const words = useTransform(p, [0.6, 0.78], [0, 1]);
  return (
    <section ref={ref} className="relative h-[260svh] bg-ink text-white">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-6 px-5 py-20 md:flex-row md:gap-16">
        <div className="text-center md:max-w-md md:text-left">
          <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.98]">That’s not your fault.</h2>
          <motion.p style={{ opacity: words }} className="mt-4 text-[17px] leading-relaxed text-white/75 md:text-[20px]">
            Most clinics only treat what they can see. But your skin is the last stop of everything happening <em className="not-italic text-[#f3d9a4]">inside</em> you.
          </motion.p>
        </div>
        <div className="relative aspect-[3/4] w-[min(72vw,380px)] shrink-0 overflow-hidden rounded-[36px] md:w-[400px]">
          <Image src="/media/nea-why.jpg" alt="A face, and what shapes it underneath" fill sizes="400px" className="object-cover" unoptimized />
          {/* the inside view */}
          <motion.div style={{ clipPath: clip }} className="absolute inset-0">
            <Image src="/media/nea-why.jpg" alt="" fill sizes="400px" className="object-cover opacity-40 blur-[2px] saturate-0" unoptimized />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(243,217,164,0.35),rgba(20,14,12,0.85)_70%)]" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              {INSIDE.map((d) => (
                <line key={d.label} x1="50" y1="45" x2={parseFloat(d.x)} y2={parseFloat(d.y)} stroke="#f3d9a4" strokeOpacity="0.5" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
              ))}
              <circle cx="50" cy="45" r="2.2" fill="#f3d9a4" />
            </svg>
            <motion.div style={{ opacity: labels }}>
              {INSIDE.map((d) => (
                <span key={d.label} className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[13px] text-white backdrop-blur-md" style={{ left: d.x, top: d.y }}>
                  <d.icon className="h-3.5 w-3.5 text-[#f3d9a4]" /> {d.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
          <motion.span aria-hidden style={{ left: line }} className="absolute inset-y-0 w-0.5 bg-[#f3d9a4] shadow-[0_0_20px_4px_rgba(243,217,164,0.6)]" />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11.5px] text-white/85 backdrop-blur">What everyone treats</span>
        </div>
      </div>
    </section>
  );
}

/* 3. We don't guess. We look. */
function WeLook() {
  const steps = [
    { w: "Test.", d: "A simple test shows what’s really going on with your gut, hormones or vitamins." },
    { w: "Understand.", d: "We find the reason behind what you see in the mirror." },
    { w: "Treat.", d: "We treat that reason, not just the surface." },
  ];
  return (
    <section className="chapter">
      <div className="container grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-20">
        <motion.div {...reveal} className="relative mx-auto aspect-[9/16] w-[min(70vw,340px)] overflow-hidden rounded-[40px] bg-ink shadow-[0_50px_120px_-50px_rgba(var(--shadow-tint),0.8)]">
          <LoopVideo src="/media/nea-skin-lens.mp4" poster="/media/nea-skin-lens.jpg" label="Skin being scanned" className="absolute inset-0 h-full w-full" />
        </motion.div>
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
    { icon: Sparkles, t: "Skin experts", d: "Aestheticians who treat the skin you see" },
    { icon: Stethoscope, t: "Medical team", d: "Physician-managed care, start to finish" },
    { icon: FlaskConical, t: "Registered Dietitian", d: "Food and gut, the inside of your plan" },
  ];
  return (
    <section className="chapter bg-mist/60">
      <div className="container text-center">
        <motion.h2 {...reveal} className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] text-ink">
          One team. One plan. <span className="aurora-text italic">Yours.</span>
        </motion.h2>
        <motion.p {...reveal} className="mx-auto mt-5 max-w-xl text-[17px] text-graphite">
          Not a package off a menu. Three kinds of experts, one plan built around you.
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
  const other = ["A treatment that looks great for a few weeks", "A test result with nobody to explain it", "A diet plan that ignores your skin"];
  const nea = ["The reason behind your skin problem", "Treatment for that reason, not just the surface", "Proof it’s working, in numbers"];
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
            Don’t take our word for it.
          </motion.h2>
          <motion.p {...reveal} className="mt-5 max-w-md text-[18px] leading-relaxed text-white/75">
            We scan your skin again, test again, and show you the numbers changing.
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
          The first step costs nothing.
        </motion.h2>
        <motion.p {...reveal} className="mx-auto mt-5 max-w-lg text-[18px] text-graphite">
          A free 15-minute skin scan. Come in, see what we see, and decide for yourself.
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
