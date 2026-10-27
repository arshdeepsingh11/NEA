"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Children, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Reveals items one by one, newest on top (Magic UI "Animated List"). */
export function AnimatedList({ children, className, delay = 1400, loop = true }: { children: ReactNode; className?: string; delay?: number; loop?: boolean }) {
  const items = useMemo(() => Children.toArray(children) as ReactElement[], [children]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      if (count < items.length) setCount((c) => c + 1);
      else if (loop) setCount(1);
    }, count < items.length ? delay : delay * 3);
    return () => clearTimeout(id);
  }, [count, items.length, delay, loop]);

  const visible = items.slice(0, count).reverse();
  return (
    <div className={cn("flex flex-col items-stretch gap-3", className)}>
      <AnimatePresence initial={false}>
        {visible.map((item) => (
          <motion.div
            key={item.key}
            layout
            initial={{ scale: 0.92, opacity: 0, y: -12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
