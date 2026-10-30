"use client";
import { AnimatePresence, motion } from "framer-motion";
import { NeaImage } from "@/components/ui/nea-image";
import { cn } from "@/lib/utils";

export type HoloSpot = { id: string; x: number; y: number; label: string; color?: string };

const GOLD = "#f3d9a4";
// centre a 260%-wide radial mask on a point given in % of the box
const mp = (s?: { x: number; y: number }) => (s ? `${((130 - s.x) / 160) * 100}% ${((130 - s.y) / 160) * 100}%` : "50% 50%");

/**
 * An aesthetic "hologram": a real, smiling person photographed in clothes, with a soft holographic scan layered on top.
 * Glowing points sit on the face and body; the chosen one gets a turning halo, a light sweep and a label.
 * Points are % positions on the photo, so keep the box the same shape as the photo (set `aspect`).
 */
export function HoloPortrait({
  src,
  alt,
  spots,
  selected,
  onSelect,
  aspect,
  position = "50% 50%",
  className,
  badge,
}: {
  src: string;
  alt: string;
  spots: HoloSpot[];
  selected?: string;
  onSelect?: (id: string) => void;
  aspect: string;
  position?: string;
  className?: string;
  badge?: string;
}) {
  const cur = spots.find((s) => s.id === selected);
  const color = cur?.color ?? GOLD;
  return (
    <div className={cn("relative overflow-hidden rounded-[36px] bg-[#1b1512] shadow-[0_50px_120px_-50px_rgba(var(--shadow-tint),0.8)]", className)} style={{ aspectRatio: aspect }}>
      <NeaImage src={src} alt={alt} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" style={{ objectPosition: position }} />
      {/* warm, cinematic grade so every photo sits in NEA's palette */}
      <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(160deg, rgba(243,217,164,0.55), transparent 50%, rgba(212,138,138,0.45))" }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      {/* holographic grid that gathers around the chosen point */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-60"
        animate={{ maskPosition: mp(cur), WebkitMaskPosition: mp(cur) }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(circle, black 0, transparent 22%)",
          WebkitMaskImage: "radial-gradient(circle, black 0, transparent 22%)",
          maskSize: "260% 260%",
          WebkitMaskSize: "260% 260%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />

      {/* light sweep travelling to the chosen point */}
      {cur && (
        <motion.div aria-hidden className="absolute inset-x-0 h-px" initial={false} animate={{ top: `${cur.y}%` }} transition={{ type: "spring", stiffness: 70, damping: 16 }} style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 22px 4px ${color}66` }} />
      )}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[22%] animate-[heroscan_6s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-b from-transparent via-white/15 to-transparent" />

      {/* points */}
      {spots.map((s) => {
        const on = s.id === selected;
        return (
          <button
            key={s.id}
            onClick={() => onSelect?.(s.id)}
            aria-label={s.label}
            aria-pressed={on}
            className="group absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span className="absolute h-3 w-3 animate-ping rounded-full opacity-40" style={{ background: s.color ?? GOLD, animationDuration: "2.4s" }} />
            <span className="relative h-2.5 w-2.5 rounded-full border border-white/90 transition group-hover:scale-125" style={{ background: s.color ?? GOLD, boxShadow: `0 0 12px 2px ${(s.color ?? GOLD)}aa` }} />
            {on && (
              <motion.svg layoutId="holo-halo" viewBox="0 0 60 60" className="pointer-events-none absolute h-16 w-16" transition={{ type: "spring", stiffness: 120, damping: 18 }}>
                <circle cx="30" cy="30" r="26" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1" strokeDasharray="4 6" className="origin-center animate-[spin_9s_linear_infinite]" />
                <circle cx="30" cy="30" r="18" fill="none" stroke={s.color ?? GOLD} strokeWidth="1.5" />
              </motion.svg>
            )}
          </button>
        );
      })}

      {/* the chosen point's label */}
      <AnimatePresence mode="wait">
        {cur && (
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, x: cur.x > 55 ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute flex items-center gap-2"
            style={{ top: `${cur.y}%`, ...(cur.x > 55 ? { right: `${100 - cur.x + 5}%`, flexDirection: "row-reverse" } : { left: `${cur.x + 5}%` }), transform: "translateY(-50%)" }}
          >
            <span className="h-px w-8" style={{ background: `linear-gradient(${cur.x > 55 ? "270deg" : "90deg"}, ${color}, transparent)` }} />
            <span className="whitespace-nowrap rounded-full border border-white/40 bg-black/45 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">{cur.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={cn("pointer-events-none absolute h-6 w-6 rounded-[3px] border-white/60", c)} />
      ))}
      {badge && (
        <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11.5px] text-white backdrop-blur-md">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: GOLD }} />
          {badge}
        </span>
      )}
    </div>
  );
}
