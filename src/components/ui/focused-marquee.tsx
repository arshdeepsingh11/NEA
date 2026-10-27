"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeIcon = { label: string; href: string; icon: ReactNode; tint: string };

/**
 * Focused 3D Marquee — physical app-style icons glide past a central lens.
 * Icons near the centre scale up, face forward and sharpen; edges tilt away.
 * Hovering slows the stream so the focused icon can be read and clicked.
 */
export function FocusedMarquee({ items, className, speed = 38, tile = 104, gap = 34 }: { items: MarqueeIcon[]; className?: string; speed?: number; tile?: number; gap?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLAnchorElement | null)[]>([]);
  const label = useRef<HTMLDivElement>(null);
  const state = useRef({ offset: 0, v: speed, target: speed, last: 0, focused: -1 });

  // Repeat the list so the track is always wider than the viewport.
  const loop = useMemo(() => [...items, ...items, ...items], [items]);
  const step = tile + gap;
  const total = loop.length * step;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const s = state.current;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const el = wrap.current;
      if (!el) return;
      const dt = s.last ? Math.min((t - s.last) / 1000, 0.05) : 0;
      s.last = t;
      s.v += (s.target - s.v) * Math.min(1, dt * 4);
      if (!reduce) s.offset = (s.offset + s.v * dt) % total;
      const w = el.clientWidth;
      const cx = w / 2;
      let best = Infinity;
      let bestI = -1;
      for (let i = 0; i < loop.length; i++) {
        const node = tiles.current[i];
        if (!node) continue;
        let x = i * step - s.offset;
        x = ((x % total) + total) % total;
        x -= (total - w) / 2;
        const center = x + tile / 2;
        const d = (center - cx) / (w / 2); // -1 .. 1 across the viewport
        const ad = Math.min(Math.abs(d), 1.4);
        const focus = Math.max(0, 1 - ad * 1.6);
        const scale = 0.78 + focus * focus * 0.62;
        const rot = Math.max(-58, Math.min(58, -d * 46));
        const z = focus * 120 - ad * 60;
        node.style.transform = `translate3d(${x}px,-50%,${z}px) rotateY(${rot}deg) scale(${scale})`;
        node.style.opacity = String(Math.max(0, 1 - Math.max(0, ad - 0.75) * 1.8));
        node.style.filter = focus > 0.55 ? "none" : `blur(${(0.55 - focus) * 2.2}px) saturate(${0.75 + focus * 0.5})`;
        node.style.zIndex = String(Math.round(focus * 100));
        if (Math.abs(center - cx) < best) {
          best = Math.abs(center - cx);
          bestI = i;
        }
      }
      if (bestI !== s.focused && label.current) {
        s.focused = bestI;
        label.current.textContent = loop[bestI]?.label ?? "";
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [loop, step, total, tile]);

  const slow = () => (state.current.target = speed * 0.12);
  const fast = () => (state.current.target = speed);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={wrap}
        onMouseEnter={slow}
        onMouseLeave={fast}
        onFocus={slow}
        onBlur={fast}
        className="relative h-[230px] overflow-hidden [perspective:1100px] mask-fade-x"
      >
        {/* the lens */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[176px] w-[176px] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border border-white/70 bg-white/30 shadow-[0_30px_80px_-30px_rgba(47,125,109,0.55)] backdrop-blur-[2px]" />
        <div className="absolute inset-0 preserve-3d">
          {loop.map((it, i) => (
            <Link
              key={i}
              href={it.href}
              ref={(n) => {
                tiles.current[i] = n;
              }}
              tabIndex={i < items.length || i >= items.length * 2 ? -1 : 0}
              aria-label={it.label}
              className="absolute left-0 top-1/2 will-change-transform"
              style={{ width: tile, height: tile }}
            >
              <span
                className="relative grid h-full w-full place-items-center rounded-[28%] text-white shadow-[0_22px_30px_-18px_rgba(21,25,28,0.6),inset_0_1.5px_0_rgba(255,255,255,0.55),inset_0_-6px_14px_rgba(0,0,0,0.18)]"
                style={{ background: it.tint }}
              >
                <span className="absolute inset-x-[12%] top-[6%] h-[38%] rounded-[40%] bg-gradient-to-b from-white/45 to-transparent" />
                <span className="relative [&>svg]:h-11 [&>svg]:w-11 [&>svg]:drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">{it.icon}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div ref={label} aria-live="polite" className="mt-2 text-center font-display text-lg font-medium tracking-tight text-ink" />
    </div>
  );
}
