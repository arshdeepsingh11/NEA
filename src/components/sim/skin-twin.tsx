"use client";
import Link from "next/link";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowUpRight, BedDouble, Brain, GlassWater, Salad, Sparkles, Sun, Waves } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NeaImage } from "@/components/ui/nea-image";
import { useAi } from "@/components/ai/ai-provider";
import { IMG } from "@/content/media";
import { cn } from "@/lib/utils";

/**
 * Skin Twin: move your everyday habits and watch a digital twin of a face respond.
 * Every number comes from a small, open formula (shown under "How it works"), so the cause and the effect are clear.
 * It teaches direction, not diagnosis: the real numbers come from NEA's scan and tests.
 */
type Inputs = { sleep: number; water: number; sun: number; stress: number; food: number; cycle: number };
const DEFAULT: Inputs = { sleep: 6, water: 5, sun: 45, stress: 7, food: 4, cycle: 1 };
const IDEAL: Inputs = { sleep: 8, water: 8, sun: 5, stress: 3, food: 8, cycle: 0 };

const c01 = (v: number) => Math.max(0, Math.min(1, v));
export function model(i: Inputs) {
  const sleep = c01((i.sleep - 4) / 4);
  const water = c01((i.water - 2) / 6);
  const sun = 1 - c01(i.sun / 90);
  const stress = 1 - (i.stress - 1) / 9;
  const food = (i.food - 1) / 9;
  const cycle = 1 - i.cycle / 2;
  const glow = 100 * (0.4 * sleep + 0.35 * water + 0.25 * food);
  const clarity = 100 * (0.35 * cycle + 0.3 * food + 0.2 * stress + 0.15 * sleep);
  const tone = 100 * (0.7 * sun + 0.15 * cycle + 0.15 * sleep);
  const calm = 100 * (0.4 * stress + 0.35 * food + 0.25 * sun);
  const score = (glow + clarity + tone + calm) / 4;
  return { glow, clarity, tone, calm, score, f: { sleep, water, sun, stress, food, cycle } };
}

const BREAKOUTS = [
  [31, 60], [69, 61], [36, 66], [64, 67], [44, 35], [57, 33], [50, 76], [27, 55], [73, 54], [41, 72], [60, 74], [47, 41],
] as const;
const SPOTS = [
  [34, 56], [38, 52], [62, 52], [66, 57], [45, 50], [56, 49], [30, 50], [70, 49],
] as const;

export function SkinTwin({ className }: { className?: string }) {
  const ai = useAi();
  const [v, setV] = useState<Inputs>(DEFAULT);
  const m = useMemo(() => model(v), [v]);
  const set = (k: keyof Inputs) => (n: number) => setV((s) => ({ ...s, [k]: n }));

  // smooth the big score
  const mv = useMotionValue(m.score);
  const shown = useTransform(mv, (x) => Math.round(x));
  const [n, setN] = useState(Math.round(m.score));
  useEffect(() => {
    const c = animate(mv, m.score, { duration: 0.6, ease: "easeOut" });
    const u = shown.on("change", setN);
    return () => {
      c.stop();
      u();
    };
  }, [m.score, mv, shown]);

  const breakouts = Math.round(((100 - m.clarity) / 100) * BREAKOUTS.length * 1.2);
  const notes = explain(v, m);

  return (
    <div className={cn("grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14", className)}>
      {/* the twin */}
      <div className="relative mx-auto w-full max-w-[520px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border border-white/80 shadow-[0_50px_120px_-60px_rgba(var(--shadow-tint),0.65)]">
          <motion.div className="absolute inset-0" animate={{ filter: `saturate(${0.7 + m.glow / 300}) brightness(${0.9 + m.glow / 900}) contrast(${0.96 + m.glow / 2000})` }} transition={{ duration: 0.5 }}>
            <NeaImage src={IMG.scanFace} alt="Digital skin twin" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover object-[50%_40%]" />
          </motion.div>
          {/* redness: inflammation shows on the cheeks first */}
          <motion.div aria-hidden className="absolute inset-0 mix-blend-multiply" animate={{ opacity: ((100 - m.calm) / 100) * 0.9 }} transition={{ duration: 0.5 }} style={{ background: "radial-gradient(14% 10% at 32% 59%, rgba(220,70,70,0.55), transparent 70%), radial-gradient(14% 10% at 68% 59%, rgba(220,70,70,0.55), transparent 70%), radial-gradient(10% 6% at 50% 55%, rgba(220,70,70,0.35), transparent 70%)" }} />
          {/* glow: a healthy sheen on the high points */}
          <motion.div aria-hidden className="absolute inset-0 mix-blend-screen" animate={{ opacity: m.glow / 140 }} transition={{ duration: 0.5 }} style={{ background: "radial-gradient(10% 7% at 50% 38%, rgba(255,255,255,0.7), transparent 70%), radial-gradient(9% 6% at 36% 54%, rgba(255,255,255,0.5), transparent 70%), radial-gradient(9% 6% at 64% 54%, rgba(255,255,255,0.5), transparent 70%)" }} />
          {/* breakouts */}
          {BREAKOUTS.map(([x, y], k) => (
            <motion.span key={k} aria-hidden className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: "radial-gradient(circle, rgba(196,60,60,0.95) 0 35%, rgba(220,110,100,0.5) 60%, transparent 72%)" }} animate={{ opacity: k < breakouts ? 1 : 0, scale: k < breakouts ? 1 : 0.4 }} transition={{ duration: 0.4 }} />
          ))}
          {/* sun spots */}
          {SPOTS.map(([x, y], k) => (
            <motion.span key={k} aria-hidden className="absolute h-[7px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(110,70,40,0.6)] blur-[1px]" style={{ left: `${x}%`, top: `${y}%` }} animate={{ opacity: c01((100 - m.tone) / 70) }} transition={{ duration: 0.5 }} />
          ))}
          {/* scanner chrome */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-[24%] animate-[heroscan_5s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[11.5px] text-ink backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flora" /> Skin Twin · live
          </div>
        </div>
        {/* score */}
        <div className="glass absolute -bottom-6 left-1/2 flex w-[86%] -translate-x-1/2 items-center gap-5 rounded-3xl px-5 py-4">
          <Ring value={m.score} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-graphite">Skin score</p>
            <p className="tabular font-display text-[2.6rem] leading-none text-ink">
              {n}
              <span className="text-[15px] text-graphite">/100</span>
            </p>
          </div>
          <button onClick={() => setV(IDEAL)} className="btn-ghost !px-3.5 !py-2 !text-[12.5px]">
            <Sparkles className="h-3.5 w-3.5" /> Best habits
          </button>
        </div>
      </div>

      {/* the inputs */}
      <div className="pt-6 lg:pt-0">
        <div className="grid gap-5 sm:grid-cols-2">
          <Slider icon={<BedDouble />} label="Sleep" value={v.sleep} min={4} max={9} step={0.5} unit="h a night" onChange={set("sleep")} />
          <Slider icon={<GlassWater />} label="Water" value={v.water} min={2} max={12} step={1} unit="glasses a day" onChange={set("water")} />
          <Slider icon={<Sun />} label="Sun without SPF" value={v.sun} min={0} max={120} step={5} unit="min a day" onChange={set("sun")} />
          <Slider icon={<Brain />} label="Stress" value={v.stress} min={1} max={10} step={1} unit="out of 10" onChange={set("stress")} />
          <Slider icon={<Salad />} label="Whole foods" value={v.food} min={1} max={10} step={1} unit="out of 10" onChange={set("food")} />
          <Choice icon={<Waves />} label="Breakouts with your cycle or stress" value={v.cycle} options={["Never", "Sometimes", "Often"]} onChange={set("cycle")} />
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Glow", m.glow, "Sleep, water, food"],
            ["Clarity", m.clarity, "Hormones, food, stress"],
            ["Even tone", m.tone, "Mostly sun"],
            ["Calm", m.calm, "Stress, food, sun"],
          ].map(([l, val, why]) => (
            <div key={l as string} className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-ink">{l}</span>
                <span className="tabular font-display text-[1.35rem] leading-none text-ink">{Math.round(val as number)}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-ink/[0.07]">
                <motion.div className="h-full rounded-full" style={{ background: "rgb(var(--viz-1))" }} animate={{ width: `${val}%` }} transition={{ duration: 0.5 }} />
              </div>
              <p className="mt-1.5 text-[11px] text-graphite">{why}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-ink/[0.07] bg-white/60 p-5">
          <p className="flex items-center gap-2 text-[13px] font-medium text-flora">
            <Sparkles className="h-4 w-4" /> What SI sees
          </p>
          <ul className="mt-3 space-y-2">
            {notes.map((t) => (
              <li key={t.text} className="flex gap-3 text-[14.5px] leading-snug text-ink">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", t.good ? "bg-[rgb(var(--viz-good))]" : "bg-[rgb(var(--viz-watch))]")} />
                <span>
                  {t.text}{" "}
                  {t.href && (
                    <Link href={t.href} className="whitespace-nowrap text-flora underline-offset-4 hover:underline">
                      {t.link} →
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/skin-scan" className="btn-light !px-4 !py-2 !text-[13px]">
              Measure my real skin, free <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => ai.open({ query: `My habits: ${v.sleep}h sleep, ${v.water} glasses of water, ${v.sun} min sun without SPF, stress ${v.stress}/10, whole foods ${v.food}/10. What should I change first for my skin?` })} className="btn-ghost !px-4 !py-2 !text-[13px]">
              <Sparkles className="h-3.5 w-3.5" /> Ask SI what to change first
            </button>
          </div>
        </div>
        <details className="mt-4 text-[12.5px] text-graphite">
          <summary className="cursor-pointer select-none hover:text-ink">How it works</summary>
          <p className="mt-2 leading-relaxed">
            Each habit is turned into a 0–1 value (for example, 8 hours of sleep = 1, 4 hours = 0). Glow = 40% sleep + 35% water + 25% food. Clarity = 35% cycle breakouts + 30% food + 20% stress + 15% sleep. Even tone = 70% sun + 15% cycle + 15% sleep. Calm = 40% stress + 35% food + 25% sun. Skin score is the average. It shows which way each habit pushes your skin; it is not a diagnosis.
          </p>
        </details>
      </div>
    </div>
  );
}

function explain(v: Inputs, m: ReturnType<typeof model>) {
  const out: { text: string; good?: boolean; href?: string; link?: string }[] = [];
  if (v.sleep < 7) out.push({ text: `Under 7 hours of sleep: skin repairs mostly at night, so less sleep shows up as dullness.` });
  if (v.water < 6) out.push({ text: `Low water: the barrier holds less moisture, which looks tight and flaky in dry Calgary air.` });
  if (v.sun > 20) out.push({ text: `${v.sun} minutes of unprotected sun a day is the main driver of dark spots and early lines.`, href: "/programs/even-tone", link: "Even Tone Program" });
  if (v.stress > 6) out.push({ text: `High stress raises cortisol, which slows healing and can trigger breakouts and redness.`, href: "/tests#cortisol", link: "Cortisol test" });
  if (v.food < 6) out.push({ text: `More processed food feeds gut inflammation, one of the most common hidden causes of acne and rosacea.`, href: "/microbiome", link: "BioGut test" });
  if (v.cycle > 0) out.push({ text: `Breakouts that follow your cycle or stress point to hormones.`, href: "/programs/clear-skin", link: "Clear Skin Program" });
  if (!out.length) out.push({ text: `These habits support healthy skin. A scan shows what is still happening underneath.`, good: true });
  if (m.score >= 75) out.unshift({ text: `Strong habits. Your score is ${Math.round(m.score)}.`, good: true });
  return out.slice(0, 4);
}

function Slider({ icon, label, value, min, max, step, unit, onChange }: { icon: ReactNode; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2 text-[13.5px] text-ink">
        <span className="flex items-center gap-2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-flora">
          {icon}
          {label}
        </span>
        <span className="tabular text-graphite">
          <span className="font-medium text-ink">{value}</span> {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="nea-range mt-2 w-full"
        style={{ ["--p" as string]: `${pct}%` }}
        aria-label={label}
      />
    </label>
  );
}

function Choice({ icon, label, value, options, onChange }: { icon: ReactNode; label: string; value: number; options: string[]; onChange: (n: number) => void }) {
  return (
    <div>
      <span className="flex items-center gap-2 text-[13.5px] text-ink [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-flora">
        {icon}
        {label}
      </span>
      <div className="mt-2 flex rounded-full border border-ink/10 bg-white/70 p-1">
        {options.map((o, i) => (
          <button key={o} onClick={() => onChange(i)} className={cn("flex-1 rounded-full px-2 py-1.5 text-[12.5px] transition", value === i ? "bg-ink text-white" : "text-ink/70 hover:text-ink")}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--c-ink) / 0.08)" strokeWidth="6" />
      <motion.circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--viz-1))" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 0.6 }} transform="rotate(-90 32 32)" />
    </svg>
  );
}
