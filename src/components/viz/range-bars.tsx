"use client";
import { motion, useReducedMotion } from "framer-motion";
import { TriangleAlert, CircleCheck } from "lucide-react";
import { VIZ } from "./palette";
import { cn } from "@/lib/utils";

export type Marker = { name: string; value: number; unit: string; min: number; max: number; optimal: [number, number]; why?: string };

/** Biomarker bars: the shaded band is the optimal range, the dot is the value. Status always has an icon + word. */
export function RangeBars({ markers, className }: { markers: Marker[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <ul className={cn("space-y-5", className)}>
      {markers.map((m, i) => {
        const pct = (v: number) => Math.max(0, Math.min(100, ((v - m.min) / (m.max - m.min)) * 100));
        const ok = m.value >= m.optimal[0] && m.value <= m.optimal[1];
        return (
          <li key={m.name} title={m.why}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-[14px] text-ink">{m.name}</span>
              <span className="flex items-center gap-2 text-[13px]">
                <span className="tabular font-medium text-ink">
                  {m.value}
                  <span className="text-graphite"> {m.unit}</span>
                </span>
                <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", ok ? "bg-[rgb(var(--viz-good)/0.12)] text-[rgb(var(--viz-good))]" : "bg-[rgb(var(--viz-watch)/0.12)] text-[rgb(var(--viz-watch))]")}>
                  {ok ? <CircleCheck className="h-3 w-3" /> : <TriangleAlert className="h-3 w-3" />}
                  {ok ? "Optimal" : "Watch"}
                </span>
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-ink/[0.07]">
              <div className="absolute inset-y-0 rounded-full bg-ink/[0.06]" style={{ left: `${pct(m.optimal[0])}%`, width: `${pct(m.optimal[1]) - pct(m.optimal[0])}%` }} />
              <motion.span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ background: ok ? VIZ.good : VIZ.watch, borderColor: VIZ.surface }}
                initial={reduce ? false : { left: "0%" }}
                whileInView={{ left: `${pct(m.value)}%` }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 60, damping: 14, delay: i * 0.08 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-graphite/80">
              <span className="tabular">{m.min}</span>
              <span>
                optimal {m.optimal[0]}–{m.optimal[1]}
              </span>
              <span className="tabular">{m.max}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
