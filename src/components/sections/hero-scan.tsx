"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Activity, Droplets, ScanFace, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NeaImage } from "@/components/ui/nea-image";
import { cn } from "@/lib/utils";

/**
 * Hero visual: a real portrait inside an arch, with an AI skin scan running over it.
 * A scan line sweeps, landmarks light up, and readouts arrive one by one,
 * the way the free NEA Skin Health Report reads a face. Values are a labelled sample.
 */
const READOUTS = [
  { icon: Sun, label: "UV damage", value: "Early", at: { x: 50, y: 33 }, side: "r" as const },
  { icon: Droplets, label: "Hydration", value: "58%", at: { x: 58, y: 45 }, side: "r" as const },
  { icon: Activity, label: "Pigment", value: "3 spots", at: { x: 41, y: 44 }, side: "l" as const },
  { icon: ScanFace, label: "Pores", value: "Refined", at: { x: 49, y: 52 }, side: "l" as const },
];

export function HeroScan({ image, alt, className }: { image: string; alt: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const [step, setStep] = useState(reduce ? READOUTS.length : 0);

  useEffect(() => {
    if (reduce) return;
    let k = 0;
    const t = setInterval(() => {
      k = (k + 1) % (READOUTS.length + 3); // hold the full readout for a moment, then rescan
      setStep(Math.min(k, READOUTS.length));
    }, 1100);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* soft halo behind the arch */}
      <div aria-hidden className="absolute -inset-10 rounded-full opacity-80 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--glow-a), transparent)" }} />

      <motion.div style={{ y }} className="relative mx-auto aspect-[4/5] w-full max-w-[560px]">
        <div className="relative h-full w-full overflow-hidden rounded-b-[44px] rounded-t-[999px] border border-white/80 shadow-[0_40px_120px_-50px_rgba(var(--shadow-tint),0.55)]">
          <motion.div style={{ scale }} className="absolute inset-0">
            <NeaImage src={image} alt={alt} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover object-[50%_65%]" />
          </motion.div>
          {/* tone the photo into the theme */}
          <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(160deg, var(--fill-a), transparent 45%, var(--fill-c))" }} />
          {/* fine measurement grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(60% 55% at 50% 45%, black, transparent)",
            }}
          />
          {/* scan line */}
          {!reduce && (
            <div aria-hidden className="absolute inset-x-0 top-0 h-[28%] animate-[heroscan_4.4s_cubic-bezier(0.65,0,0.35,1)_infinite]">
              <div className="h-full w-full bg-gradient-to-b from-transparent via-white/45 to-transparent" />
              <div className="absolute inset-x-[10%] bottom-1/2 h-px bg-white/90 shadow-[0_0_18px_4px_rgba(255,255,255,0.8)]" />
            </div>
          )}
          {/* landmarks */}
          {READOUTS.map((r, i) => (
            <span key={r.label} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.at.x}%`, top: `${r.at.y}%` }}>
              <span className={cn("block h-2.5 w-2.5 rounded-full border-2 border-white transition-all duration-500", i < step ? "scale-100 bg-flora opacity-100" : "scale-50 bg-white opacity-40")} />
              {i < step && <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />}
            </span>
          ))}
          {/* corner brackets */}
          {["left-6 top-24 border-l border-t", "right-6 top-24 border-r border-t", "bottom-6 left-6 border-b border-l", "bottom-6 right-6 border-b border-r"].map((c) => (
            <span key={c} aria-hidden className={cn("absolute h-7 w-7 border-white/80", c)} />
          ))}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3.5 py-1.5 text-[11.5px] text-ink backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flora" />
            {step < READOUTS.length ? "Nea SI skin scan running…" : "Scan complete · sample"}
          </div>
        </div>

        {/* readouts float outside the arch */}
        {READOUTS.map((r, i) => (
          <motion.div
            key={r.label}
            initial={false}
            animate={{ opacity: i < step ? 1 : 0, x: i < step ? 0 : r.side === "r" ? 12 : -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn("glass absolute hidden items-center gap-3 rounded-2xl px-3.5 py-2.5 sm:flex", r.side === "r" ? "-right-8 lg:-right-14" : "-left-8 lg:-left-14")}
            style={{ top: `${r.at.y - 4}%` }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-flora shadow-sm">
              <r.icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[11px] text-graphite">{r.label}</span>
              <span className="tabular block font-display text-[19px] leading-none text-ink">{r.value}</span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
