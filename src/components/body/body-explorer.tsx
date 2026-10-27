"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, FlaskConical, Layers, MousePointerClick, Rotate3d, ScanFace, Sparkles, Target, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LazyAnatomy } from "@/components/three/lazy";
import { useAi } from "@/components/ai/ai-provider";
import { Sparkline } from "@/components/viz/sparkline";
import type { Region } from "@/content/body";
import { cn } from "@/lib/utils";

export type RegionLinks = {
  treatments: { slug: string; title: string; summary: string }[];
  tests: { slug: string; name: string; price: number; bestFor: string }[];
  program?: { slug: string; name: string; priceFrom: number; duration: string };
};

type Mode = "body" | "face";
type View = "skin" | "holo";

// Decorative shapes for "what we track" rows; each tile is labelled, the line only shows that it is tracked over time.
const SHAPES = [
  [3, 4, 4, 6, 7, 9],
  [8, 7, 7, 5, 4, 3],
  [4, 5, 4, 6, 6, 8],
  [6, 5, 6, 7, 8, 8],
  [9, 7, 6, 6, 4, 3],
];

export function BodyExplorer({ body, face, links }: { body: Region[]; face: Region[]; links: Record<string, RegionLinks> }) {
  const ai = useAi();
  const [mode, setMode] = useState<Mode>("body");
  const [view, setView] = useState<View>("skin");
  const [sel, setSel] = useState<string | null>(null);
  // Phones: show only the selected label so the body stays readable.
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Deep links: /body?focus=gut or /body?mode=face&focus=cheeks
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = q.get("mode");
    const f = q.get("focus");
    const isFace = m === "face" || (f && face.some((r) => r.id === f));
    if (isFace) setMode("face");
    if (f && [...body, ...face].some((r) => r.id === f)) setSel(f);
  }, [body, face]);

  const regions = mode === "body" ? body : face;
  const region = useMemo(() => regions.find((r) => r.id === sel) ?? null, [regions, sel]);
  const l = region ? links[region.id] : undefined;

  const switchMode = (m: Mode) => {
    setMode(m);
    setSel(null);
  };

  return (
    <section className="relative">
      <div className="container">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Viewer */}
          <div className="surface relative h-[62dvh] min-h-[460px] overflow-hidden rounded-[32px] lg:h-[calc(100dvh-235px)] lg:min-h-[560px]">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(94,234,212,0.10),transparent_70%)]" />
            <LazyAnatomy key={mode} compact={small} mode={mode} regions={regions} view={view} selected={sel} onSelect={(id) => setSel((s) => (s === id ? null : id))} className="absolute inset-0" />

            <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-3">
              <Segmented
                value={mode}
                onChange={(v) => switchMode(v as Mode)}
                options={[
                  { v: "body", label: "Full body" },
                  { v: "face", label: "Face map" },
                ]}
              />
              <Segmented
                value={view}
                onChange={(v) => setView(v as View)}
                options={[
                  { v: "skin", label: "Realistic" },
                  { v: "holo", label: "AI hologram" },
                ]}
              />
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-4 text-[12px] text-graphite sm:flex">
              <span className="flex items-center gap-1.5">
                <Rotate3d className="h-3.5 w-3.5" /> Drag to rotate
              </span>
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="h-3.5 w-3.5" /> Click any part
              </span>
            </div>
          </div>

          {/* Info panel */}
          <div data-lenis-prevent className="surface relative overflow-y-auto rounded-[32px] p-6 sm:p-8 lg:h-[calc(100dvh-235px)] lg:min-h-[560px]">
            <AnimatePresence mode="wait">
              {region ? (
                <motion.article key={region.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  <button onClick={() => setSel(null)} className="mb-6 flex items-center gap-1.5 text-[13px] text-graphite hover:text-ink">
                    <ArrowLeft className="h-3.5 w-3.5" /> All {mode === "body" ? "regions" : "zones"}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: region.color, boxShadow: `0 0 12px ${region.color}` }} />
                    <span className="chip">{region.system}</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{region.name}</h2>
                  <p className="mt-2 text-[17px] leading-snug text-ink/90">{region.headline}</p>

                  <Block title="What it is made of" icon={<Layers className="h-4 w-4" />}>
                    <ul className="space-y-2.5">
                      {region.madeOf.map((m) => (
                        <li key={m} className="flex gap-3 text-[14.5px] leading-relaxed text-graphite">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: region.color }} />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </Block>

                  <Block title="What throws it off" icon={<TriangleAlert className="h-4 w-4" />}>
                    <div className="flex flex-wrap gap-2">
                      {region.disruptors.map((d) => (
                        <span key={d} className="chip !text-[12.5px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </Block>

                  <div className="aurora-border relative mt-7 rounded-2xl bg-white/60 p-5">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-flora">
                      <Target className="h-4 w-4" /> How NEA improves it
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink">{region.improve}</p>
                  </div>

                  {l && l.tests.length > 0 && (
                    <Block title="Measured with" icon={<FlaskConical className="h-4 w-4" />}>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {l.tests.map((t) => (
                          <Link key={t.slug} href={`/tests#${t.slug}`} className="group rounded-2xl border border-ink/10 bg-white/60 p-4 transition hover:border-ink/20 hover:bg-white/90">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[14.5px] font-medium text-ink">{t.name}</p>
                              <p className="tabular text-[13px] text-flora">${t.price.toLocaleString("en-CA")}</p>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[12.5px] text-graphite">{t.bestFor}</p>
                          </Link>
                        ))}
                      </div>
                    </Block>
                  )}

                  {l && l.treatments.length > 0 && (
                    <Block title="Treatments for this area">
                      <ul className="divide-y divide-ink/[0.07] rounded-2xl border border-ink/10">
                        {l.treatments.map((t) => (
                          <li key={t.slug}>
                            <Link href={`/treatments/${t.slug}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/90">
                              <span>
                                <span className="block text-[14.5px] text-ink">{t.title}</span>
                                <span className="block line-clamp-1 text-[12.5px] text-graphite">{t.summary}</span>
                              </span>
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-graphite" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Block>
                  )}

                  <Block title="What we track over time">
                    <div className="grid grid-cols-2 gap-2.5">
                      {region.tracks.map((t, i) => (
                        <div key={t} className="flex items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3">
                          <span className="text-[13px] text-ink">{t}</span>
                          <Sparkline values={SHAPES[i % SHAPES.length]} width={56} height={20} />
                        </div>
                      ))}
                    </div>
                  </Block>

                  {l?.program && (
                    <Link href={`/programs/${l.program.slug}`} className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-gradient-to-br from-flora/10 to-lumen/10 p-5 transition hover:border-ink/20">
                      <span>
                        <span className="stat-label">Recommended program</span>
                        <span className="mt-1 block font-display text-lg font-semibold text-ink">{l.program.name}</span>
                        <span className="text-[13px] text-graphite">
                          {l.program.duration} · from ${l.program.priceFrom.toLocaleString("en-CA")}
                        </span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-ink" />
                    </Link>
                  )}

                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={() => ai.open({ context: region.name, query: `What would NEA recommend for my ${region.name.toLowerCase()}?` })} className="btn-primary">
                      <Sparkles className="h-4 w-4" /> Ask AI about this
                    </button>
                    {mode === "body" && region.id === "face" ? (
                      <button onClick={() => switchMode("face")} className="btn-ghost">
                        <ScanFace className="h-4 w-4" /> Open face map
                      </button>
                    ) : (
                      <Link href="/skin-scan" className="btn-ghost">
                        <ScanFace className="h-4 w-4" /> Free skin scan
                      </Link>
                    )}
                  </div>
                </motion.article>
              ) : (
                <motion.div key={`list-${mode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="chip">
                    <Sparkles className="h-3 w-3 text-flora" /> {mode === "body" ? "10 systems" : "6 facial zones"}
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{mode === "body" ? "Tap any part of the body." : "Tap any zone of the face."}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-graphite">
                    {mode === "body"
                      ? "Each area shows what it is made of, what throws it off, and exactly how NEA measures and improves it."
                      : "The same map our advanced skin scan uses: what each zone is prone to, and the treatments that work there."}
                  </p>
                  <ul className="mt-7 space-y-2">
                    {regions.map((r) => (
                      <li key={r.id}>
                        <button onClick={() => setSel(r.id)} className="group flex w-full items-center gap-4 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-left transition hover:border-ink/20 hover:bg-white/90">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] text-ink">{r.name}</span>
                            <span className="block truncate text-[12.5px] text-graphite">{r.headline}</span>
                          </span>
                          <span className="text-[11px] text-graphite/80">{r.system}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-graphite opacity-0 transition group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <p className="mb-3 flex items-center gap-2 text-[13px] text-graphite">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <div role="tablist" className="glass flex rounded-full p-1">
      {options.map((o) => (
        <button key={o.v} role="tab" aria-selected={value === o.v} onClick={() => onChange(o.v)} className={cn("relative rounded-full px-4 py-1.5 text-[13px] transition", value === o.v ? "text-ink" : "text-graphite hover:text-ink")}>
          {value === o.v && <motion.span layoutId={`seg-${options[0].v}`} className="absolute inset-0 rounded-full" style={{ background: "var(--aurora)" }} transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
