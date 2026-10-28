"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChartLine, Microscope, Stethoscope, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    t: "Choose",
    icon: Stethoscope,
    what: "Your NEA practitioner looks at your scan and history and suggests only the tests that would change your plan.",
    why: "No test for the sake of testing: every result has to lead to a decision.",
    you: "A shortlist of 1–3 tests and why each one matters",
  },
  {
    t: "Collect",
    icon: TestTube,
    what: "A quick swab or sample at the clinic, or an at-home kit you send back.",
    why: "Painless and fast, so it fits into a normal visit.",
    you: "Nothing to prepare unless your practitioner tells you",
  },
  {
    t: "Analyse",
    icon: Microscope,
    what: "Your sample is processed by BioAro Labs in CLIA-registered laboratories using validated methods.",
    why: "Lab-grade data, not a guess from a questionnaire.",
    you: "A secure notification when results are ready",
  },
  {
    t: "Understand",
    icon: ChartLine,
    what: "Results on your secure dashboard, reviewed with you at NEA in plain language.",
    why: "Numbers only help when someone explains what to change, and then re-tests to prove it worked.",
    you: "Your plan updated: treatments, nutrition and products",
  },
];

/**
 * How testing works, as one live pipeline: a light travels from step to step.
 * Tap a step (or let it play) to see what happens, why it matters and what you get.
 */
export function TestJourney() {
  const [on, setOn] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setOn((x) => (x + 1) % STEPS.length), 3200);
    return () => clearInterval(t);
  }, [auto]);
  const S = STEPS[on];

  return (
    <div className="surface relative overflow-hidden rounded-[32px] p-5 md:p-8">
      {/* pipeline */}
      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-[2px] rounded-full bg-ink/[0.08] md:block">
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, rgb(var(--viz-1)), rgb(var(--viz-2)))" }} animate={{ width: `${(on / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
          <motion.span key={on} className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgb(var(--c-accent2)/0.7)]" initial={{ left: `${(Math.max(0, on - 1) / (STEPS.length - 1)) * 100}%` }} animate={{ left: `${(on / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <ol className="relative grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i <= on;
            return (
              <li key={s.t} className="flex flex-col items-center text-center">
                <button
                  onClick={() => {
                    setAuto(false);
                    setOn(i);
                  }}
                  aria-pressed={i === on}
                  className={cn("relative grid h-14 w-14 place-items-center rounded-full border transition", i === on ? "border-transparent text-white" : done ? "border-flora/40 bg-white text-flora" : "border-ink/10 bg-white text-graphite")}
                >
                  {i === on && <motion.span layoutId="tj-on" className="absolute inset-0 rounded-full [background:var(--aurora)] shadow-[0_10px_30px_-8px_rgb(var(--c-accent)/0.7)]" />}
                  <Icon className="relative h-5 w-5" />
                </button>
                <span className="tabular mt-2 text-[11px] text-graphite">Step {i + 1}</span>
                <span className={cn("font-display text-[1.15rem] leading-tight md:text-[1.5rem]", i === on ? "text-ink" : "text-ink/60")}>{s.t}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* detail */}
      <AnimatePresence mode="wait">
        <motion.div key={on} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["What happens", S.what],
            ["Why it matters", S.why],
            ["What you get", S.you],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-ink/[0.07] bg-white/70 p-4">
              <p className="text-[11.5px] uppercase tracking-[0.14em] text-flora">{k}</p>
              <p className="mt-1.5 text-[14.5px] leading-snug text-ink">{v}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <button onClick={() => setAuto((a) => !a)} className="mt-4 text-[12px] text-graphite underline-offset-4 hover:text-ink hover:underline">
        {auto ? "Pause the walkthrough" : "Play the walkthrough"}
      </button>
    </div>
  );
}
