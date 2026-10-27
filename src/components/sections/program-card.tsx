import Link from "next/link";
import { NeaImage } from "@/components/ui/nea-image";
import type { Program } from "@/content/programs";
import { cn, money } from "@/lib/utils";

const accent: Record<Program["accent"], string> = {
  flora: "from-flora/90",
  dermis: "from-dermis-deep/90",
  lumen: "from-lumen/90",
  ink: "from-abyss/90",
};

export function ProgramCard({ p, className }: { p: Program; className?: string }) {
  return (
    <Link href={`/programs/${p.slug}`} className={cn("group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-4xl surface-strong text-white", className)}>
      <NeaImage src={p.image} alt="" fill sizes="(max-width: 768px) 82vw, 380px" className="object-cover transition-transform duration-[1.2s] ease-spring group-hover:scale-105" />
      <div className={cn("absolute inset-0 bg-gradient-to-t via-black/20 to-transparent", accent[p.accent])} />
      <div className="relative p-7">
        <p className="text-[14px] text-white/75">{p.problem}</p>
        <h3 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">{p.name}</h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/80">{p.headline} {p.forWho}</p>
        <p className="mt-5 flex items-baseline gap-2 text-[15px]">
          <span className="text-white/65">From</span>
          <span className="font-semibold">{money(p.priceFrom)}</span>
          <span className="text-white/65">· {p.duration}</span>
        </p>
      </div>
    </Link>
  );
}
