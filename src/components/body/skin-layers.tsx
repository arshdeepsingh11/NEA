"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Skin, layer by layer: an interactive cross-section.
 * Tap a layer to see what lives there, what goes wrong, and which NEA treatment reaches that depth.
 */
const LAYERS = [
  { k: "epi", name: "Epidermis", depth: "~0.1 mm", y: 0, h: 22, color: "rgb(var(--c-warm) / 0.55)", lives: "Skin cells that renew about every 28 days, and melanocytes that make pigment.", wrong: "Dark spots, melasma, dullness, dehydration.", reach: "Peels, Perfect Derma Peel, facials, micro laser peel, medical-grade skincare." },
  { k: "der", name: "Dermis", depth: "1–4 mm", y: 22, h: 56, color: "rgb(var(--c-accent) / 0.18)", lives: "Collagen and elastin (firmness), blood vessels, oil glands and hair follicles.", wrong: "Lines, laxity, acne, enlarged pores, redness and visible capillaries.", reach: "Fotona laser, microneedling, PRP, neuromodulators, fillers." },
  { k: "hyp", name: "Fat layer", depth: "varies", y: 78, h: 42, color: "rgb(var(--c-accent2) / 0.14)", lives: "Fat cells that cushion and shape the face and body.", wrong: "Volume loss in the face; stubborn fat on the body.", reach: "Fillers (face), Belkyra (double chin), truSculpt iD and TightSculpting (body)." },
];

export function SkinLayers({ className }: { className?: string }) {
  const [on, setOn] = useState("der");
  const L = LAYERS.find((l) => l.k === on)!;
  return (
    <div className={cn("grid gap-5 md:grid-cols-[1.1fr_1fr]", className)}>
      <svg viewBox="0 0 320 130" className="w-full overflow-visible rounded-2xl" role="img" aria-label="Cross-section of skin layers">
        {LAYERS.map((l) => (
          <g key={l.k} onClick={() => setOn(l.k)} className="cursor-pointer">
            <rect x="0" y={l.y} width="320" height={l.h} fill={l.color} />
            <motion.rect x="0" y={l.y} width="320" height={l.h} fill="none" stroke="rgb(var(--c-accent))" strokeWidth="2" animate={{ opacity: on === l.k ? 1 : 0 }} />
            <text x="8" y={l.y + 14} fontSize="9" fill="rgb(var(--c-ink) / 0.75)" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              {l.name}
            </text>
          </g>
        ))}
        {/* surface cells */}
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={i * 16 + 2} y="2" width="13" height="6" rx="3" fill="rgb(var(--c-warm) / 0.9)" pointerEvents="none" />
        ))}
        {/* melanocytes */}
        {[40, 120, 210, 280].map((x) => (
          <circle key={x} cx={x} cy="18" r="3" fill="rgb(110 70 40 / 0.7)" pointerEvents="none" />
        ))}
        {/* collagen fibres */}
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M0 ${34 + i * 6} C 80 ${30 + i * 6} 160 ${40 + i * 6} 320 ${33 + i * 6}`} fill="none" stroke="rgb(var(--c-accent) / 0.35)" strokeWidth="1.2" pointerEvents="none" />
        ))}
        {/* hair follicle + oil gland */}
        <path d="M150 0 L150 66" stroke="rgb(var(--c-ink) / 0.45)" strokeWidth="2" pointerEvents="none" />
        <ellipse cx="150" cy="70" rx="7" ry="9" fill="none" stroke="rgb(var(--c-ink) / 0.4)" strokeWidth="1.5" pointerEvents="none" />
        <circle cx="162" cy="40" r="6" fill="rgb(var(--c-warm) / 0.8)" pointerEvents="none" />
        {/* vessel */}
        <path d="M0 74 C 70 64 120 82 200 72 S 300 70 320 76" fill="none" stroke="rgb(200 80 90 / 0.55)" strokeWidth="2.5" pointerEvents="none" />
        {/* fat cells */}
        {Array.from({ length: 11 }).map((_, i) => (
          <circle key={i} cx={14 + i * 29} cy={98 + (i % 2) * 8} r="12" fill="rgb(255 255 255 / 0.55)" stroke="rgb(var(--c-accent2) / 0.35)" pointerEvents="none" />
        ))}
      </svg>
      <motion.div key={on} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-ink/[0.07] bg-white/70 p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-[1.5rem] leading-none text-ink">{L.name}</p>
          <span className="text-[12px] text-graphite">{L.depth} deep</span>
        </div>
        <dl className="mt-3 space-y-2 text-[13.5px] leading-snug">
          <div>
            <dt className="text-graphite">What lives here</dt>
            <dd className="text-ink">{L.lives}</dd>
          </div>
          <div>
            <dt className="text-graphite">What goes wrong</dt>
            <dd className="text-ink">{L.wrong}</dd>
          </div>
          <div>
            <dt className="text-graphite">NEA treatments that reach it</dt>
            <dd className="text-ink">{L.reach}</dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-1.5">
          {LAYERS.map((l) => (
            <button key={l.k} onClick={() => setOn(l.k)} className={cn("rounded-full px-3 py-1 text-[12px]", on === l.k ? "bg-ink text-white" : "bg-ink/[0.05] text-ink/70")}>
              {l.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
