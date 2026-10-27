"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Terminal, type TerminalLine } from "@/components/ui/terminal";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { name: "Test", title: "Find the cause, not just the symptom.", text: "An advanced skin scan, plus skin, gut and hormone markers when they matter. Raman’s team reads them together." },
  { name: "Treat", title: "Treat inside and out.", text: "Fotona laser, peels and injectables in the clinic. A Registered Dietitian plan and a medical-grade routine at home." },
  { name: "Track", title: "See the change in data.", text: "Re-scans at day 45 and day 90 put your before and after side by side, so progress is something you can see." },
  { name: "Maintain", title: "Keep what you gained.", text: "A simple membership keeps you on track with monthly care and quarterly re-scans." },
];

const LINES: TerminalLine[] = [
  { kind: "cmd", text: "nea scan --client demo --mode full-face" },
  { kind: "dim", text: "capturing 8 spectral layers… done (4.8s)" },
  { kind: "out", text: "texture ......... 71  pores ......... 64" },
  { kind: "out", text: "hydration ....... 58  redness ....... 77" },
  { kind: "warn", text: "uv damage ....... 49  ← below the surface" },
  { kind: "cmd", text: "nea report --priorities 3" },
  { kind: "ok", text: "1. Barrier + hydration (Calgary winter)" },
  { kind: "ok", text: "2. Early sun damage: SPF + antioxidant" },
  { kind: "ok", text: "3. Pores: consider Fotona resurfacing" },
  { kind: "dim", text: "likely factors: low vitamin D, dry air, diet" },
  { kind: "cmd", text: "nea rescan --in 90d" },
  { kind: "ok", text: "scheduled · free re-scan to measure change" },
];

const SCORES = [
  { label: "Hydration", from: 58, to: 76, color: "#2F7D6D" },
  { label: "UV damage", from: 49, to: 63, color: "#6E6BF5" },
  { label: "Texture", from: 71, to: 82, color: "#B9826F" },
];

/** The NEA Method — a real sequence, so it is numbered. */
export function Method() {
  const [step, setStep] = useState(0);
  const gauges = useRef<HTMLDivElement>(null);
  const inView = useInView(gauges, { once: false, margin: "-100px" });
  const [after, setAfter] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setAfter((a) => !a), 2600);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.name}>
            <button
              onClick={() => setStep(i)}
              onMouseEnter={() => setStep(i)}
              aria-expanded={step === i}
              className={cn("w-full rounded-3xl p-6 text-left transition-colors duration-500", step === i ? "bg-white shadow-[0_20px_50px_-30px_rgba(21,25,28,0.35)]" : "hover:bg-white/50")}
            >
              <div className="flex items-baseline gap-4">
                <span className={cn("font-display text-sm tabular-nums transition-colors", step === i ? "text-flora" : "text-graphite/60")}>{i + 1}</span>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{s.name}</h3>
                  <div className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-spring", step === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <p className="pt-2 text-[17px] font-medium text-ink">{s.title}</p>
                      <p className="pt-2 leading-relaxed text-graphite">{s.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ol>
      <div className="space-y-5">
        <Terminal lines={LINES} title="nea — skin health report" />
        <div ref={gauges} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6">
          {SCORES.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <CircularProgress value={after ? s.to : s.from} color={s.color} size={104} label={s.label} />
            </div>
          ))}
          <p className="w-full text-center text-[13px] text-graphite">
            {after ? "Day 90 re-scan" : "Day 0 scan"} · illustrative example
          </p>
        </div>
      </div>
    </div>
  );
}
