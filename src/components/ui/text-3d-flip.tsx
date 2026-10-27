"use client";
import { cn } from "@/lib/utils";

/** Letters flip in 3D, staggered, on hover (Magic UI "Text 3D Flip"). */
export function Text3DFlip({ text, className, flipClassName }: { text: string; className?: string; flipClassName?: string }) {
  const letters = Array.from(text);
  return (
    <span className={cn("group inline-flex [perspective:700px]", className)} aria-label={text}>
      {letters.map((ch, i) => {
        const c = ch === " " ? " " : ch;
        const delay = { transitionDelay: `${i * 24}ms` };
        return (
          <span key={i} aria-hidden className="relative inline-block preserve-3d">
            <span
              style={delay}
              className="block origin-[50%_50%_-0.5em] transition-transform duration-500 ease-spring backface-hidden group-hover:[transform:rotateX(90deg)]"
            >
              {c}
            </span>
            <span
              style={delay}
              className={cn(
                "absolute inset-0 block origin-[50%_50%_-0.5em] transition-transform duration-500 ease-spring backface-hidden [transform:rotateX(-90deg)] group-hover:[transform:rotateX(0deg)]",
                flipClassName
              )}
            >
              {c}
            </span>
          </span>
        );
      })}
    </span>
  );
}
