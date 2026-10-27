"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAi } from "@/components/ai/ai-provider";
import { cn } from "@/lib/utils";

type Node = { id: string; label: string; effect: string; measure: string; href: string; strength: number };

/**
 * "Your skin is the output." Six body systems feed signals into the skin.
 * Each line's thickness = how strongly that system typically shows up in skin concerns NEA sees.
 * Signals travel along the lines; click a system to see how NEA measures it.
 */
const NODES: Node[] = [
  { id: "gut", label: "Gut microbiome", effect: "Gut inflammation travels to the skin through the gut–skin axis, a common driver of acne, rosacea and eczema flares.", measure: "BioGut microbiome test", href: "/microbiome", strength: 0.95 },
  { id: "hormones", label: "Hormones", effect: "Androgens raise oil, cortisol slows healing, estrogen and thyroid shift pigment and hair.", measure: "Hormone Health panel · DHT · Cortisol", href: "/tests", strength: 0.9 },
  { id: "nutrition", label: "Nutrition", effect: "Protein, zinc, omega-3 and vitamins A, C and D are the raw materials for collagen and repair.", measure: "Essential vitamins · Registered Dietitian review", href: "/nutrition", strength: 0.75 },
  { id: "skinbiome", label: "Skin microbiome", effect: "The bacteria on your skin protect the barrier. When the balance tips, breakouts and sensitivity follow.", measure: "BioSkin swab", href: "/microbiome", strength: 0.85 },
  { id: "sun", label: "UV & environment", effect: "UV is the main driver of visible aging and dark spots; Calgary's dry air weakens the barrier.", measure: "Advanced skin scan (UV layer)", href: "/skin-scan", strength: 0.8 },
  { id: "aging", label: "Inflammation & age", effect: "Chronic, low-grade inflammation speeds up collagen loss and dullness.", measure: "Biological age & inflammation tests", href: "/tests", strength: 0.6 },
];

export function SystemsNetwork({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ai = useAi();
  const [active, setActive] = useState<string>("gut");
  const W = 560;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const R = 178;
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i / NODES.length) * Math.PI * 2;
    return [cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 0.92] as const;
  };
  const node = NODES.find((n) => n.id === active)!;

  return (
    <div className={cn("grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Six body systems that feed into skin health">
        <defs>
          <radialGradient id="net-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--fill-a)" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="var(--fill-c)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--fill-c)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="120" fill="url(#net-core)" />
        {NODES.map((n, i) => {
          const [x, y] = pos(i);
          const on = n.id === active;
          const d = `M${x},${y} Q${(x + cx) / 2 + (y - cy) * 0.12},${(y + cy) / 2 - (x - cx) * 0.12} ${cx},${cy}`;
          return (
            <g key={n.id}>
              <path id={`edge-${n.id}`} d={d} fill="none" stroke={on ? "rgb(var(--viz-1))" : "rgb(var(--c-ink) / 0.14)"} strokeWidth={1 + n.strength * (on ? 3.5 : 2)} strokeLinecap="round" style={{ transition: "stroke 300ms, stroke-width 300ms" }} />
              {!reduce &&
                [0, 1, 2].map((k) => (
                  <circle key={k} r={on ? 3.2 : 2.2} fill={on ? "rgb(var(--viz-1))" : "rgb(var(--viz-2))"} opacity={on ? 1 : 0.6}>
                    <animateMotion dur={`${3.4 - n.strength * 1.4}s`} begin={`${k * 1.1 + i * 0.3}s`} repeatCount="indefinite">
                      <mpath href={`#edge-${n.id}`} />
                    </animateMotion>
                  </circle>
                ))}
            </g>
          );
        })}
        <g>
          <circle cx={cx} cy={cy} r="54" fill="rgba(255,255,255,0.92)" stroke="rgb(var(--c-accent) / 0.55)" strokeWidth="1.5" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="600" fill="rgb(var(--c-ink))">
            Your skin
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="rgb(var(--c-graphite))">
            the visible output
          </text>
        </g>
        {NODES.map((n, i) => {
          const [x, y] = pos(i);
          const on = n.id === active;
          const w = n.label.length * 7.2 + 34;
          return (
            <g key={n.id} onClick={() => setActive(n.id)} onPointerEnter={() => setActive(n.id)} className="cursor-pointer" role="button" tabIndex={0} aria-label={n.label} onKeyDown={(e) => e.key === "Enter" && setActive(n.id)}>
              <rect x={x - w / 2} y={y - 17} width={w} height="34" rx="17" fill={on ? "rgb(var(--c-accent) / 0.12)" : "rgba(255,255,255,0.8)"} stroke={on ? "rgb(var(--c-accent) / 0.6)" : "rgb(var(--c-ink) / 0.12)"} />
              <circle cx={x - w / 2 + 16} cy={y} r="4" fill={on ? "rgb(var(--viz-1))" : "rgb(var(--c-graphite))"} />
              <text x={x - w / 2 + 26} y={y + 4.5} fontSize="13" fill={on ? "rgb(var(--c-ink))" : "rgb(var(--c-ink) / 0.8)"}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <AnimatePresence mode="wait">
        <motion.div key={node.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="surface rounded-[28px] p-7">
          <p className="stat-label">Signal strength into skin</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-ink/[0.07]">
              <motion.div className="h-full rounded-full bg-[rgb(var(--viz-1))]" initial={{ width: 0 }} animate={{ width: `${node.strength * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
            <span className="tabular text-[13px] text-ink">{Math.round(node.strength * 100)}</span>
          </div>
          <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">{node.label}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-graphite">{node.effect}</p>
          <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
            <p className="stat-label">How NEA measures it</p>
            <p className="mt-1 text-[15px] text-ink">{node.measure}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={node.href} className="btn-ghost">
              Learn more <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button onClick={() => ai.open({ query: `How does my ${node.label.toLowerCase()} affect my skin, and how does NEA test it?` })} className="btn-primary">
              <Sparkles className="h-4 w-4" /> Ask AI
            </button>
          </div>
          <p className="mt-5 text-[12px] text-graphite/80">Strength is an illustrative weighting of how often each system contributes to the skin concerns NEA treats, not a personal result.</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
