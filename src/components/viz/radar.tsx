"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { VIZ } from "./palette";
import { cn } from "@/lib/utils";

export type RadarAxis = { label: string; value: number; target?: number; note?: string };

/**
 * Radar ("skin fingerprint"): one shape for today, optional dashed shape for the target.
 * Values are 0–100 scores. Hover an axis for its score and what it means.
 */
export function Radar({ axes, className, size = 320, showTarget = true }: { axes: RadarAxis[]; className?: string; size?: number; showTarget?: boolean }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const c = size / 2;
  const R = size / 2 - 46;
  const n = axes.length;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [c + Math.cos(a) * R * (v / 100), c + Math.sin(a) * R * (v / 100)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const hasTarget = showTarget && axes.some((a) => a.target !== undefined);

  return (
    <figure className={cn("relative", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full overflow-visible" role="img" aria-label={axes.map((a) => `${a.label} ${a.value}`).join(", ")}>
        {[25, 50, 75, 100].map((r) => (
          <polygon key={r} points={poly(axes.map(() => r))} fill="none" stroke={VIZ.grid} />
        ))}
        {axes.map((a, i) => {
          const [x, y] = pt(i, 100);
          const [lx, ly] = pt(i, 122);
          return (
            <g key={a.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} className="cursor-default">
              <line x1={c} y1={c} x2={x} y2={y} stroke={VIZ.grid} />
              <text x={lx} y={ly + 4} textAnchor={Math.abs(lx - c) < 8 ? "middle" : lx > c ? "start" : "end"} fontSize="11.5" fill={hover === i ? "#EEF2FA" : "#9AA6BC"}>
                {a.label}
              </text>
              <circle cx={x} cy={y} r="22" fill="transparent" />
            </g>
          );
        })}
        {hasTarget && <polygon points={poly(axes.map((a) => a.target ?? a.value))} fill="none" stroke={VIZ.series[2]} strokeWidth="1.5" strokeDasharray="4 4" />}
        <motion.polygon
          points={poly(axes.map((a) => a.value))}
          fill="rgba(20,168,148,0.22)"
          stroke={VIZ.series[0]}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transformOrigin: `${c}px ${c}px` }}
          initial={reduce ? false : { scale: 0.2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
        />
        {axes.map((a, i) => {
          const [x, y] = pt(i, a.value);
          return <circle key={i} cx={x} cy={y} r={hover === i ? 5 : 3.5} fill={VIZ.series[0]} stroke={VIZ.surface} strokeWidth="2" />;
        })}
      </svg>
      {hasTarget && (
        <div className="mt-2 flex justify-center gap-4 text-[12px] text-graphite">
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-4 rounded-full" style={{ background: VIZ.series[0] }} /> Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed" style={{ borderColor: VIZ.series[2] }} /> 90-day goal
          </span>
        </div>
      )}
      {hover !== null && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0B1120]/90 px-3 py-2 text-center text-[12px] backdrop-blur">
          <p className="text-graphite">{axes[hover].label}</p>
          <p className="tabular font-display text-xl font-semibold text-ink">
            {axes[hover].value}
            <span className="text-[12px] text-graphite">/100</span>
          </p>
          {axes[hover].note && <p className="mt-1 text-graphite">{axes[hover].note}</p>}
        </div>
      )}
    </figure>
  );
}
