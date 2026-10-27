"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 3D Cards Carousel — a scroll-driven coverflow. Native horizontal scroll
 * (trackpad, touch, keys) drives perspective: the centred card faces you,
 * neighbours rotate away and recede.
 */
export function Coverflow({ children, className, cardWidth = 380, label = "Carousel" }: { children: ReactNode[]; className?: string; cardWidth?: number; label?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const sc = scroller.current;
    if (!sc) return;
    const mid = sc.scrollLeft + sc.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    cards.current.forEach((c, i) => {
      if (!c) return;
      const center = c.offsetLeft + c.offsetWidth / 2;
      const d = (center - mid) / c.offsetWidth; // in card widths
      const ad = Math.abs(d);
      const inner = c.firstElementChild as HTMLElement | null;
      if (inner) {
        const rot = Math.max(-55, Math.min(55, -d * 38));
        const scale = 1 - Math.min(ad, 2) * 0.12;
        const z = -Math.min(ad, 2.5) * 140;
        inner.style.transform = `translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`;
        inner.style.opacity = String(1 - Math.min(Math.max(ad - 1.2, 0), 1) * 0.7);
      }
      if (ad < bestD) {
        bestD = ad;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  const go = (dir: number) => {
    const c = cards.current[Math.max(0, Math.min(children.length - 1, active + dir))];
    const sc = scroller.current;
    if (c && sc) sc.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - sc.clientWidth / 2, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={scroller}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain py-10 [perspective:1400px]"
        style={{ paddingInline: `max(1.25rem, calc(50% - ${cardWidth / 2}px))` }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            ref={(n) => {
              cards.current[i] = n;
            }}
            className="shrink-0 snap-center preserve-3d"
            style={{ width: `min(${cardWidth}px, 82vw)` }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${children.length}`}
          >
            <div className="h-full transition-[opacity] duration-200 will-change-transform preserve-3d">{child}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white transition hover:bg-mist disabled:opacity-30" disabled={active === 0} aria-label="Previous">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {children.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/20")} />
          ))}
        </div>
        <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white transition hover:bg-mist disabled:opacity-30" disabled={active === children.length - 1} aria-label="Next">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
