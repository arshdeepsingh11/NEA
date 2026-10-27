"use client";
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
  colors?: string[];
  radius?: number;
};

/** Animated gradient border (Magic UI "Shine Border"). */
export function ShineBorder({ children, className, borderWidth = 1.5, duration = 12, colors = ["rgb(var(--c-accent))", "rgb(var(--c-warm))", "rgb(var(--c-accent2))"], radius = 28 }: Props) {
  return (
    <div className={cn("relative rounded-[var(--r)]", className)} style={{ "--r": `${radius}px` } as CSSProperties}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[var(--r)] animate-shine"
        style={
          {
            "--shine-duration": `${duration}s`,
            padding: borderWidth,
            backgroundImage: `radial-gradient(transparent, transparent, ${colors.join(",")}, transparent, transparent)`,
            backgroundSize: "300% 300%",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          } as CSSProperties
        }
      />
      {children}
    </div>
  );
}
