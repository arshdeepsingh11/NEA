"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { programs } from "@/content/programs";
import { cn, money } from "@/lib/utils";

const CONCERNS = [
  { id: "acne", label: "Breakouts or acne", program: "clear-skin" },
  { id: "tone", label: "Dark spots or uneven tone", program: "even-tone" },
  { id: "hair", label: "Thinning hair", program: "hair-regrowth" },
  { id: "aging", label: "Lines, laxity or aging", program: "healthy-aging" },
  { id: "redness", label: "Redness or sensitivity", program: "clear-skin" },
  { id: "body", label: "Body, muscle or weight", href: "/experiences/body-truth-scan", title: "Body Truth Scan", note: "Start with DEXA body composition, then a nutrition or truSculpt flex plan built on your numbers." },
  { id: "feminine", label: "Feminine or bladder health", href: "/treatments/feminine-health", title: "Feminine health care", note: "IntimaLase, Incontilase and vaginal microbiome testing, with a private consultation first." },
  { id: "sleep", label: "Snoring or sleep", href: "/treatments/snoring-sleep-apnea", title: "NightLase for snoring", note: "Three gentle laser sessions, no device to wear at night." },
] as const;

const AGES = ["Under 30", "30 to 44", "45 to 59", "60+"] as const;

type ConcernId = (typeof CONCERNS)[number]["id"];

/** Two questions, one clear recommendation — modelled on a package finder. */
export function SkinFinder({ compact }: { compact?: boolean }) {
  const [concern, setConcern] = useState<ConcernId | null>(null);
  const [age, setAge] = useState<(typeof AGES)[number] | null>(null);

  const c = CONCERNS.find((x) => x.id === concern);
  const program = c && "program" in c ? programs.find((p) => p.slug === c.program) : undefined;
  const ageNote =
    age && program
      ? age === "Under 30"
        ? "At your age the focus is prevention and the habits that keep results."
        : age === "30 to 44"
          ? "This is when hormones, stress and sun start to show. Testing tells us which one matters most for you."
          : "We add DEXA and inflammation markers so skin and healthspan improve together."
      : "";

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2.5 text-[15px] transition-all duration-300 ease-spring active:scale-[0.97]",
      active ? "border-ink surface-strong text-ink" : "border-ink/15 surface hover:border-ink/30"
    );

  return (
    <div className={cn("grid gap-10 lg:grid-cols-[1.1fr_1fr]", compact && "lg:grid-cols-1")}>
      <div className="space-y-10">
        <fieldset>
          <legend className="mb-4 font-display text-xl font-semibold tracking-tight">What matters most right now?</legend>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((x) => (
              <button key={x.id} type="button" aria-pressed={concern === x.id} onClick={() => setConcern(x.id)} className={chip(concern === x.id)}>
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-4 font-display text-xl font-semibold tracking-tight">Your age</legend>
          <div className="flex flex-wrap gap-2">
            {AGES.map((a) => (
              <button key={a} type="button" aria-pressed={age === a} onClick={() => setAge(a)} className={chip(age === a)}>
                {a}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="relative min-h-[320px]" aria-live="polite">
        <AnimatePresence mode="wait">
          {!c || !age ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-full place-items-center rounded-4xl border border-dashed border-ink/15 p-10 text-center text-graphite">
              <p className="max-w-xs">Answer both questions and we will suggest where to start.</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${concern}-${age}`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full rounded-4xl surface-strong p-8 text-ink md:p-10"
            >
              <p className="text-[14px] text-graphite">We suggest</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">{program ? program.name : "title" in c ? c.title : ""}</h3>
              <p className="mt-4 leading-relaxed text-graphite">{program ? program.summary : "note" in c ? c.note : ""}</p>
              {ageNote && <p className="mt-3 leading-relaxed text-graphite">{ageNote}</p>}
              {program && (
                <p className="mt-6 text-[15px]">
                  <span className="text-graphite">From </span>
                  <span className="font-semibold">{money(program.priceFrom)}</span>
                  <span className="text-graphite"> · {program.duration}</span>
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={program ? `/programs/${program.slug}` : "href" in c ? c.href : "/"} className="btn-light">
                  See the plan
                </Link>
                <Link href="/skin-scan" className="btn border border-ink/20 hover:bg-white/90">
                  Start with a free scan
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setConcern(null);
                    setAge(null);
                  }}
                  className="btn text-graphite hover:text-ink"
                >
                  <RotateCcw className="h-4 w-4" /> Start over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
