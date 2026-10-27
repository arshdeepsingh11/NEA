import Link from "next/link";
import { cn } from "@/lib/utils";

/** NEA wordmark: three letters and a quiet dot, the "inside" of the brand. */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="NEA Precision Skin home" className={cn("group inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-display text-[22px] font-bold tracking-[-0.04em]", light ? "text-white" : "text-ink")}>
        nea
        <span className="ml-[1px] inline-block h-[7px] w-[7px] rounded-full bg-flora transition-transform duration-500 ease-spring group-hover:scale-150" />
      </span>
      <span className={cn("hidden text-[12px] tracking-[-0.01em] sm:inline", light ? "text-white/60" : "text-graphite")}>Precision Skin</span>
    </Link>
  );
}
