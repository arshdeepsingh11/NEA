"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, FlaskConical, Pause, Play, ScanFace, Sparkles } from "lucide-react";
import { Radar } from "@/components/viz/radar";
import type { ProgramInsight } from "@/content/program-insights";
import { cn } from "@/lib/utils";

/** Where each phase sits on the timeline (share of the whole program). */
const SPLIT = [0, 0.15, 0.6, 0.85, 1];
const ICONS = [FlaskConical, Sparkles, ScanFace, CalendarCheck];

/**
 * Program Journey: drag through the program day by day.
 * The score is interpolated between the plan's checkpoints; the radar moves from a typical start towards the goal
 * in proportion to that score. Everything is illustrative and labelled that way.
 */
export function ProgramJourney({ phases, insight, className }: { phases: { name: string; detail: string }[]; insight: ProgramInsight; className?: string }) {
  const m = insight.metric;
  const steps = m.labels.length - 1;
  const [t, setT] = useState(0.35); // 0..1
  const [play, setPlay] = useState(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!play) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((x) => {
        const n = x + dt / 9;
        if (n >= 1) {
          setPlay(false);
          return 1;
        }
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play]);

  const pos = t * steps;
  const i0 = Math.min(steps - 1, Math.floor(pos));
  const f = pos - i0;
  const value = m.values[i0] + (m.values[i0 + 1] - m.values[i0]) * f;
  const v0 = m.values[0];
  const vEnd = m.values[steps];
  const progress = vEnd === v0 ? 0 : (value - v0) / (vEnd - v0);
  const phase = Math.max(0, SPLIT.findIndex((s, i) => t >= s && t <= SPLIT[i + 1]));
  const ph = phases[Math.min(phase, phases.length - 1)];
  const Icon = ICONS[phase % ICONS.length];

  // label for the current point, e.g. "Day 38" or "Month 2.5"
  const unit = m.labels[steps].split(" ")[0];
  const endN = Number(m.labels[steps].split(" ")[1]);
  const nowN = Math.round(t * endN * (unit === "Day" ? 1 : 2)) / (unit === "Day" ? 1 : 2);
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const delta = value - v0;

  return (
    <div className={cn("surface rounded-[32px] p-6 md:p-8", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] text-flora">
          <NeaSiIcon className="h-4 w-4" /> Nea SI journey · drag the timeline
        </p>
        <span className="chip !text-[11.5px]">Illustrative, not a promise</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-[12.5px] text-graphite">
                {unit} <span className="tabular">{fmt(nowN)}</span> of {endN}
              </p>
              <p className="tabular font-display text-[clamp(3rem,6vw,4.6rem)] leading-none text-ink">{fmt(Math.round(value * 10) / 10)}</p>
              <p className="text-[13px] text-graphite">{m.name}</p>
            </div>
            <div className="pb-2">
              <span className={cn("tabular rounded-full px-2.5 py-1 text-[12.5px]", Math.abs(delta) < 0.05 ? "bg-ink/[0.05] text-graphite" : "bg-[rgb(var(--viz-good)/0.14)] text-[rgb(var(--viz-good))]")}>
                {delta === 0 ? "start" : `${delta > 0 ? "+" : ""}${fmt(Math.round(delta * 10) / 10)} since start`}
              </span>
              <p className="mt-1 text-[11.5px] text-graphite">{m.better === "up" ? "Higher is better" : "Lower is better"}</p>
            </div>
          </div>

          {/* timeline */}
          <div className="mt-6">
            <div className="relative h-10">
              <div className="absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 overflow-hidden rounded-full">
                {phases.map((p, i) => (
                  <span key={p.name} className="h-full" style={{ width: `${(SPLIT[i + 1] - SPLIT[i]) * 100}%`, background: `rgb(var(--viz-${(i % 3) + 1}) / ${i === phase ? 0.9 : 0.28})` }} />
                ))}
              </div>
              <input type="range" min={0} max={1000} value={Math.round(t * 1000)} onChange={(e) => (setPlay(false), setT(Number(e.target.value) / 1000))} aria-label="Move through the program" style={{ top: 9 }} className="nea-range nea-range-bare absolute inset-0 w-full" />
            </div>
            <div className="mt-1 flex text-[11.5px] text-graphite">
              {phases.map((p, i) => (
                <button key={p.name} onClick={() => (setPlay(false), setT((SPLIT[i] + SPLIT[i + 1]) / 2))} className={cn("text-left transition hover:text-ink", i === phase && "text-ink")} style={{ width: `${(SPLIT[i + 1] - SPLIT[i]) * 100}%` }}>
                  {p.name}
                </button>
              ))}
            </div>
            <button onClick={() => (t >= 1 && setT(0), setPlay((x) => !x))} className="btn-ghost mt-4 !py-2 text-[13px]">
              {play ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {play ? "Pause" : "Play the program"}
            </button>
          </div>

          <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-ink/[0.07] bg-white/70 p-4">
            <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
              <Icon className="h-4 w-4 text-flora" /> Phase {phase + 1}: {ph?.name}
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-graphite">{ph?.detail}</p>
          </motion.div>
        </div>

        <div>
          <Radar className="mx-auto max-w-[340px]" axes={insight.radar.map((a) => ({ label: a.label, value: Math.round(a.value + (a.target - a.value) * Math.max(0, Math.min(1, progress))), target: a.target }))} />
          <p className="text-center text-[12px] text-graphite">Filled shape: where your skin could be at this point. Dashed: the goal.</p>
        </div>
      </div>
      <p className="mt-5 text-[12px] text-graphite/80">How it works: the score follows the plan’s checkpoints ({m.labels.join(", ")}) and fills in between them. Every checkpoint is a real re-scan at NEA, so your own line replaces this one.</p>
    </div>
  );
}
