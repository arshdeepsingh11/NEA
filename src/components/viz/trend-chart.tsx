"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { VIZ } from "./palette";
import { cn } from "@/lib/utils";

export type TrendSeries = { name: string; values: number[]; color?: string };

/**
 * Line chart with an optional "projected" tail (dashed after `projectFrom`),
 * a crosshair tooltip, a legend for 2+ series and a direct label at the line end.
 */
export function TrendChart({
  series,
  labels,
  unit = "",
  min,
  max,
  projectFrom,
  height = 220,
  className,
  area = true,
  caption,
}: {
  series: TrendSeries[];
  labels: string[];
  unit?: string;
  min?: number;
  max?: number;
  projectFrom?: number;
  height?: number;
  className?: string;
  area?: boolean;
  caption?: string;
}) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLElement>(null);
  // Draw in real pixels so text and strokes keep their size at any width.
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = height;
  const pad = { l: 36, r: W < 480 ? 64 : 150, t: 14, b: 26 };
  const all = series.flatMap((s) => s.values);
  const lo = min ?? Math.floor(Math.min(...all) * 0.9);
  const hi = max ?? Math.ceil(Math.max(...all) * 1.05);
  const n = labels.length;
  const x = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const ticks = useMemo(() => [0, 0.5, 1].map((t) => Math.round(lo + (hi - lo) * t)), [lo, hi]);

  const path = (vals: number[], from = 0, to = vals.length - 1) =>
    vals
      .slice(from, to + 1)
      .map((v, k) => `${k ? "L" : "M"}${x(from + k).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <figure ref={box} className={cn("relative", className)}>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4 text-[12px] text-graphite">
          {series.map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full" style={{ background: s.color ?? VIZ.series[si] }} />
              {s.name}
            </span>
          ))}
          {projectFrom !== undefined && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-white/50" /> Projected
            </span>
          )}
        </div>
      )}
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none overflow-visible"
        role="img"
        aria-label={caption ?? series.map((s) => s.name).join(", ")}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`${id}-g${si}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color ?? VIZ.series[si]} stopOpacity="0.28" />
              <stop offset="1" stopColor={s.color ?? VIZ.series[si]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={VIZ.grid} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={VIZ.axis} className="tabular">
              {t}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % Math.ceil(n / 6) === 0 || i === n - 1 ? (
            <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill={VIZ.axis}>
              {l}
            </text>
          ) : null,
        )}
        {projectFrom !== undefined && (
          <rect x={x(projectFrom)} y={pad.t} width={W - pad.r - x(projectFrom)} height={H - pad.t - pad.b} fill="rgba(255,255,255,0.025)" />
        )}
        {series.map((s, si) => {
          const c = s.color ?? VIZ.series[si];
          const last = s.values.length - 1;
          const solidTo = projectFrom ?? last;
          return (
            <g key={s.name}>
              {area && si === 0 && (
                <motion.path
                  d={`${path(s.values)} L${x(last)},${y(lo)} L${x(0)},${y(lo)} Z`}
                  fill={`url(#${id}-g${si})`}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                />
              )}
              <motion.path
                d={path(s.values, 0, solidTo)}
                fill="none"
                stroke={c}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
              {projectFrom !== undefined && solidTo < last && (
                <motion.path
                  d={path(s.values, solidTo, last)}
                  fill="none"
                  stroke={c}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 0.85 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                />
              )}
              <circle cx={x(last)} cy={y(s.values[last])} r="4" fill={c} stroke={VIZ.surface} strokeWidth="2" />
              <text x={x(last) + 10} y={y(s.values[last]) + 4} fontSize="12" fill="#EEF2FA" className="tabular">
                {s.values[last]}
                {unit} <tspan fill="#9AA6BC">{series.length > 1 ? s.name : ""}</tspan>
              </text>
            </g>
          );
        })}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.25)" />
            {series.map((s, si) => (
              <circle key={si} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill={s.color ?? VIZ.series[si]} stroke={VIZ.surface} strokeWidth="2" />
            ))}
          </g>
        )}
        <rect x={pad.l} y={0} width={W - pad.l - pad.r} height={H} fill="transparent" />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-6 z-10 rounded-xl border border-white/10 bg-[#0B1120]/90 px-3 py-2 text-[12px] shadow-xl backdrop-blur"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "-110%" : "10%"})` }}
        >
          <p className="mb-1 text-graphite">
            {labels[hover]}
            {projectFrom !== undefined && hover > projectFrom ? " · projected" : ""}
          </p>
          {series.map((s, si) => (
            <p key={s.name} className="flex items-center gap-2 text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color ?? VIZ.series[si] }} />
              <span className="tabular font-medium">
                {s.values[hover]}
                {unit}
              </span>
              <span className="text-graphite">{s.name}</span>
            </p>
          ))}
        </div>
      )}
      {caption && <figcaption className="mt-2 text-[12px] text-graphite">{caption}</figcaption>}
    </figure>
  );
}
