"use client";
import { motion, useReducedMotion } from "framer-motion";
import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial headline reveal: each word rises out of its own mask, line by line.
 * Text syntax: "\n" breaks a line, *word* is set in the italic serif accent.
 *   <SplitReveal as="h1" text={"Healthy skin\nstarts *inside.*"} />
 */
export function SplitReveal({
  text,
  as = "h2",
  className,
  emClassName = "aurora-text italic",
  delay = 0,
  stagger = 0.06,
  once = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  emClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  let i = 0;
  const content: ReactNode[] = lines.map((line, li) => (
    <span key={li} className="block">
      {line
        .split(" ")
        .filter(Boolean)
        .map((raw, wi) => {
          const em = /^\*.*\*[.,!?]?$/.test(raw);
          const word = em ? raw.replace(/\*/g, "") : raw;
          const d = delay + i++ * stagger;
          return (
            <span key={wi} className="inline-block overflow-hidden pb-[0.12em] align-bottom [margin-bottom:-0.12em]">
              <motion.span
                className={cn("inline-block will-change-transform", em && emClassName)}
                initial={reduce ? false : { y: "105%", opacity: 0 }}
                whileInView={{ y: "0%", opacity: 1 }}
                viewport={{ once, margin: "-40px" }}
                transition={{ duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
              {" "}
            </span>
          );
        })}
    </span>
  ));
  return createElement(as, { className, "aria-label": text.replace(/\*/g, "").replace(/\n/g, " ") }, <span aria-hidden>{content}</span>);
}
