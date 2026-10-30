"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HoloPortrait, PartLayers } from "@/components/ui/holo-portrait";
import { IMG } from "@/content/media";

/** Where each body system sits on the portrait (% of the photo). */
const AT: Record<string, [number, number]> = {
  scalp: [44, 6], brain: [55, 7.5], face: [53, 13], neck: [53, 19.5], chest: [50, 27], arms: [31, 33], liver: [42, 38], adrenals: [58, 40], gut: [50, 44], pelvis: [48, 53], thighs: [45, 63], knees: [47, 75], feet: [52, 93],
};

export type ScanRegion = { id: string; name: string; system: string; headline: string; color: string; tests: string[]; tracks: string[]; madeOf: string[]; disruptors: string[]; improve: string };

/**
 * A real, smiling person with a Nea SI scan layered on top. One body system lights up at a time;
 * tap any glowing point to open it: three layers fan out showing what it's made of, what throws it off,
 * and how NEA measures and treats it. The X-ray lens shows the inside of the same person.
 */
export function HeroBody({ regions }: { regions: ScanRegion[] }) {
  const [i, setI] = useState(1);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const r = regions[i];

  useEffect(() => {
    if (paused || open) return;
    const t = setInterval(() => setI((v) => (v + 1) % regions.length), 3800);
    return () => clearInterval(t);
  }, [paused, open, regions.length]);

  const choose = (id: string) => {
    setI(regions.findIndex((x) => x.id === id));
    setOpen(id);
  };
  const o = regions.find((x) => x.id === open);

  return (
    <div className="relative flex w-full flex-col items-center gap-5 lg:block lg:h-full" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(var(--c-accent) / 0.16),transparent_65%)] blur-2xl" />
      <HoloPortrait
        src={IMG.bodyMap}
        alt="A smiling woman, with NEA's body systems marked on her"
        aspect="2 / 3"
        className="h-[64svh] max-h-[640px] lg:absolute lg:left-[33%] lg:top-1/2 lg:h-[96%] lg:max-h-none lg:-translate-x-1/2 lg:-translate-y-1/2"
        spots={regions.filter((x) => AT[x.id]).map((x) => ({ id: x.id, x: AT[x.id][0], y: AT[x.id][1], label: x.name, color: x.color }))}
        selected={r.id}
        onSelect={choose}
        badge="Nea SI body scan"
      />

      {/* scan progress across the systems */}
      <div className="flex items-center gap-1.5 lg:absolute lg:left-[33%] lg:top-0 lg:-translate-x-1/2" aria-hidden>
        {regions.map((x, k) => (
          <button key={x.id} onClick={() => choose(x.id)} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 6, background: k === i ? x.color : "rgb(var(--c-ink) / 0.2)" }} tabIndex={-1} />
        ))}
      </div>

      {/* the opened part, or the live readout */}
      <div className="w-full max-w-[360px] lg:absolute lg:bottom-4 lg:right-0 lg:w-[340px]">
        <AnimatePresence mode="wait">
          {o ? (
            <PartLayers
              key={o.id}
              title={o.name}
              kicker={`Opened · ${o.system}`}
              color={o.color}
              onClose={() => setOpen(null)}
              layers={[
                { label: "What it’s made of", items: o.madeOf.slice(0, 2) },
                { label: "What throws it off", items: o.disruptors.slice(0, 3) },
                { label: "How NEA measures and treats it", items: [o.improve, ...(o.tests.length ? [`Tests: ${o.tests.slice(0, 3).join(" · ")}`] : [])] },
              ]}
              footer={
                <Link href={`/body?focus=${o.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:text-flora">
                  See it in the 3D Body Explorer <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11.5px] text-flora">
                  <Activity className="h-3.5 w-3.5" /> Nea SI body scan · {String(i + 1).padStart(2, "0")}/{regions.length}
                </span>
                <span className="chip !px-2 !py-0.5 !text-[11px]">{r.system}</span>
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">{r.name}</p>
              <p className="mt-1 text-[13px] leading-snug text-graphite">{r.headline}</p>
              <button onClick={() => setOpen(r.id)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-ink/90">
                Open this part <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
