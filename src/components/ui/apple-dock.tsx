"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DockItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  active?: boolean;
  featured?: boolean; // the AI orb
  hint?: string; // keyboard hint shown in the tooltip
};

/** macOS-style dock: icons magnify with cursor proximity. Glass, labeled, keyboard friendly. */
export function AppleDock({ items, className }: { items: DockItem[]; className?: string }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label="Main"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex items-end gap-1.5 rounded-[26px] border border-white/90 bg-white/65 px-2.5 pb-2 pt-2 backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(11,19,36,0.06),0_24px_60px_-24px_rgba(30,64,110,0.35)]",
        className
      )}
    >
      {items.map((it) => (
        <DockIcon key={it.label} mouseX={mouseX} item={it} />
      ))}
    </motion.nav>
  );
}

function DockIcon({ mouseX, item }: { mouseX: MotionValue<number>; item: DockItem }) {
  const ref = useRef<HTMLElement | null>(null);
  // Runs during render for the initial value, so it must be safe on the server.
  const distance = useTransform(mouseX, (v) => {
    if (!Number.isFinite(v) || typeof window === "undefined" || !ref.current) return Infinity;
    const b = ref.current.getBoundingClientRect();
    return v - (b.x + window.scrollX) - b.width / 2;
  });
  const base = item.featured ? 52 : 44;
  const size = useSpring(useTransform(distance, [-130, 0, 130], [base, base + 18, base]), { mass: 0.1, stiffness: 170, damping: 14 });

  const tile = (
    <span className="flex flex-col items-center gap-1">
      <motion.span
        style={{ width: size, height: size }}
        className={cn(
          "relative grid place-items-center rounded-[16px] transition-colors",
          item.featured
            ? "text-ink shadow-[0_8px_24px_-8px_rgba(13,148,136,0.55)]"
            : item.active
              ? "bg-ink text-white shadow-[0_6px_16px_-8px_rgba(11,19,36,0.6)]"
              : "border border-ink/[0.06] bg-white/90 text-ink/75 shadow-[0_1px_2px_rgba(11,19,36,0.06)] hover:text-ink"
        )}
      >
        {item.featured && <span aria-hidden className="absolute inset-0 rounded-[16px] [background:var(--aurora)]" />}
        {item.featured && <span aria-hidden className="absolute -inset-1 -z-10 rounded-[20px] opacity-60 blur-md [background:var(--aurora)] animate-pulseglow" />}
        <span className="relative grid h-full w-full place-items-center [&>svg]:h-[44%] [&>svg]:w-[44%]">{item.icon}</span>
      </motion.span>
      <span className={cn("hidden text-[10.5px] leading-none tracking-tight md:block", item.active || item.featured ? "text-ink" : "text-graphite")}>{item.label}</span>
    </span>
  );

  const tooltip = item.hint && (
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink bg-ink px-2.5 py-1 text-[11px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {item.hint}
    </span>
  );

  const common = { "aria-label": item.label, "aria-current": item.active ? ("page" as const) : undefined, className: "group relative rounded-2xl outline-none" };

  if (item.onClick)
    return (
      <button ref={(n) => { ref.current = n; }} type="button" onClick={item.onClick} {...common}>
        {tooltip}
        {tile}
      </button>
    );
  if (item.external)
    return (
      <a ref={(n) => { ref.current = n; }} href={item.href} target="_blank" rel="noreferrer" {...common}>
        {tooltip}
        {tile}
      </a>
    );
  return (
    <Link ref={(n) => { ref.current = n; }} href={item.href ?? "/"} {...common}>
      {tooltip}
      {tile}
    </Link>
  );
}
