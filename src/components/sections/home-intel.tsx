"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { ArrowUpRight, Camera, ScanFace } from "lucide-react";
import { openMirror } from "@/components/face/open-mirror";
import { useState } from "react";
import { HoloPortrait, PartLayers } from "@/components/ui/holo-portrait";
import { AnimatePresence } from "framer-motion";
import { IMG } from "@/content/media";

/** Where each face zone sits on the portrait (% of the visible frame). */
const FACE_AT: Record<string, [number, number]> = { forehead: [58, 9], undereye: [36, 35], cheeks: [24, 53], tzone: [55, 45], mouth: [55, 71], jaw: [70, 90] };
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
          <p className="measure mt-5 text-lede text-graphite">Move the sliders for sleep, water, sun, stress and food, and watch the face change. Want to see it on you? Tap “Try it on my face”.</p>
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
          <p className="chip">Face map</p>
          <h2 className="mt-5 text-display-md font-semibold text-ink">Every zone of your face ages differently.</h2>
          <p className="measure mt-5 text-lede text-graphite">Lines start on the forehead, pigment on the cheeks, oil in the T-zone. Tap a zone on her face to open it, or use the glow preview to see that skin rested and bright.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {zones.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn("chip !py-1.5 !text-[13px] transition", sel === x.id ? "!border-ink !bg-ink !text-white" : "hover:text-ink")}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.color }} />
                {x.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <PartLayers
              key={z.id}
              className="mt-6"
              title={z.name}
              kicker={`Opened · ${z.headline}`}
              color={z.color}
              layers={[
                { label: "What it’s made of", items: z.madeOf.slice(0, 2) },
                { label: "What throws it off", items: z.disruptors.slice(0, 3) },
                { label: "How NEA treats it", items: [z.improve] },
              ]}
              footer={
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => openMirror(z.id)} className="btn-light">
                    <Camera className="h-4 w-4" /> Try it on your face
                  </button>
                  <button onClick={() => ai.open({ query: `What does NEA recommend for my ${z.name.toLowerCase()}?`, context: z.name })} className="btn-primary">
                    <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
                  </button>
                </div>
              }
            />
          </AnimatePresence>
        </div>
        <HoloPortrait
          src={IMG.faceMap}
          alt="A smiling woman, with the six face zones marked"
          aspect="4 / 5"
          position="50% 30%"
          className="mx-auto w-full max-w-[540px]"
          spots={zones.filter((x) => FACE_AT[x.id]).map((x) => ({ id: x.id, x: FACE_AT[x.id][0], y: FACE_AT[x.id][1], label: x.name, color: x.color }))}
          selected={sel}
          onSelect={setSel}
          badge="Nea SI face map"
        />
      </div>
    </section>
  );
}
