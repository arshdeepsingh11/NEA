"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The NEA mark, redrawn as a vector from the original logo (geometric "nEA" + "PRECISION SKIN").
 * Premium details: theme gradient strokes, a soft inner glow, a light sweep across the letters,
 * and an optional one-time draw-in when it first appears.
 */
export function NeaLogo({ className, showWordmark = true, animate = true, mono }: { className?: string; showWordmark?: boolean; animate?: boolean; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  const h = showWordmark ? 256 : 204;
  return (
    <svg viewBox={`0 0 700 ${h}`} className={cn("block", className)} role="img" aria-label="NEA Precision Skin">
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="700" y2="200">
          <stop offset="0" stopColor={mono ? "currentColor" : "rgb(var(--logo-a, 20 120 120))"} />
          <stop offset="0.55" stopColor={mono ? "currentColor" : "rgb(var(--logo-b, 28 150 140))"} />
          <stop offset="1" stopColor={mono ? "currentColor" : "rgb(var(--logo-c, 60 90 170))"} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}f`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id={`${id}m`}>
          <g fill="none" stroke="#fff" strokeWidth="26" strokeLinejoin="round">
            <Letters />
          </g>
        </mask>
      </defs>

      {/* letters */}
      <g fill="none" stroke={`url(#${id}g)`} strokeWidth="26" strokeLinejoin="round" filter={mono ? undefined : `url(#${id}f)`} className={cn(animate && "nea-logo-draw")}>
        <Letters />
      </g>
      {/* thin highlight line inside each stroke, like the outlined original */}
      {!mono && (
        <g fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinejoin="round">
          <Letters />
        </g>
      )}
      {/* light sweep */}
      {!mono && (
        <g mask={`url(#${id}m)`}>
          <rect className={cn(animate && "nea-logo-sweep")} x="-260" y="0" width="200" height="200" fill={`url(#${id}s)`} transform="skewX(-20)" />
        </g>
      )}
      {showWordmark && (
        <text x="350" y="250" textAnchor="middle" fill="currentColor" style={{ font: "600 44px var(--font-sans), system-ui, sans-serif", letterSpacing: "0.32em" }}>
          PRECISION SKIN
        </text>
      )}
    </svg>
  );
}

function Letters() {
  return (
    <>
      {/* n */}
      <path pathLength={1} d="M22 186 V62 H150 a38 38 0 0 1 38 38 V186" />
      {/* E */}
      <path pathLength={1} d="M428 62 H284 a38 38 0 0 0 -38 38 V148 a38 38 0 0 0 38 38 H428" />
      <path pathLength={1} d="M272 124 H428" />
      {/* A */}
      <path pathLength={1} d="M452 186 L548 30 a14 14 0 0 1 24 0 L670 186" />
      <path pathLength={1} d="M498 120 H622" />
    </>
  );
}

/** Compact square mark (just the letters) for the nav and favicons. */
export function NeaMark({ className }: { className?: string }) {
  return <NeaLogo className={className} showWordmark={false} animate={false} />;
}
