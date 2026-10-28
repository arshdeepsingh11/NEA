"use client";
import Link from "next/link";
import { ArrowUpRight, ScanFace, Sparkles } from "lucide-react";
import { useState } from "react";
import { LazyAnatomy } from "@/components/three/lazy";
import { useAi } from "@/components/ai/ai-provider";
import { SkinTwin } from "@/components/sim/skin-twin";
import { LiveReport } from "@/components/sim/live-report";
import { DiaTextReveal } from "@/components/motion/dia-text-reveal";
import type { Region } from "@/content/body";
import { cn } from "@/lib/utils";

/* ---------- 1. Skin Twin: habits in, skin out ---------- */
export function SystemsChapter() {
  return (
    <section className="chapter">
      <div className="container">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="eyebrow">Why NEA is different</p>
          <h2 className="mt-5 font-display text-display-lg text-ink">
            <DiaTextReveal>Your skin is the output.</DiaTextReveal>
            <br />
            <span className="text-graphite">Move the inputs and watch.</span>
          </h2>
          <p className="measure mt-5 text-lede text-graphite">This digital twin reacts to everyday habits the way real skin does. Slide sleep, sun, stress and food, and see glow, breakouts, spots and redness change, with a plain-language reason for every change.</p>
        </div>
        <SkinTwin />
      </div>
    </section>
  );
}

/* ---------- 2. The Skin Health Report, live ---------- */
export function SkinReportChapter() {
  return (
    <section className="chapter">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-2">
              <ScanFace className="h-3.5 w-3.5 text-flora" /> The free NEA Skin Health Report
            </p>
            <h2 className="mt-5 font-display text-display-lg text-ink">
              <DiaTextReveal>See what your mirror can’t.</DiaTextReveal>
            </h2>
            <p className="measure mt-5 text-lede text-graphite">Tell the report three things about you and it rebuilds itself: your skin fingerprint, your lab numbers in plain words, and a 90-day plan that changes as you choose.</p>
          </div>
          <Link href="/skin-scan" className="btn-light">
            Get my real report, free <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <LiveReport />
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
          <h2 className="mt-5 text-display-md font-semibold text-ink">Every zone of your face ages differently.</h2>
          <p className="measure mt-5 text-lede text-graphite">Lines start on the forehead, pigment on the cheeks, oil in the T-zone. Pick a zone to see what drives it and what treats it.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {zones.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn("chip !py-1.5 !text-[13px] transition", sel === x.id ? "!border-ink !bg-ink !text-white" : "hover:text-ink")}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.color }} />
                {x.name}
              </button>
            ))}
          </div>
          <div className="surface mt-6 rounded-3xl p-6">
            <p className="font-display text-xl font-semibold text-ink">{z.name}</p>
            <p className="mt-1 text-[15px] text-ink/90">{z.headline}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-graphite">{z.improve}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/body?mode=face&focus=${z.id}`} className="btn-ghost">
                Open in 3D <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button onClick={() => ai.open({ query: `What does NEA recommend for my ${z.name.toLowerCase()}?`, context: z.name })} className="btn-primary">
                <Sparkles className="h-4 w-4" /> Ask SI
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
