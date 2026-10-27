"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DockItem = { label: string; href: string; icon: ReactNode; external?: boolean; active?: boolean };

/** macOS-style dock: icons magnify with cursor proximity (Magic UI "Dock"). */
export function AppleDock({ items, className }: { items: DockItem[]; className?: string }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label="Quick actions"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("flex h-[64px] items-end gap-2.5 rounded-[22px] px-3 pb-2.5", "border border-white/50 bg-white/65 shadow-[0_18px_50px_-20px_rgba(21,25,28,0.45)] backdrop-blur-2xl", className)}
    >
      {items.map((it) => (
        <DockIcon key={it.label} mouseX={mouseX} item={it} />
      ))}
    </motion.nav>
  );
}

function DockIcon({ mouseX, item }: { mouseX: MotionValue<number>; item: DockItem }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Runs during render for the initial value, so it must be safe on the server.
  const distance = useTransform(mouseX, (v) => {
    if (!Number.isFinite(v) || typeof window === "undefined" || !ref.current) return Infinity;
    const b = ref.current.getBoundingClientRect();
    return v - (b.x + window.scrollX) - b.width / 2;
  });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [42, 66, 42]), { mass: 0.1, stiffness: 160, damping: 13 });
  const inner = (
    <motion.span style={{ width: size, height: size }} className="relative grid place-items-center rounded-[14px] bg-gradient-to-b from-white to-mist text-ink shadow-[inset_0_1px_0_white,0_6px_14px_-6px_rgba(21,25,28,0.35)]">
      <span className="[&>svg]:h-[46%] [&>svg]:w-[46%] grid h-full w-full place-items-center">{item.icon}</span>
      {item.active && <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-ink/70" />}
    </motion.span>
  );
  return (
    <Link
      ref={ref}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className="group relative"
      aria-label={item.label}
    >
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {item.label}
      </span>
      {inner}
    </Link>
  );
}
