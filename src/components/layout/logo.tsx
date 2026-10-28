import Link from "next/link";
import { NeaLogo } from "@/components/brand/nea-logo";
import { cn } from "@/lib/utils";

/** NEA logo as a home link. */
export function Logo({ className, animate = false }: { className?: string; light?: boolean; animate?: boolean }) {
  return (
    <Link href="/" aria-label="NEA Precision Skin home" className={cn("inline-block text-ink", className)}>
      <NeaLogo className="h-full w-auto" animate={animate} />
    </Link>
  );
}
