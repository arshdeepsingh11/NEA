"use client";
import Link from "next/link";
import { gsap } from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SparkleItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  featured?: boolean;
  hint?: string;
};

/**
 * Sparkle Navbar (React + TypeScript + GSAP).
 * The active item is marked by a glowing strike-through that glides between labels,
 * leaves a short light trail, and throws a few sparkles when it lands.
 * Colours are customisable; by default they follow the site theme.
 */
export function SparkleNavbar({
  items,
  active,
  className,
  color = "rgb(var(--c-accent))",
  glow = "rgb(var(--c-accent2))",
  compact,
}: {
  items: SparkleItem[];
  active: number;
  className?: string;
  color?: string;
  glow?: string;
  compact?: boolean;
}) {
  const nav = useRef<HTMLElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const line = useRef<HTMLSpanElement>(null);
  const halo = useRef<HTMLSpanElement>(null);
  const sparks = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  const place = useCallback(
    (i: number, animate: boolean) => {
      const n = nav.current;
      const l = labels.current[i];
      if (!n || !line.current || !halo.current) return;
      if (!l || i < 0) {
        gsap.to([line.current, halo.current], { opacity: 0, duration: 0.3 });
        return;
      }
      const nb = n.getBoundingClientRect();
      const b = l.getBoundingClientRect();
      const x = b.left - nb.left - 4;
      const y = b.top - nb.top + b.height / 2;
      const w = b.width + 8;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!animate || reduce) {
        gsap.set(line.current, { x, y, width: w, opacity: 1 });
        gsap.set(halo.current, { x: x + w / 2, y, opacity: 1 });
        return;
      }
      const tl = gsap.timeline();
      // stretch toward the target, then settle (the "glide")
      tl.to(line.current, { x, width: w, y, opacity: 1, duration: 0.55, ease: "elastic.out(1, 0.75)" }, 0)
        .fromTo(line.current, { scaleY: 2.4 }, { scaleY: 1, duration: 0.5, ease: "power3.out" }, 0)
        .to(halo.current, { x: x + w / 2, y, opacity: 1, duration: 0.6, ease: "power3.out" }, 0);
      burst(x + w / 2, y);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const burst = (cx: number, cy: number) => {
    const host = sparks.current;
    if (!host) return;
    for (let k = 0; k < 9; k++) {
      const s = document.createElement("span");
      s.className = "sparkle-dot";
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      host.appendChild(s);
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 26;
      gsap.fromTo(
        s,
        { x: 0, y: 0, scale: 0.4 + Math.random() * 0.8, opacity: 1, rotate: 0 },
        { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7, rotate: 90, opacity: 0, duration: 0.7 + Math.random() * 0.4, ease: "power2.out", onComplete: () => s.remove() }
      );
    }
  };

  useLayoutEffect(() => {
    place(active, !first.current);
    first.current = false;
  }, [active, place, items.length]);

  useEffect(() => {
    const on = () => place(active, false);
    window.addEventListener("resize", on);
    document.fonts?.ready.then(on);
    return () => window.removeEventListener("resize", on);
  }, [active, place]);

  return (
    <nav
      ref={nav}
      aria-label="Main"
      className={cn(
        "relative flex items-center gap-1 rounded-[26px] border border-white/90 bg-white/70 p-1.5 backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgb(var(--c-ink)/0.06),0_24px_60px_-24px_rgba(var(--shadow-tint),0.45)]",
        className
      )}
      style={{ ["--sp-color" as string]: color, ["--sp-glow" as string]: glow }}
    >
      {/* glow behind the active label */}
      <span ref={halo} aria-hidden className="pointer-events-none absolute left-0 top-0 h-10 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-xl" style={{ background: "color-mix(in srgb, var(--sp-glow) 35%, transparent)" }} />
      {/* the strike-through */}
      <span
        ref={line}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 h-[2px] origin-center -translate-y-1/2 rounded-full opacity-0"
        style={{ background: "linear-gradient(90deg, transparent, var(--sp-color) 18%, var(--sp-glow) 82%, transparent)", boxShadow: "0 0 10px 1px var(--sp-color), 0 0 22px 2px color-mix(in srgb, var(--sp-glow) 60%, transparent)" }}
      />
      <span ref={sparks} aria-hidden className="pointer-events-none absolute inset-0 z-20" />

      {items.map((it, i) => {
        const isActive = i === active;
        const body = (
          <>
            <span
              className={cn(
                "relative grid place-items-center rounded-[14px] transition-all duration-300 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[1.75]",
                it.featured ? "h-11 w-11 text-ink" : "h-9 w-9",
                isActive && !it.featured ? "text-ink" : !it.featured && "text-ink/55 group-hover:text-ink"
              )}
            >
              {it.featured && (
                <>
                  <span aria-hidden className="absolute inset-0 rounded-[14px] [background:var(--aurora)]" />
                  <span aria-hidden className="absolute -inset-1 -z-10 animate-pulseglow rounded-[18px] opacity-60 blur-md [background:var(--aurora)]" />
                </>
              )}
              <span className="relative">{it.icon}</span>
            </span>
            {!compact || it.featured ? (
              <span
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className={cn("relative whitespace-nowrap text-[11px] font-medium leading-none tracking-tight transition-colors", isActive ? "text-ink" : "text-ink/55 group-hover:text-ink")}
              >
                {it.label}
              </span>
            ) : (
              <span
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="sr-only"
              >
                {it.label}
              </span>
            )}
          </>
        );
        const cls = cn("group relative flex min-w-[52px] flex-col items-center gap-1 rounded-2xl px-1.5 pb-1.5 pt-1 outline-none transition focus-visible:ring-2 focus-visible:ring-ink/20", it.featured && "mx-1");
        const tip = it.hint ? (
          <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">{it.hint}</span>
        ) : null;
        if (it.onClick)
          return (
            <button key={it.label} type="button" onClick={it.onClick} aria-label={it.label} className={cls}>
              {body}
              {tip}
            </button>
          );
        if (it.external)
          return (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer" aria-label={it.label} className={cls}>
              {body}
              {tip}
            </a>
          );
        return (
          <Link key={it.label} href={it.href ?? "/"} aria-label={it.label} aria-current={isActive ? "page" : undefined} className={cls}>
            {body}
            {tip}
          </Link>
        );
      })}
    </nav>
  );
}
