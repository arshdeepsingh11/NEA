"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HoloPortrait } from "@/components/ui/holo-portrait";
import { IMG } from "@/content/media";

/** Where each body system sits on the portrait (% of the photo). */
const AT: Record<string, [number, number]> = {
  scalp: [44, 6], brain: [55, 7.5], face: [53, 13], neck: [53, 19.5], chest: [50, 27], arms: [31, 33], liver: [42, 38], adrenals: [58, 40], gut: [50, 44], pelvis: [48, 53], thighs: [45, 63], knees: [47, 75], feet: [52, 93],
};

type ScanRegion = { id: string; name: string; system: string; headline: string; color: string; tests: string[]; tracks: string[] };

/**
 * A real, smiling person with a Nea SI scan layered on top: one body system lights up at a time.
 * The readout explains what that system does for your skin and how NEA measures it.
 * Clicking any part opens the full Body Explorer on that region.
 */
export function HeroBody({ regions }: { regions: ScanRegion[] }) {
  const router = useRouter();
  const [i, setI] = useState(1);
  const [paused, setPaused] = useState(false);
  const r = regions[i];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % regions.length), 3800);
    return () => clearInterval(t);
  }, [paused, regions.length]);

  return (
    <div className="relative h-full w-full" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(var(--c-accent) / 0.16),transparent_65%)] blur-2xl" />
      <HoloPortrait
        src={IMG.bodyMap}
        alt="A smiling woman, with NEA's body systems marked on her"
        aspect="2 / 3"
        className="absolute left-1/2 top-1/2 h-[96%] -translate-x-1/2 -translate-y-1/2"
        spots={regions.filter((x) => AT[x.id]).map((x) => ({ id: x.id, x: AT[x.id][0], y: AT[x.id][1], label: x.name, color: x.color }))}
        selected={r.id}
        onSelect={(id) => (r.id === id ? router.push(`/body?focus=${id}`) : setI(regions.findIndex((x) => x.id === id)))}
        badge="Nea SI body scan"
      />

      {/* Scan progress across the ten systems */}
      <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1.5" aria-hidden>
        {regions.map((x, k) => (
          <button key={x.id} onClick={() => setI(k)} className="pointer-events-auto h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 6, background: k === i ? x.color : "rgb(var(--c-ink) / 0.2)" }} tabIndex={-1} />
        ))}
      </div>

      {/* Live readout */}
      <div className="absolute bottom-2 right-0 w-[min(300px,82%)] sm:bottom-6">
        <AnimatePresence mode="wait">
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11.5px] text-flora">
                <Activity className="h-3.5 w-3.5" /> Nea SI body scan · {String(i + 1).padStart(2, "0")}/{regions.length}
              </span>
              <span className="chip !px-2 !py-0.5 !text-[11px]">{r.system}</span>
            </div>
            <p className="mt-3 font-display text-lg font-semibold text-ink">{r.name}</p>
            <p className="mt-1 text-[13px] leading-snug text-graphite">{r.headline}</p>
            {r.tests.length > 0 && (
              <p className="mt-3 text-[12px] text-graphite">
                Measured with <span className="text-ink">{r.tests.slice(0, 2).join(" · ")}</span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.tracks.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] text-ink/80">
                  {t}
                </span>
              ))}
            </div>
            <Link href={`/body?focus=${r.id}`} className="mt-4 flex items-center gap-1 text-[13px] font-medium text-ink hover:text-flora">
              Explore {r.name.toLowerCase()} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
