"use client";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ScanLine } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { cn } from "@/lib/utils";

export type HoloSpot = { id: string; x: number; y: number; label: string; color?: string };

const GOLD = "#f3d9a4";
// centre a 260%-wide radial mask on a point given in % of the box
const mp = (s?: { x: number; y: number }) => (s ? `${((130 - s.x) / 160) * 100}% ${((130 - s.y) / 160) * 100}%` : "50% 50%");

/**
 * An aesthetic hologram of a real, smiling person in clothes, built to be explored:
 * - The portrait tilts in 3D under your pointer, with the scan points floating above it.
 * - X-ray lens: switch it on and a lens follows your pointer (or your finger), showing the "inside" of the same person.
 * - Glowing points on the face and body; tap one to open that part (the parent shows the opened layers via `children`).
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
  children,
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
  /** anything to float over the portrait, e.g. the opened part */
  children?: ReactNode;
}) {
  const cur = spots.find((s) => s.id === selected);
  const color = cur?.color ?? GOLD;
  const box = useRef<HTMLDivElement>(null);
  const [xray, setXray] = useState(false);

  // 3D tilt and the lens position follow the pointer
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 120, damping: 18 });
  const lx = useSpring(useTransform(px, (v) => v * 100), { stiffness: 260, damping: 28 });
  const ly = useSpring(useTransform(py, (v) => v * 100), { stiffness: 260, damping: 28 });
  const lens = useTransform([lx, ly], ([a, b]: number[]) => `circle(17% at ${a}% ${b}%)`);
  const ringX = useTransform(lx, (v) => `${v}%`);
  const ringY = useTransform(ly, (v) => `${v}%`);
  const move = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const toggleXray = () => {
    setXray((v) => !v);
    if (cur) {
      px.set(cur.x / 100);
      py.set(cur.y / 100);
    }
  };
  const pick = (s: HoloSpot) => {
    onSelect?.(s.id);
    if (xray) {
      px.set(s.x / 100);
      py.set(s.y / 100);
    }
  };

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: aspect, perspective: 1400 }}>
      <motion.div
        ref={box}
        onPointerMove={move}
        onPointerLeave={() => !xray && (px.set(0.5), py.set(0.5))}
        className="relative h-full w-full touch-pan-y overflow-hidden rounded-[36px] bg-[#1b1512] shadow-[0_50px_120px_-50px_rgba(var(--shadow-tint),0.8)]"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        <NeaImage src={src} alt={alt} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" style={{ objectPosition: position }} />
        {/* warm, cinematic grade so every photo sits in NEA's palette */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(160deg, rgba(243,217,164,0.55), transparent 50%, rgba(212,138,138,0.45))" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        {/* X-ray: the inside of the same person, seen through a lens */}
        <AnimatePresence>
          {xray && (
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ clipPath: lens }}>
              <NeaImage src={src} alt="" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" style={{ objectPosition: position, filter: "grayscale(1) invert(1) contrast(1.35) brightness(0.95)" }} />
              <div className="absolute inset-0 mix-blend-color" style={{ background: "linear-gradient(160deg, #6fd3ff, #c58bff)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(170,230,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(170,230,255,0.25) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              {/* every system glows inside the lens */}
              {spots.map((s) => (
                <span key={s.id} className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${s.x}%`, top: `${s.y}%`, background: `radial-gradient(circle, ${s.color ?? GOLD} 0 18%, transparent 65%)`, boxShadow: `0 0 30px 6px ${(s.color ?? GOLD)}55` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {xray && (
          <motion.span aria-hidden className="pointer-events-none absolute aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#aee6ff]/80 shadow-[0_0_30px_rgba(120,210,255,0.6),inset_0_0_30px_rgba(120,210,255,0.35)]" style={{ left: ringX, top: ringY }}>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] text-[#aee6ff]">X-ray</span>
          </motion.span>
        )}

        {/* holographic grid that gathers around the chosen point */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
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
        {cur && <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 h-px" initial={false} animate={{ top: `${cur.y}%` }} transition={{ type: "spring", stiffness: 70, damping: 16 }} style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 22px 4px ${color}66` }} />}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[22%] animate-[heroscan_6s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-b from-transparent via-white/15 to-transparent" />

        {/* points float above the photo */}
        <div className="pointer-events-none absolute inset-0">
          {spots.map((s) => {
            const on = s.id === selected;
            return (
              <button key={s.id} onClick={() => pick(s)} aria-label={`Open ${s.label}`} aria-pressed={on} className="group pointer-events-auto absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                <span className="absolute h-3 w-3 animate-ping rounded-full opacity-40" style={{ background: s.color ?? GOLD, animationDuration: "2.4s" }} />
                <span className="relative h-2.5 w-2.5 rounded-full border border-white/90 transition group-hover:scale-150" style={{ background: s.color ?? GOLD, boxShadow: `0 0 12px 2px ${(s.color ?? GOLD)}aa` }} />
                {on && (
                  <motion.svg layoutId={`halo-${alt}`} viewBox="0 0 60 60" className="pointer-events-none absolute h-16 w-16" transition={{ type: "spring", stiffness: 120, damping: 18 }}>
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
                initial={{ opacity: 0, x: cur.x >= 50 ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute flex items-center gap-2"
                style={{ top: `${cur.y}%`, ...(cur.x >= 50 ? { right: `${100 - cur.x + 5}%`, flexDirection: "row-reverse" } : { left: `${cur.x + 5}%` }), transform: "translateY(-50%)" }}
              >
                <span className="h-px w-8" style={{ background: `linear-gradient(${cur.x >= 50 ? "270deg" : "90deg"}, ${color}, transparent)` }} />
                <span className="whitespace-nowrap rounded-full border border-white/40 bg-black/45 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">{cur.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD */}
        {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
          <span key={c} aria-hidden className={cn("pointer-events-none absolute h-6 w-6 rounded-[3px] border-white/60", c)} />
        ))}
        {badge && (
          <span className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11.5px] text-white backdrop-blur-md">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: GOLD }} />
            {badge}
          </span>
        )}
        <button onClick={toggleXray} aria-pressed={xray} className={cn("absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium backdrop-blur-md transition", xray ? "border-[#aee6ff] bg-[#aee6ff] text-ink" : "border-white/40 bg-black/40 text-white hover:bg-black/55")}>
          <ScanLine className="h-3.5 w-3.5" /> {xray ? "X-ray on" : "X-ray view"}
        </button>
      </motion.div>
      {children}
    </div>
  );
}

/** One opened part, shown as three glass layers that fan out in depth: what it's made of, what throws it off, how NEA helps. */
export function PartLayers({ title, kicker, color = GOLD, layers, footer, onClose, className }: { title: string; kicker?: string; color?: string; layers: { label: string; items: string[] }[]; footer?: ReactNode; onClose?: () => void; className?: string }) {
  return (
    <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.35 }} className={cn("[perspective:1200px]", className)}>
      <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_30px_80px_-40px_rgba(var(--shadow-tint),0.7)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            {kicker && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-graphite">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} /> {kicker}
              </p>
            )}
            <p className="mt-1 font-display text-[1.35rem] leading-tight text-ink">{title}</p>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-[13px] text-ink/70 hover:bg-ink/10">
              ✕
            </button>
          )}
        </div>
        <div className="mt-4 space-y-2" style={{ transformStyle: "preserve-3d" }}>
          {layers.map((l, i) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, rotateX: 55, z: -80, y: -24 * i }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.08 + i * 0.12 }}
              className="rounded-2xl border border-ink/[0.07] p-3"
              style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${color}22)`, transformOrigin: "top center" }}
            >
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-graphite">
                <span className="tabular grid h-4 w-4 place-items-center rounded-full bg-ink text-[9px] text-white">{i + 1}</span>
                {l.label}
              </p>
              <ul className="mt-1.5 space-y-1">
                {l.items.map((x) => (
                  <li key={x} className="text-[13px] leading-snug text-ink/85">
                    {x}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </motion.div>
  );
}
