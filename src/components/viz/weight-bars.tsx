"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { VIZ } from "./palette";

/** Horizontal bars, one hue (magnitude). Labels and values sit in ink, the bar carries only length. */
export function WeightBars({ items }: { items: { label: string; weight: number; note: string; region?: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="space-y-5">
      {items.map((it, i) => {
        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] text-ink">{it.label}</span>
              <span className="tabular text-[13px] text-graphite">{it.weight}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-ink/[0.07]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: VIZ.series[0] }}
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${it.weight}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-graphite">{it.note}</p>
          </>
        );
        return (
          <li key={it.label}>
            {it.region ? (
              <Link href={`/body?focus=${it.region}`} className="block rounded-xl transition hover:opacity-90" title="See it on the 3D body">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}
