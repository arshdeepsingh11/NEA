"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/content/nav";

/** Pill navigation: a highlight glides and resizes to the hovered or active item (DOM math). */
export function PillNav({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const activeIndex = items.findIndex((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  const moveTo = (el: HTMLElement | null) => {
    const list = listRef.current;
    if (!el || !list) return setPill((p) => ({ ...p, opacity: 0 }));
    const a = el.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    setPill({ left: a.left - b.left, width: a.width, opacity: 1 });
  };

  const resetToActive = () => {
    const el = activeIndex >= 0 ? (listRef.current?.children[activeIndex + 1] as HTMLElement | undefined) : undefined;
    moveTo(el ?? null);
  };

  useLayoutEffect(() => {
    resetToActive();
    const onResize = () => resetToActive();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <ul ref={listRef} onMouseLeave={resetToActive} className={cn("relative flex items-center rounded-full p-1", className)}>
      <li
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-ink/[0.07] transition-[left,width,opacity] duration-500 ease-spring"
        style={{ left: pill.left, width: pill.width, opacity: pill.opacity }}
      />
      {items.map((it, i) => (
        <li key={it.href} onMouseEnter={(e) => moveTo(e.currentTarget)} onFocus={(e) => moveTo(e.currentTarget)}>
          <Link
            href={it.href}
            aria-current={i === activeIndex ? "page" : undefined}
            className={cn("relative z-10 block rounded-full px-4 py-2 text-[14px] transition-colors", i === activeIndex ? "text-ink" : "text-graphite hover:text-ink")}
          >
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
