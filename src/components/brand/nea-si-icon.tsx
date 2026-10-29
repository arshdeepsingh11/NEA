"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Nea SI mark: a soft, glossy four-point glow (the "glow" NEA gives skin) in champagne-to-rose,
 * with a small twinkle beside it. While SI is thinking the glow breathes and the twinkle sparkles.
 * Drop-in for a lucide icon: size it with className.
 */
export function NeaSiIcon({ className, thinking, mono }: { className?: string; thinking?: boolean; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  const fill = mono ? "currentColor" : `url(#g${id})`;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("h-5 w-5 overflow-visible", className)}>
      <defs>
        <linearGradient id={`g${id}`} x1="3" y1="4" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f3d9a4" />
          <stop offset="48%" stopColor="#d58f63" />
          <stop offset="100%" stopColor="#b5566f" />
        </linearGradient>
        <radialGradient id={`h${id}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8.6 10.2) rotate(40) scale(4.2 2.6)">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={thinking ? "origin-[10.5px_13.5px] animate-[siBreath_1.6s_ease-in-out_infinite]" : undefined}>
        <path d="M10.5 4.5C11.3 9.4 12.6 11.9 19.5 13.5C12.6 15.1 11.3 17.6 10.5 22.5C9.7 17.6 8.4 15.1 1.5 13.5C8.4 11.9 9.7 9.4 10.5 4.5Z" fill={fill} />
        {!mono && <path d="M10.5 4.5C11.3 9.4 12.6 11.9 19.5 13.5C12.6 15.1 11.3 17.6 10.5 22.5C9.7 17.6 8.4 15.1 1.5 13.5C8.4 11.9 9.7 9.4 10.5 4.5Z" fill={`url(#h${id})`} />}
      </g>
      <path
        d="M19 1.5C19.35 3.85 20.15 4.65 22.5 5C20.15 5.35 19.35 6.15 19 8.5C18.65 6.15 17.85 5.35 15.5 5C17.85 4.65 18.65 3.85 19 1.5Z"
        fill={fill}
        className={thinking ? "origin-[19px_5px] animate-[siTwinkle_1.2s_ease-in-out_infinite]" : undefined}
      />
    </svg>
  );
}
