"use client";
import { motion, useReducedMotion } from "framer-motion";
import { VIZ } from "./palette";

/** Tiny trend line for stat tiles. Decorative only: the number beside it carries the meaning. */
export function Sparkline({ values, color = VIZ.series[0], width = 96, height = 28, className }: { values: number[]; color?: string; width?: number; height?: number; className?: string }) {
  const reduce = useReducedMotion();
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 3 - ((v - lo) / (hi - lo || 1)) * (height - 6)] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden>
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}
