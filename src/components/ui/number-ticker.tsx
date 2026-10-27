"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { value: number; from?: number; decimals?: number; prefix?: string; suffix?: string; className?: string; delay?: number };

/** Counts up to a target when it scrolls into view (Magic UI "Number Ticker"). */
export function NumberTicker({ value, from = 0, decimals = 0, prefix = "", suffix = "", className, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { damping: 60, stiffness: 120 });
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => mv.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, value, delay, mv]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current)
          ref.current.textContent =
            prefix + Intl.NumberFormat("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(v.toFixed(decimals))) + suffix;
      }),
    [spring, decimals, prefix, suffix]
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {prefix}
      {from}
      {suffix}
    </span>
  );
}
