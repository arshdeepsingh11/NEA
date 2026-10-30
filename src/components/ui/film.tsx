"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilmSource = { src: string; poster: string; /** CSS media query; the first match wins, the last source is the fallback */ media?: string };
export type FilmChapter = { at: number; label: string; note?: string };

/**
 * A silent, looping film that picks the right shape for the screen (e.g. square on phones, wide on desktop),
 * plays only while visible, and, given chapters, shows a live caption and a chapter timeline in sync with the picture.
 * Visitors can pause it, and it stays on its poster for people who prefer reduced motion.
 */
export function Film({ sources, chapters, label, className, dark = true, pauseAt = "top" }: { sources: FilmSource[]; chapters?: FilmChapter[]; label: string; className?: string; dark?: boolean; pauseAt?: "top" | "bottom" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [pick, setPick] = useState(sources[sources.length - 1]);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = useRef(false);

  // choose the version for this screen, and switch if the screen changes
  useEffect(() => {
    const choose = () => setPick(sources.find((s) => !s.media || window.matchMedia(s.media).matches) ?? sources[sources.length - 1]);
    choose();
    const mqs = sources.filter((s) => s.media).map((s) => window.matchMedia(s.media!));
    mqs.forEach((m) => m.addEventListener("change", choose));
    return () => mqs.forEach((m) => m.removeEventListener("change", choose));
  }, [sources]);

  // play only on screen; respect reduced motion and data saver
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches || Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    if (still.current) {
      v.pause();
      setPaused(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !v.dataset.userPaused ? v.play().catch(() => {}) : v.pause()), { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, [pick]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      delete v.dataset.userPaused;
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.dataset.userPaused = "1";
      v.pause();
      setPaused(true);
    }
  };

  let idx = -1;
  if (chapters) for (let i = 0; i < chapters.length; i++) if (t >= chapters[i].at || i === 0) idx = i;
  const cur = chapters?.[idx];
  const seek = (s: number) => {
    const v = ref.current;
    if (v) v.currentTime = s + 0.05;
  };

  return (
    <figure className={cn("group relative overflow-hidden bg-black", className)}>
      <video
        key={pick.src}
        ref={ref}
        src={pick.src}
        poster={pick.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={label}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {chapters && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
          <figcaption className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-5">
            <AnimatePresence mode="wait">
              {cur && (
                <motion.div key={idx} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
                  <p className="tabular text-[11.5px] uppercase tracking-[0.18em] text-white/70">
                    Step {idx + 1} of {chapters.length}
                  </p>
                  <p className="mt-1 font-display text-[clamp(1.3rem,3vw,2rem)] leading-tight">{cur.label}</p>
                  {cur.note && <p className="mt-0.5 max-w-md text-[13.5px] text-white/80">{cur.note}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            {/* chapter timeline: each segment fills as the film plays; tap one to jump there */}
            <div className="mt-3 flex gap-1.5">
              {chapters.map((c, i) => {
                const end = chapters[i + 1]?.at ?? dur;
                const fill = t >= end ? 1 : t <= c.at ? 0 : (t - c.at) / Math.max(0.1, end - c.at);
                return (
                  <button key={c.label} onClick={() => seek(c.at)} aria-label={`Jump to ${c.label}`} className="group/seg relative h-6 flex-1">
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                      <span className="block h-full rounded-full bg-white" style={{ width: `${fill * 100}%` }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </figcaption>
        </>
      )}
      <button onClick={toggle} aria-label={paused ? "Play film" : "Pause film"} className={cn("absolute right-3 grid h-9 w-9", pauseAt === "top" ? "top-3" : "bottom-3", "place-items-center rounded-full backdrop-blur-md transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100", dark ? "bg-black/40 text-white" : "bg-white/80 text-ink", paused && "sm:opacity-100")}>
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>
    </figure>
  );
}
