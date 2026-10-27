"use client";
import Link from "next/link";
import { ArrowUpRight, Droplets, ScanFace, Sun, Timer, Sparkles } from "lucide-react";
import { useState } from "react";
import { LazyAnatomy } from "@/components/three/lazy";
import { useAi } from "@/components/ai/ai-provider";
import { Radar } from "@/components/viz/radar";
import { RangeBars } from "@/components/viz/range-bars";
import { Sparkline } from "@/components/viz/sparkline";
import { TrendChart } from "@/components/viz/trend-chart";
import { SystemsNetwork } from "@/components/viz/systems-network";
import type { Region } from "@/content/body";
import { cn } from "@/lib/utils";

/* ---------- 1. Systems network ---------- */
export function SystemsChapter() {
  return (
    <section className="chapter">
      <div className="container">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="chip">Why NEA is different</p>
          <h2 className="mt-5 text-display-md font-semibold text-white">Your skin is the output. These are the inputs.</h2>
          <p className="measure mt-5 text-lede text-graphite">Most clinics treat the surface. We measure the six systems that feed it, so the treatment works and the result lasts.</p>
        </div>
        <SystemsNetwork />
      </div>
    </section>
  );
}

/* ---------- 2. Sample Skin Health Report ---------- */
const SAMPLE_RADAR = [
  { label: "Hydration", value: 58, target: 80, note: "Barrier loses water in dry air" },
  { label: "Evenness", value: 46, target: 74, note: "Early pigment under the surface" },
  { label: "Texture", value: 63, target: 80 },
  { label: "Pores", value: 52, target: 70 },
  { label: "Redness", value: 71, target: 82 },
  { label: "UV defence", value: 49, target: 72, note: "Sun damage not yet visible" },
];
const SAMPLE_MARKERS = [
  { name: "Vitamin D", value: 52, unit: "nmol/L", min: 0, max: 200, optimal: [75, 150] as [number, number] },
  { name: "Ferritin (iron stores)", value: 38, unit: "µg/L", min: 0, max: 300, optimal: [50, 150] as [number, number] },
  { name: "Skin microbiome diversity", value: 6.8, unit: "index", min: 0, max: 10, optimal: [6, 9] as [number, number] },
  { name: "Morning cortisol", value: 14, unit: "µg/dL", min: 0, max: 30, optimal: [6, 18] as [number, number] },
];

export function SkinReportChapter() {
  const tiles = [
    { label: "Overall skin score", value: "62", unit: "/100", icon: <Sparkles className="h-4 w-4" />, spark: [55, 57, 56, 59, 60, 62] },
    { label: "Hydration", value: "58", unit: "%", icon: <Droplets className="h-4 w-4" />, spark: [50, 52, 54, 53, 56, 58] },
    { label: "UV damage", value: "Moderate", unit: "", icon: <Sun className="h-4 w-4" />, spark: [7, 6, 6, 5, 5, 4] },
    { label: "Skin age vs actual", value: "+4", unit: " yrs", icon: <Timer className="h-4 w-4" />, spark: [6, 6, 5, 5, 4, 4] },
  ];
  return (
    <section className="chapter">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="chip">
              <ScanFace className="h-3.5 w-3.5 text-flora" /> The free NEA Skin Health Report
            </p>
            <h2 className="mt-5 text-display-md font-semibold text-white">See what your mirror can’t.</h2>
            <p className="measure mt-5 text-lede text-graphite">A 15-minute advanced scan becomes a report like this: six skin layers, optional lab markers, and a plan with a measurable goal.</p>
          </div>
          <Link href="/skin-scan" className="btn-primary">
            Get my free report <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="surface relative overflow-hidden rounded-[36px] p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
            <p className="flex items-center gap-2 text-[13px] text-graphite">
              <span className="h-2 w-2 rounded-full bg-flora" /> Sample report · fictional client, for illustration
            </p>
            <p className="tabular text-[12px] text-graphite">Scan #1 · Day 0</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
                <p className="flex items-center gap-2 text-[12.5px] text-graphite">
                  <span className="text-flora">{t.icon}</span>
                  {t.label}
                </p>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="tabular font-display text-3xl font-semibold text-white">
                    {t.value}
                    <span className="text-[14px] font-normal text-graphite">{t.unit}</span>
                  </p>
                  <Sparkline values={t.spark} width={70} height={24} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
              <p className="font-display text-lg font-semibold text-white">Skin fingerprint</p>
              <p className="text-[13px] text-graphite">Six layers from the scan, scored 0–100.</p>
              <Radar className="mx-auto mt-2 max-w-[360px]" axes={SAMPLE_RADAR} />
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
                <p className="font-display text-lg font-semibold text-white">Inside-out markers</p>
                <p className="mb-5 text-[13px] text-graphite">Optional BioAro tests that explain what the scan sees.</p>
                <RangeBars markers={SAMPLE_MARKERS} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
            <p className="mb-4 font-display text-lg font-semibold text-white">Projected skin score</p>
            <TrendChart
              series={[
                { name: "With NEA plan", values: [62, 66, 70, 74, 77, 80, 82] },
                { name: "Routine only", values: [62, 62, 63, 63, 63, 64, 64] },
              ]}
              labels={["Day 0", "Day 15", "Day 30", "Day 45", "Day 60", "Day 75", "Day 90"]}
              projectFrom={0}
              min={50}
              max={90}
              height={200}
              caption="Illustrative projection for the sample client. Your report shows your own numbers, re-scanned at day 45 and day 90."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Face map teaser ---------- */
export function FaceMapChapter({ zones }: { zones: Region[] }) {
  const ai = useAi();
  const [sel, setSel] = useState<string>("cheeks");
  const z = zones.find((x) => x.id === sel) ?? zones[0];
  return (
    <section className="chapter">
      <div className="container grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="chip">3D face map</p>
          <h2 className="mt-5 text-display-md font-semibold text-white">Every zone of your face ages differently.</h2>
          <p className="measure mt-5 text-lede text-graphite">Lines start on the forehead, pigment on the cheeks, oil in the T-zone. Pick a zone to see what drives it and what treats it.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {zones.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn("chip !py-1.5 !text-[13px] transition", sel === x.id ? "!border-white/40 !bg-white/15 !text-white" : "hover:text-white")}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.color }} />
                {x.name}
              </button>
            ))}
          </div>
          <div className="surface mt-6 rounded-3xl p-6">
            <p className="font-display text-xl font-semibold text-white">{z.name}</p>
            <p className="mt-1 text-[15px] text-ink/90">{z.headline}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-graphite">{z.improve}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/body?mode=face&focus=${z.id}`} className="btn-ghost">
                Open in 3D <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button onClick={() => ai.open({ query: `What does NEA recommend for my ${z.name.toLowerCase()}?`, context: z.name })} className="btn-primary">
                <Sparkles className="h-4 w-4" /> Ask AI
              </button>
            </div>
          </div>
        </div>
        <div className="surface relative h-[520px] overflow-hidden rounded-[36px] lg:h-[620px]">
          <LazyAnatomy mode="face" view="holo" compact regions={zones} selected={sel} onSelect={setSel} className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
