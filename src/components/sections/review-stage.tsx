"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/content/reviews";
import { cn } from "@/lib/utils";

const DWELL = 7000;

/**
 * Reviews as a stage, not a photo grid: one real review at a time, written large, that moves on by itself.
 * Every reviewer is an orb below; the active one fills its ring as time passes. Hover pauses; tap any orb to jump.
 */
export function ReviewStage({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const elapsed = useRef(0);
  const ring = useRef<SVGCircleElement>(null);
  const r = reviews[i];
  const go = (n: number) => {
    setI((n + reviews.length) % reviews.length);
    elapsed.current = 0;
  };

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(1, elapsed.current / DWELL);
      ring.current?.style.setProperty("stroke-dashoffset", String(100 - p * 100));
      if (p >= 1) return go(i + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused]);

  const nameOf = (x: Review) => (x.name === "Client" ? "NEA client" : x.name);
  const initials = (x: Review) => (x.name === "Client" ? "N" : x.name.split(/[\s-]+/).map((w) => w[0]).slice(0, 2).join(""));

  return (
    <div onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} className="relative overflow-hidden rounded-[36px] border border-ink/[0.07] bg-white px-6 py-10 shadow-[0_40px_100px_-60px_rgba(var(--shadow-tint),0.7)] md:px-14 md:py-14">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full opacity-50 blur-3xl" style={{ background: "var(--aurora)" }} />
      <span aria-hidden className="pointer-events-none absolute right-8 top-0 select-none font-display text-[16rem] leading-none text-ink/[0.04] md:text-[22rem]">
        ”
      </span>

      <div className="relative min-h-[17rem] md:min-h-[15rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure key={i} initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex gap-0.5 text-[#d58f63]" aria-label={r.source === "Google" ? "Google review" : "Client testimonial"}>
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-[12.5px] text-ink/80">{r.treatment}</span>
            </div>
            <blockquote className={cn("mt-5 max-w-4xl font-display leading-[1.3] text-ink", r.text.length > 420 ? "text-[clamp(1.1rem,1.7vw,1.45rem)]" : r.text.length > 220 ? "text-[clamp(1.2rem,2.1vw,1.8rem)]" : "text-[clamp(1.4rem,2.8vw,2.3rem)]")}>“{r.text}”</blockquote>
            <figcaption className="mt-6 text-[14px]">
              <span className="font-medium text-ink">{nameOf(r)}</span>
              <span className="text-graphite"> · {r.source === "Google" ? "Google review" : "NEA testimonial"}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="relative mt-10 flex items-center gap-3">
        <button onClick={() => go(i - 1)} aria-label="Previous review" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink hover:border-ink/25">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
          {reviews.map((x, k) => {
            const on = k === i;
            return (
              <button key={k} onClick={() => go(k)} aria-label={`Review from ${nameOf(x)}, ${x.treatment}`} aria-current={on} title={`${nameOf(x)} · ${x.treatment}`} className="relative grid h-11 w-11 shrink-0 place-items-center">
                <span className={cn("grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold transition", on ? "text-ink [background:var(--aurora)]" : "bg-ink/[0.05] text-ink/60 hover:bg-ink/10")}>{initials(x)}</span>
                {on && (
                  <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle ref={ring} cx="22" cy="22" r="20.5" fill="none" stroke="rgb(var(--c-ink))" strokeWidth="1.5" pathLength={100} strokeDasharray="100" strokeDashoffset="100" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <button onClick={() => go(i + 1)} aria-label="Next review" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink hover:border-ink/25">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
