"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Nea SI mark: a glowing core (NEA's data) held by two crossing orbits (the two engines, Xevyo and Gemini),
 * with a small satellite that pulses while SI is thinking. Drop-in for a lucide icon: size it with className.
 */
export function NeaSiIcon({ className, thinking, mono }: { className?: string; thinking?: boolean; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("h-5 w-5", className)}>
      <defs>
        <radialGradient id={`c${id}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="rgb(var(--c-accent2))" />
          <stop offset="100%" stopColor="rgb(var(--c-accent))" />
        </radialGradient>
        <linearGradient id={`o${id}`} x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(-30 12 12)" stroke={`url(#o${id})`} strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(30 12 12)" stroke={`url(#o${id})`} strokeWidth="1.4" />
      <circle cx="12" cy="12" r="3.7" fill={mono ? "currentColor" : `url(#c${id})`} />
      <circle cx="19.6" cy="6.9" r="1.35" fill="currentColor" className={thinking ? "animate-pulse" : undefined} />
    </svg>
  );
}
