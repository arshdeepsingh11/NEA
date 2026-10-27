"use client";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const MORPH = 1.4;
const COOLDOWN = 1.8;

/** Gooey text morph between words (Magic UI "Morphing Text"). */
export function MorphingText({ texts, className }: { texts: string[]; className?: string }) {
  const t1 = useRef<HTMLSpanElement>(null);
  const t2 = useRef<HTMLSpanElement>(null);
  const idx = useRef(0);
  const morph = useRef(0);
  const cool = useRef(0);
  const last = useRef(new Date());

  const setStyles = useCallback(
    (fraction: number) => {
      const [a, b] = [t1.current, t2.current];
      if (!a || !b) return;
      b.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      b.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      const inv = 1 - fraction;
      a.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      a.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
      a.textContent = texts[idx.current % texts.length];
      b.textContent = texts[(idx.current + 1) % texts.length];
    },
    [texts]
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      if (t1.current) t1.current.textContent = texts[0];
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = new Date();
      const dt = (now.getTime() - last.current.getTime()) / 1000;
      last.current = now;
      cool.current -= dt;
      if (cool.current <= 0) {
        if (cool.current + dt > 0) {
          idx.current++;
          morph.current = 0;
        }
        morph.current += dt;
        let f = morph.current / MORPH;
        if (f > 1) {
          cool.current = COOLDOWN;
          f = 1;
        }
        setStyles(f);
        if (f === 1) {
          // settle
        }
      } else {
        const [a, b] = [t1.current, t2.current];
        if (a && b) {
          b.style.filter = "none";
          b.style.opacity = "100%";
          a.style.filter = "none";
          a.style.opacity = "0%";
        }
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [setStyles, texts]);

  return (
    <span className={cn("relative block h-[1.15em] w-full [filter:url(#nea-threshold)_blur(0.6px)]", className)}>
      <span ref={t1} className="absolute inset-x-0 top-0 m-auto inline-block w-full" />
      <span ref={t2} className="absolute inset-x-0 top-0 m-auto inline-block w-full" />
      <svg className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id="nea-threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      <span className="sr-only">{texts.join(", ")}</span>
    </span>
  );
}
