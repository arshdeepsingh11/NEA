"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CircleHelp, FlaskConical, Route, ScanFace, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Radar } from "@/components/viz/radar";
import { TrendChart } from "@/components/viz/trend-chart";
import { cn } from "@/lib/utils";

/**
 * The Skin Health Report, live. Answer three things about yourself and the report rebuilds:
 * a skin fingerprint for someone like you, your own lab numbers checked against healthy ranges,
 * and a 90-day projection that changes with the plan you pick.
 * All formulas are simple and written out, and every chart says in plain words what it shows.
 */
type Concern = "acne" | "pigment" | "aging" | "redness" | "dryness";
type Age = "u30" | "30" | "45" | "60";
type Type = "oily" | "dry" | "combo" | "sensitive" | "normal";
type Axis = "Hydration" | "Even tone" | "Smoothness" | "Pores" | "Calm" | "Sun defence";

const AXES: { k: Axis; plain: string }[] = [
  { k: "Hydration", plain: "How much water your skin holds" },
  { k: "Even tone", plain: "How even your colour is (spots, melasma)" },
  { k: "Smoothness", plain: "Texture, fine lines and scars" },
  { k: "Pores", plain: "How clear and small pores are" },
  { k: "Calm", plain: "Less redness and sensitivity" },
  { k: "Sun defence", plain: "How little sun damage is hiding under the surface" },
];
const BASE: Record<Axis, number> = { Hydration: 64, "Even tone": 62, Smoothness: 66, Pores: 62, Calm: 68, "Sun defence": 60 };
const CONCERN: Record<Concern, { label: string; fx: Partial<Record<Axis, number>>; program: string; programName: string }> = {
  acne: { label: "Breakouts", fx: { Pores: -14, Smoothness: -8, Calm: -10 }, program: "clear-skin", programName: "Clear Skin" },
  pigment: { label: "Dark spots", fx: { "Even tone": -18, "Sun defence": -10 }, program: "even-tone", programName: "Even Tone" },
  aging: { label: "Lines & firmness", fx: { Smoothness: -12, Hydration: -8, "Sun defence": -8 }, program: "healthy-aging", programName: "Healthy Aging" },
  redness: { label: "Redness", fx: { Calm: -20 }, program: "clear-skin", programName: "Clear Skin" },
  dryness: { label: "Dryness", fx: { Hydration: -18, Calm: -4 }, program: "healthy-aging", programName: "Healthy Aging" },
};
const AGE: Record<Age, { label: string; fx: Partial<Record<Axis, number>> }> = {
  u30: { label: "Under 30", fx: { "Sun defence": 6, Smoothness: 5 } },
  "30": { label: "30–44", fx: {} },
  "45": { label: "45–59", fx: { Smoothness: -7, Hydration: -6, "Sun defence": -6 } },
  "60": { label: "60+", fx: { Smoothness: -11, Hydration: -10, "Sun defence": -10 } },
};
const TYPE: Record<Type, { label: string; fx: Partial<Record<Axis, number>> }> = {
  oily: { label: "Oily", fx: { Pores: -7, Hydration: 4 } },
  dry: { label: "Dry", fx: { Hydration: -10 } },
  combo: { label: "Combination", fx: { Pores: -3 } },
  sensitive: { label: "Sensitive", fx: { Calm: -9 } },
  normal: { label: "Not sure", fx: {} },
};

type Marker = { k: string; name: string; unit: string; min: number; max: number; lo: number; hi: number; def: number; low: string; high: string; ok: string; href: string; test: string };
const MARKERS: Marker[] = [
  { k: "vd", name: "Vitamin D", unit: "nmol/L", min: 0, max: 200, lo: 75, hi: 150, def: 52, low: "Low. Vitamin D helps skin repair and immunity, and is often low in Calgary winters.", high: "Above the usual range. Worth reviewing supplements with your practitioner.", ok: "In a healthy range.", href: "/tests#vitamin-d", test: "Vitamin D test" },
  { k: "fe", name: "Ferritin (iron stores)", unit: "µg/L", min: 0, max: 300, lo: 50, hi: 150, def: 38, low: "Low iron stores are a common, fixable cause of hair shedding and tired-looking skin.", high: "Higher than usual. Your practitioner will check why.", ok: "In a healthy range.", href: "/tests#essential-vitamin-health", test: "Essential vitamins panel" },
  { k: "co", name: "Morning cortisol", unit: "µg/dL", min: 0, max: 30, lo: 6, hi: 18, def: 21, low: "Lower than usual. Can go with fatigue; your practitioner will look at the whole picture.", high: "High stress hormone can slow healing and trigger breakouts and redness.", ok: "In a healthy range.", href: "/tests#cortisol", test: "Cortisol test" },
  { k: "mb", name: "Skin microbiome diversity", unit: "/10", min: 0, max: 10, lo: 6, hi: 10, def: 5.4, low: "Less variety of good bacteria on the skin often goes with sensitivity and breakouts.", high: "", ok: "A diverse, balanced skin microbiome.", href: "/tests#bioskin", test: "BioSkin test" },
];

const PLANS = [
  { k: "home", label: "Home routine only", gain: 0.12, tau: 60, note: "Good products, no root-cause testing." },
  { k: "nea", label: "NEA program", gain: 0.45, tau: 40, note: "Scan, in-clinic treatments, medical-grade routine." },
  { k: "full", label: "NEA program + nutrition", gain: 0.58, tau: 34, note: "Adds gut and nutrition work with a Registered Dietitian." },
] as const;

export function LiveReport() {
  const [concerns, setConcerns] = useState<Concern[]>(["pigment"]);
  const [age, setAge] = useState<Age>("30");
  const [type, setType] = useState<Type>("combo");
  const [tab, setTab] = useState<"scan" | "labs" | "plan">("scan");
  const [vals, setVals] = useState<Record<string, number>>(Object.fromEntries(MARKERS.map((m) => [m.k, m.def])));
  const [plan, setPlan] = useState<(typeof PLANS)[number]["k"]>("nea");
  const [adherence, setAdherence] = useState(85);

  const profile = useMemo(() => {
    const p = { ...BASE };
    const add = (fx: Partial<Record<Axis, number>>) => (Object.keys(fx) as Axis[]).forEach((a) => (p[a] += fx[a]!));
    concerns.forEach((c) => add(CONCERN[c].fx));
    add(AGE[age].fx);
    add(TYPE[type].fx);
    (Object.keys(p) as Axis[]).forEach((a) => (p[a] = Math.max(20, Math.min(95, Math.round(p[a])))));
    return p;
  }, [concerns, age, type]);
  const score = Math.round(Object.values(profile).reduce((a, b) => a + b, 0) / 6);
  const weakest = (Object.keys(profile) as Axis[]).sort((a, b) => profile[a] - profile[b]).slice(0, 2);
  const pl = PLANS.find((x) => x.k === plan)!;
  const proj = (gain: number, tau: number, adh: number) => [0, 15, 30, 45, 60, 75, 90].map((d) => Math.round(score + (100 - score) * gain * (adh / 100) * (1 - Math.exp(-d / tau))));
  const chosen = proj(pl.gain, pl.tau, adherence);
  const home = proj(PLANS[0].gain, PLANS[0].tau, 100);
  const flags = MARKERS.filter((m) => vals[m.k] < m.lo || vals[m.k] > m.hi);
  const main = CONCERN[concerns[0] ?? "pigment"];

  const toggle = (c: Concern) => setConcerns((s) => (s.includes(c) ? (s.length > 1 ? s.filter((x) => x !== c) : s) : [...s, c]));

  return (
    <div className="surface overflow-hidden rounded-[36px]">
      {/* inputs */}
      <div className="grid gap-5 border-b border-ink/[0.06] p-5 md:grid-cols-3 md:p-7">
        <Group label="What bothers you most?">
          {(Object.keys(CONCERN) as Concern[]).map((c) => (
            <Pill key={c} on={concerns.includes(c)} onClick={() => toggle(c)}>
              {CONCERN[c].label}
            </Pill>
          ))}
        </Group>
        <Group label="Your age">
          {(Object.keys(AGE) as Age[]).map((a) => (
            <Pill key={a} on={age === a} onClick={() => setAge(a)}>
              {AGE[a].label}
            </Pill>
          ))}
        </Group>
        <Group label="Your skin type">
          {(Object.keys(TYPE) as Type[]).map((t) => (
            <Pill key={t} on={type === t} onClick={() => setType(t)}>
              {TYPE[t].label}
            </Pill>
          ))}
        </Group>
      </div>

      {/* tabs */}
      <div className="flex gap-1 overflow-x-auto px-5 pt-5 md:px-7">
        {[
          { k: "scan", l: "1 · Your skin scan", i: <ScanFace className="h-4 w-4" /> },
          { k: "labs", l: `2 · Inside markers${flags.length ? ` (${flags.length} to watch)` : ""}`, i: <FlaskConical className="h-4 w-4" /> },
          { k: "plan", l: "3 · Your 90-day plan", i: <Route className="h-4 w-4" /> },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13.5px] transition", tab === t.k ? "bg-ink text-white" : "text-ink/70 hover:bg-white")}>
            {t.i} {t.l}
          </button>
        ))}
      </div>

      <div className="p-5 md:p-7">
        <AnimatePresence mode="wait">
          {tab === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <Radar className="mx-auto max-w-[400px]" showTarget={false} axes={AXES.map((a) => ({ label: a.k, value: profile[a.k], note: a.plain }))} />
                <p className="mt-2 text-center text-[12px] text-graphite">Typical starting point for someone like you · tap or hover a corner</p>
              </div>
              <div>
                <p className="text-[13px] text-graphite">Skin score for this profile</p>
                <p className="tabular font-display text-[4.5rem] leading-none text-ink">
                  {score}
                  <span className="text-[1.2rem] text-graphite">/100</span>
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-ink">
                  In plain words: the biggest gaps are <strong className="font-semibold">{weakest[0].toLowerCase()}</strong> and <strong className="font-semibold">{weakest[1].toLowerCase()}</strong>. The scan measures these layer by layer, including damage that is not visible yet.
                </p>
                <ul className="mt-5 space-y-2">
                  {AXES.map((a) => (
                    <li key={a.k} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-[13px] text-ink">{a.k}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-ink/[0.07]">
                        <motion.span className="block h-full rounded-full" style={{ background: weakest.includes(a.k) ? "rgb(var(--viz-watch))" : "rgb(var(--viz-1))" }} animate={{ width: `${profile[a.k]}%` }} transition={{ duration: 0.5 }} />
                      </span>
                      <span className="tabular w-8 text-right text-[13px] text-graphite">{profile[a.k]}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setTab("labs")} className="btn-ghost mt-6 !text-[13.5px]">
                  Next: what is behind it →
                </button>
              </div>
            </motion.div>
          )}

          {tab === "labs" && (
            <motion.div key="labs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="max-w-2xl text-[15px] text-graphite">Type in your own results if you have them (or keep the sample numbers). Each bar shows the healthy range as a shaded band and your number as a dot, and explains what it means for your skin.</p>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {MARKERS.map((m) => {
                  const v = vals[m.k];
                  const st = v < m.lo ? "low" : v > m.hi ? "high" : "ok";
                  const pct = (x: number) => ((Math.max(m.min, Math.min(m.max, x)) - m.min) / (m.max - m.min)) * 100;
                  return (
                    <li key={m.k} className="rounded-3xl border border-ink/[0.07] bg-white/70 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14.5px] text-ink">{m.name}</span>
                        <span className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={v}
                            step={m.max <= 10 ? 0.1 : 1}
                            min={m.min}
                            max={m.max}
                            onChange={(e) => setVals((s) => ({ ...s, [m.k]: Number(e.target.value) }))}
                            className="tabular w-20 rounded-xl border border-ink/10 bg-white px-2.5 py-1.5 text-right text-[15px] focus:border-flora focus:outline-none"
                            aria-label={`${m.name} value`}
                          />
                          <span className="w-12 text-[12px] text-graphite">{m.unit}</span>
                        </span>
                      </div>
                      <div className="relative mt-4 h-2.5 rounded-full bg-ink/[0.07]">
                        <div className="absolute inset-y-0 rounded-full bg-[rgb(var(--viz-good)/0.22)]" style={{ left: `${pct(m.lo)}%`, width: `${pct(m.hi) - pct(m.lo)}%` }} />
                        <motion.span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ background: st === "ok" ? "rgb(var(--viz-good))" : "rgb(var(--viz-watch))" }} animate={{ left: `${pct(v)}%` }} transition={{ type: "spring", stiffness: 140, damping: 18 }} />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-graphite">
                        <span>{m.min}</span>
                        <span>
                          healthy {m.lo}–{m.hi}
                        </span>
                        <span>{m.max}</span>
                      </div>
                      <p className={cn("mt-3 text-[13.5px] leading-snug", st === "ok" ? "text-graphite" : "text-ink")}>
                        <span className={cn("mr-1.5 inline-block rounded-full px-2 py-0.5 text-[11px]", st === "ok" ? "bg-[rgb(var(--viz-good)/0.14)] text-[rgb(var(--viz-good))]" : "bg-[rgb(var(--viz-watch)/0.14)] text-[rgb(var(--viz-watch))]")}>{st === "ok" ? "Healthy" : st === "low" ? "Low" : "High"}</span>
                        {st === "ok" ? m.ok : st === "low" ? m.low : m.high}
                      </p>
                      {st !== "ok" && (
                        <Link href={m.href} className="mt-2 inline-block text-[12.5px] text-flora hover:underline">
                          How NEA measures it: {m.test} →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-graphite">
                <CircleHelp className="h-3.5 w-3.5" /> Ranges are typical optimal ranges for skin health. Your NEA practitioner interprets your own results.
              </p>
              <button onClick={() => setTab("plan")} className="btn-ghost mt-5 !text-[13.5px]">
                Next: see your 90-day plan →
              </button>
            </motion.div>
          )}

          {tab === "plan" && (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[13px] text-graphite">Pick a plan</p>
                <div className="mt-2 space-y-2">
                  {PLANS.map((p) => (
                    <button key={p.k} onClick={() => setPlan(p.k)} className={cn("w-full rounded-2xl border px-4 py-3 text-left transition", plan === p.k ? "border-ink bg-white" : "border-ink/10 bg-white/50 hover:bg-white")}>
                      <span className="block text-[14.5px] text-ink">{p.label}</span>
                      <span className="block text-[12.5px] text-graphite">{p.note}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-5 block">
                  <span className="flex justify-between text-[13.5px] text-ink">
                    Visits and routine kept <span className="tabular font-medium">{adherence}%</span>
                  </span>
                  <input type="range" min={40} max={100} step={5} value={adherence} onChange={(e) => setAdherence(Number(e.target.value))} className="nea-range mt-2 w-full" style={{ ["--p" as string]: `${((adherence - 40) / 60) * 100}%` }} aria-label="Plan adherence" />
                </label>
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-[var(--glow-a)] to-[var(--glow-b)] p-5">
                  <p className="text-[13px] text-graphite">At day 90</p>
                  <p className="tabular font-display text-[3rem] leading-none text-ink">
                    {chosen[6]}
                    <span className="text-[1rem] text-graphite"> /100 · +{chosen[6] - score}</span>
                  </p>
                  <p className="mt-2 text-[13.5px] text-ink">That is {chosen[6] - home[6]} points more than a home routine alone.</p>
                </div>
              </div>
              <div>
                <TrendChart
                  series={[
                    { name: pl.label, values: chosen },
                    { name: "Home routine only", values: home },
                  ]}
                  labels={["Day 0", "Day 15", "Day 30", "Day 45", "Day 60", "Day 75", "Day 90"]}
                  min={Math.max(0, score - 10)}
                  max={100}
                  height={250}
                  caption="Skin score over 90 days. Dots at day 45 and 90 are re-scans in the real program."
                />
                <p className="mt-3 text-[12.5px] leading-relaxed text-graphite">
                  How it is calculated: improvement = (100 − today’s score) × plan strength × how much of the plan you keep, growing quickly at first and then levelling off. It shows the shape a plan usually takes, not a promise. Real results are measured on your own re-scans.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/programs/${main.program}`} className="btn-light !px-4 !py-2 !text-[13px]">
                    See the {main.programName} Program <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href="/skin-scan" className="btn-ghost !px-4 !py-2 !text-[13px]">
                    <Sparkles className="h-3.5 w-3.5" /> Get my real report, free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12.5px] text-graphite">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] transition", on ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/70 text-ink/80 hover:text-ink")}>
      {children}
    </button>
  );
}
