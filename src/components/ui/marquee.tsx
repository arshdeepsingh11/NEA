import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

/** Seamless CSS marquee (Magic UI "Marquee"). Pauses on hover. */
export function Marquee({ children, className, reverse, vertical, duration = 40, gap = "1rem", repeat = 3 }: { children: ReactNode; className?: string; reverse?: boolean; vertical?: boolean; duration?: number; gap?: string; repeat?: number }) {
  return (
    <div
      className={cn("group flex overflow-hidden [gap:var(--gap)]", vertical ? "flex-col" : "flex-row", className)}
      style={{ "--duration": `${duration}s`, "--gap": gap } as CSSProperties}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)] group-hover:[animation-play-state:paused]",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
