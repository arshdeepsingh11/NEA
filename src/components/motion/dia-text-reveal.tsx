"use client";
import { motion, useReducedMotion } from "framer-motion";
import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Dia Text Reveal: a horizontal colour band sweeps across the text with a gradient shine,
 * then the text settles on the theme foreground colour.
 */
export function DiaTextReveal({
  children,
  as = "span",
  className,
  colors = ["rgb(var(--c-accent))", "rgb(var(--c-accent2))", "rgb(var(--c-accent3))"],
  duration = 1.6,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  colors?: string[];
  duration?: number;
  delay?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  // ink | colour band with a white shine in the middle | transparent (not yet revealed)
  const bg = `linear-gradient(90deg, rgb(var(--c-ink)) 0%, rgb(var(--c-ink)) 34%, ${colors[0]} 40%, ${colors[1]} 46%, #fff 50%, ${colors[2] ?? colors[0]} 54%, ${colors[0]} 60%, transparent 66%, transparent 100%)`;
  const M = motion[as as "span"];
  if (reduce) return createElement(as, { className }, children);
  return (
    <M
      className={cn("inline-block bg-clip-text text-transparent [-webkit-background-clip:text]", className)}
      style={{ backgroundImage: bg, backgroundSize: "300% 100%", backgroundRepeat: "no-repeat" }}
      initial={{ backgroundPosition: "100% 0%" }}
      whileInView={{ backgroundPosition: "0% 0%" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </M>
  );
}
