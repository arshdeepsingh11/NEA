"use client";
import { cn } from "@/lib/utils";

type Props = { value: number; max?: number; size?: number; stroke?: number; label?: string; color?: string; track?: string; className?: string };

/** Animated circular gauge (Magic UI "Animated Circular Progress Bar"). */
export function CircularProgress({ value, max = 100, size = 120, stroke = 9, label, color = "#2F7D6D", track = "rgba(21,25,28,0.08)", className }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.32,0.72,0,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-semibold tabular-nums">{Math.round(value)}</div>
        {label && <div className="text-[11px] text-current/60">{label}</div>}
      </div>
    </div>
  );
}
