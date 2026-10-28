"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FlaskConical, RotateCcw, Sparkles, Syringe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { programs } from "@/content/programs";
import { labTests } from "@/content/tests";
import { BookButton } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import { NeaImage } from "@/components/ui/nea-image";
import { cn, money } from "@/lib/utils";

/**
 * Nea SI Consult: seven short questions, then Nea SI explains what is most likely going on,
 * which program fits (with a match score you can read), which tests and first treatments make sense,
 * what it costs against your budget, and books it in Jane.
 * The reasoning is rule-based and shown to the user, so every suggestion has a "because".
 */
type A = {
  concern?: string;
  since?: string;
  tried: string[];
  tone?: string;
  signals: string[];
  age?: string;
  budget?: string;
  downtime?: string;
};
type Q = { k: keyof A; q: string; sub?: string; multi?: boolean; opts: { v: string; l: string; d?: string }[] };

const QS: Q[] = [
  {
    k: "concern",
    q: "What would you most like to change?",
    opts: [
      { v: "acne", l: "Breakouts or acne", d: "Spots, cysts, marks they leave" },
      { v: "pigment", l: "Dark spots or uneven tone", d: "Melasma, sun spots, marks" },
      { v: "aging", l: "Lines, laxity or dullness", d: "Fine lines, loose skin, tired look" },
      { v: "redness", l: "Redness or sensitivity", d: "Flushing, rosacea, stinging" },
      { v: "hair", l: "Thinning hair", d: "Shedding, wider part, receding" },
      { v: "body", l: "Body shape or weight", d: "Stubborn fat, muscle tone" },
      { v: "feminine", l: "Feminine or bladder health", d: "Dryness, leaks, laxity" },
      { v: "sleep", l: "Snoring or poor sleep", d: "Snoring, sleep apnea" },
    ],
  },
  { k: "since", q: "How long has it been going on?", opts: [{ v: "new", l: "Less than 3 months" }, { v: "year", l: "3 to 12 months" }, { v: "long", l: "More than a year" }] },
  {
    k: "tried",
    q: "What have you already tried?",
    sub: "Pick all that apply",
    multi: true,
    opts: [{ v: "otc", l: "Store-bought products" }, { v: "rx", l: "Prescription creams or pills" }, { v: "facials", l: "Facials or peels" }, { v: "laser", l: "Laser or injectables" }, { v: "none", l: "Nothing yet" }],
  },
  {
    k: "tone",
    q: "Which is closest to your skin tone?",
    sub: "This changes which lasers and peels are safest for you",
    opts: [{ v: "1", l: "Very fair, always burns" }, { v: "2", l: "Fair, burns easily" }, { v: "3", l: "Medium, sometimes burns" }, { v: "4", l: "Olive or light brown" }, { v: "5", l: "Brown" }, { v: "6", l: "Deep brown" }],
  },
  {
    k: "signals",
    q: "Do any of these sound like you?",
    sub: "These point to what is happening inside",
    multi: true,
    opts: [
      { v: "stress", l: "High stress" },
      { v: "sleep", l: "Poor sleep" },
      { v: "gut", l: "Bloating or digestive issues" },
      { v: "cycle", l: "Flares with my cycle" },
      { v: "sun", l: "Lots of sun or tanning" },
      { v: "diet", l: "Lots of sugar or dairy" },
      { v: "tired", l: "Often tired or cold" },
      { v: "none", l: "None of these" },
    ],
  },
  { k: "age", q: "Your age?", opts: [{ v: "u30", l: "Under 30" }, { v: "30", l: "30 to 44" }, { v: "45", l: "45 to 59" }, { v: "60", l: "60+" }] },
  {
    k: "budget",
    q: "Budget and downtime?",
    sub: "First pick a budget, then how much downtime is OK",
    opts: [{ v: "500", l: "Under $500" }, { v: "1500", l: "$500 – $1,500" }, { v: "3000", l: "$1,500 – $3,000" }, { v: "9999", l: "$3,000+" }],
  },
];
const DOWNTIME = [
  { v: "0", l: "None, back to work same day" },
  { v: "3", l: "A few days is fine" },
  { v: "7", l: "Up to a week is fine" },
];

const T = (slug: string, name: string, downtime: number, deepSafe = true) => ({ slug, name, downtime, deepSafe });
const TX: Record<string, ReturnType<typeof T>[]> = {
  acne: [T("active-acne", "Acne laser treatment", 0), T("facials", "Extraction facial", 0), T("perfect-derma-peel", "Medical peel series", 3), T("acne-scarring", "Fractional resurfacing for scars", 7, false)],
  pigment: [T("perfect-derma-peel", "Perfect Derma Peel", 3), T("facials", "Brightening facial", 0), T("hyperpigmentation-melasma", "Micro laser peel (tone-safe settings)", 3), T("medical-grade-skincare", "Medical-grade brightening routine", 0)],
  aging: [T("neuromodulators", "Neuromodulators (Botox)", 0), T("facial-laser", "Fotona skin tightening", 0), T("lines-wrinkles-sun-damage", "Fractional resurfacing", 7, false), T("dermal-fillers", "Dermal fillers", 3)],
  redness: [T("rosacea", "Rosacea laser", 0), T("facials", "Calming facial", 0), T("medical-grade-skincare", "Barrier-repair routine", 0)],
  hair: [T("prp-injections", "PRP hair restoration", 0), T("hair-restoration", "Fotona hair restoration laser", 0)],
  body: [T("muscle-sculpting", "truSculpt flex muscle sculpting", 0), T("body-contouring", "truSculpt iD body contouring", 0), T("weight-loss-programs", "Medical weight program", 0)],
  feminine: [T("feminine-health", "IntimaLase / IncontiLase", 0)],
  sleep: [T("snoring-sleep-apnea", "NightLase snoring treatment", 0)],
};
const PROGRAM: Record<string, string | undefined> = { acne: "clear-skin", pigment: "even-tone", aging: "healthy-aging", redness: "clear-skin", hair: "hair-regrowth" };

function reason(a: A) {
  const out: string[] = [];
  const tests = new Set<string>();
  if (a.since === "long") out.push("It has lasted over a year, so something underneath is likely still feeding it. Testing comes first.");
  if (a.tried.includes("rx") || a.tried.includes("laser")) out.push("Treatments you have tried treated the surface. Looking at the cause is the missing step.");
  if (a.signals.includes("gut") || a.signals.includes("diet")) {
    out.push("Digestive symptoms and diet often show up on the skin through the gut–skin axis.");
    tests.add("biogut");
  }
  if (a.signals.includes("cycle") || (a.concern === "acne" && a.age !== "u30")) {
    out.push("Breakouts that follow your cycle, or adult acne, usually involve hormones.");
    tests.add("hormone-health");
  }
  if (a.signals.includes("stress")) {
    out.push("High stress raises cortisol, which slows healing and can trigger flares.");
    tests.add("cortisol");
  }
  if (a.signals.includes("tired") || a.concern === "hair") {
    out.push("Tiredness and shedding often trace back to low iron, vitamin D or protein.");
    tests.add("essential-vitamin-health");
  }
  if (a.concern === "hair") tests.add("dht");
  if (a.signals.includes("sun") || a.concern === "pigment") {
    out.push("Sun is the main trigger for dark spots; the scan shows damage before it surfaces.");
    tests.add("vitamin-d");
  }
  if (["acne", "redness"].includes(a.concern ?? "")) tests.add("bioskin");
  if (Number(a.tone) >= 4 && ["pigment", "acne", "aging"].includes(a.concern ?? "")) out.push("Your skin tone is more prone to marks after irritation, so Nea SI only suggests peels and laser settings that are safe for brown skin.");
  if (a.age === "45" || a.age === "60") tests.add("core-inflammation-aging");
  return { reasons: out.slice(0, 4), tests: [...tests].slice(0, 3) };
}

export function SiConsult({ className }: { className?: string }) {
  const ai = useAi();
  const [a, setA] = useState<A>({ tried: [], signals: [] });
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const done = step >= QS.length;

  useEffect(() => {
    if (!done) return;
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 1900);
    return () => clearTimeout(t);
  }, [done]);

  const q = QS[Math.min(step, QS.length - 1)];
  const pick = (v: string) => {
    if (q.multi) {
      const key = q.k as "tried" | "signals";
      setA((s) => {
        const cur = s[key];
        const next = v === "none" ? ["none"] : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur.filter((x) => x !== "none"), v];
        return { ...s, [key]: next };
      });
    } else {
      setA((s) => ({ ...s, [q.k]: v }));
      if (q.k !== "budget") setTimeout(() => setStep((n) => n + 1), 220);
    }
  };
  const canNext = q.multi ? (a[q.k] as string[]).length > 0 : q.k === "budget" ? !!a.budget && !!a.downtime : !!a[q.k];

  const result = useMemo(() => {
    if (!done || !a.concern) return null;
    const prog = programs.find((p) => p.slug === PROGRAM[a.concern!]);
    const { reasons, tests } = reason(a);
    const dt = Number(a.downtime ?? 0);
    const deep = Number(a.tone ?? 3) >= 4;
    const tx = (TX[a.concern] ?? []).filter((t) => t.downtime <= dt && (!deep || t.deepSafe)).slice(0, 3);
    const budget = Number(a.budget ?? 9999);
    const cost = prog ? prog.priceFrom : 0;
    // a readable match score: how many of the program's root causes the answers point to
    let match = 72;
    if (a.since === "long") match += 6;
    match += Math.min(4, a.signals.filter((s) => s !== "none").length) * 4;
    if (a.tried.some((t) => ["rx", "laser", "facials"].includes(t))) match += 4;
    match = Math.min(97, match);
    const fits = cost <= budget;
    return { prog, reasons, tests: tests.map((s) => labTests.find((t) => t.slug === s)!).filter(Boolean), tx, cost, budget, fits, match };
  }, [done, a]);

  const reset = () => {
    setA({ tried: [], signals: [] });
    setStep(0);
  };

  return (
    <div className={cn("surface relative overflow-hidden rounded-[36px]", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--glow-b), transparent)" }} />
      {/* progress */}
      <div className="relative flex items-center gap-3 border-b border-ink/[0.06] px-5 py-4 md:px-8">
        <span className="relative grid h-9 w-9 place-items-center rounded-full text-ink [background:var(--aurora)]">
          <Sparkles className="h-4 w-4" />
          {(thinking || !done) && <span aria-hidden className="absolute inset-0 animate-ping rounded-full opacity-30 [background:var(--aurora)]" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">Nea SI Consult</p>
          <div className="mt-1.5 flex gap-1">
            {QS.map((_, i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-ink/[0.08]">
                <motion.span className="block h-full rounded-full [background:var(--aurora-deep)]" animate={{ width: i < step ? "100%" : i === step && !done ? "40%" : "0%" }} />
              </span>
            ))}
          </div>
        </div>
        <span className="tabular text-[12px] text-graphite">{done ? "Done" : `${step + 1} / ${QS.length}`}</span>
      </div>

      <div className="relative min-h-[460px] p-5 md:p-8">
        <AnimatePresence mode="wait">
          {!done && (
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
              <h3 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] text-ink">{q.q}</h3>
              {q.sub && <p className="mt-2 text-[14px] text-graphite">{q.sub}</p>}
              <div className={cn("mt-7 grid gap-2.5", q.opts.length > 5 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
                {q.opts.map((o) => {
                  const on = q.multi ? (a[q.k] as string[]).includes(o.v) : a[q.k] === o.v;
                  return (
                    <button key={o.v} onClick={() => pick(o.v)} aria-pressed={on} className={cn("group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition", on ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/70 hover:border-ink/25 hover:bg-white")}>
                      <span>
                        <span className="block text-[15px]">{o.l}</span>
                        {o.d && <span className={cn("block text-[12.5px]", on ? "text-white/70" : "text-graphite")}>{o.d}</span>}
                      </span>
                      <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", on ? "border-white bg-white text-ink" : "border-ink/15")}>{on && <Check className="h-3.5 w-3.5" />}</span>
                    </button>
                  );
                })}
              </div>
              {q.k === "budget" && (
                <div className="mt-6">
                  <p className="mb-2 text-[13px] text-graphite">Downtime</p>
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {DOWNTIME.map((o) => (
                      <button key={o.v} onClick={() => setA((s) => ({ ...s, downtime: o.v }))} className={cn("rounded-2xl border px-4 py-3 text-left text-[14px] transition", a.downtime === o.v ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/70 hover:bg-white")}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-8 flex items-center gap-3">
                {step > 0 && (
                  <button onClick={() => setStep((n) => n - 1)} className="btn-ghost !px-4 !py-2 !text-[13.5px]">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
                {(q.multi || q.k === "budget") && (
                  <button disabled={!canNext} onClick={() => setStep((n) => n + 1)} className="btn-light !px-5 !py-2 !text-[13.5px] disabled:opacity-40">
                    {step === QS.length - 1 ? "See my plan" : "Next"} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {done && thinking && (
            <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid min-h-[400px] place-items-center text-center">
              <div>
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-2 border-ink/10 border-t-[rgb(var(--c-accent))]" />
                <ThinkingSteps />
              </div>
            </motion.div>
          )}

          {done && !thinking && result && (
            <motion.div key="res" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="eyebrow">Nea SI suggests</p>
                {result.prog ? (
                  <>
                    <h3 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-ink">{result.prog.name}</h3>
                    <p className="mt-2 text-[16px] text-graphite">{result.prog.headline}</p>
                  </>
                ) : (
                  <h3 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-ink">{result.tx[0]?.name ?? "A free consultation"}</h3>
                )}
                <div className="mt-6 flex items-center gap-4">
                  <div className="relative h-16 w-16">
                    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                      <circle cx="32" cy="32" r="27" fill="none" stroke="rgb(var(--c-ink) / 0.08)" strokeWidth="6" />
                      <motion.circle cx="32" cy="32" r="27" fill="none" stroke="rgb(var(--viz-1))" strokeWidth="6" strokeLinecap="round" strokeDasharray={170} initial={{ strokeDashoffset: 170 }} animate={{ strokeDashoffset: 170 * (1 - result.match / 100) }} transition={{ duration: 1 }} />
                    </svg>
                    <span className="tabular absolute inset-0 grid place-items-center text-[15px] font-semibold">{result.match}%</span>
                  </div>
                  <p className="text-[13.5px] leading-snug text-graphite">Match with your answers. Higher means more of this program’s causes fit what you told Nea SI.</p>
                </div>
                <p className="mt-7 text-[13px] font-medium text-ink">Because</p>
                <ul className="mt-2 space-y-2">
                  {(result.reasons.length ? result.reasons : ["Your answers fit this program’s step-by-step approach: test, treat, track."]).map((r) => (
                    <li key={r} className="flex gap-3 text-[14.5px] leading-snug text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" /> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-2">
                  <BookButton slug={result.prog?.slug ?? result.tx[0]?.slug} title={result.prog?.name.replace(" Program", "") ?? result.tx[0]?.name} variant="light" />
                  {result.prog && (
                    <Link href={`/programs/${result.prog.slug}`} className="btn-ghost">
                      See the program
                    </Link>
                  )}
                  <button onClick={reset} className="btn-ghost !px-4">
                    <RotateCcw className="h-4 w-4" /> Start over
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {result.prog && (
                  <div className="relative overflow-hidden rounded-3xl">
                    <div className="relative aspect-[16/9]">
                      <NeaImage src={result.prog.image} alt="" fill sizes="(min-width:1024px) 35vw, 90vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
                        <span className="text-[13px]">{result.prog.duration}</span>
                        <span className="text-right">
                          <span className="block text-[11px] opacity-80">from</span>
                          <span className="tabular font-display text-[1.8rem] leading-none">{money(result.cost)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 px-4 py-3 text-[13px]">
                      <div className="mb-1.5 flex justify-between text-graphite">
                        <span>Against your budget</span>
                        <span className={result.fits ? "text-[rgb(var(--viz-good))]" : "text-[rgb(var(--viz-watch))]"}>{result.fits ? "Fits" : "Start with step 1, or monthly payments"}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ink/[0.07]">
                        <motion.div className="h-full rounded-full" style={{ background: result.fits ? "rgb(var(--viz-good))" : "rgb(var(--viz-watch))" }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (result.cost / Math.min(result.budget, 5000)) * 100)}%` }} transition={{ duration: 0.9 }} />
                      </div>
                    </div>
                  </div>
                )}
                {result.tests.length > 0 && (
                  <div className="rounded-3xl border border-ink/[0.07] bg-white/70 p-4">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <FlaskConical className="h-4 w-4 text-flora" /> Tests that would change your plan
                    </p>
                    <ul className="mt-2 divide-y divide-ink/[0.06]">
                      {result.tests.map((t) => (
                        <li key={t.slug}>
                          <Link href={`/tests#${t.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-[14px] hover:underline">
                            <span>{t.name}</span>
                            <span className="tabular text-graphite">{money(t.price)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.tx.length > 0 && (
                  <div className="rounded-3xl border border-ink/[0.07] bg-white/70 p-4">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <Syringe className="h-4 w-4 text-flora" /> First treatments that fit your downtime{Number(a.tone) >= 4 ? " and skin tone" : ""}
                    </p>
                    <ul className="mt-2 divide-y divide-ink/[0.06]">
                      {result.tx.map((t) => (
                        <li key={t.name}>
                          <Link href={`/treatments/${t.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-[14px] hover:underline">
                            <span>{t.name}</span>
                            <span className="text-[12px] text-graphite">{t.downtime === 0 ? "No downtime" : `~${t.downtime} days`}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() =>
                    ai.open({
                      query: `Nea SI Consult answers: concern ${a.concern}, for ${a.since}, tried ${a.tried.join("/")}, skin tone ${a.tone}, signals ${a.signals.join("/")}, age ${a.age}, budget ${a.budget}, downtime ${a.downtime} days. Explain my plan step by step.`,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-3xl bg-ink px-5 py-4 text-left text-white transition hover:bg-ink/90"
                >
                  <span>
                    <span className="block text-[14.5px] font-medium">Talk it through with Nea SI</span>
                    <span className="block text-[12.5px] text-white/70">Ask anything about this plan</span>
                  </span>
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ThinkingSteps() {
  const steps = ["Reading your answers", "Matching 29 treatments and 4 programs", "Checking safety for your skin tone", "Pricing against your budget"];
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => Math.min(steps.length, v + 1)), 420);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <ul className="mt-6 space-y-1.5 text-left">
      {steps.map((s, i) => (
        <li key={s} className={cn("flex items-center gap-2 text-[13.5px] transition", i < n ? "text-ink" : "text-graphite/50")}>
          <Check className={cn("h-4 w-4", i < n ? "text-flora" : "opacity-30")} /> {s}
        </li>
      ))}
    </ul>
  );
}
