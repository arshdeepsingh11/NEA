"use client";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Box, CalendarHeart, Check, ChevronRight, CircleHelp, FlaskConical, Layers, Maximize2, MousePointerClick, Rotate3d, ScanFace, Search, Sparkles, Target, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LazyAnatomy } from "@/components/three/lazy";
import { useAi } from "@/components/ai/ai-provider";
import { useBooking } from "@/components/booking/booking";
import { SkinLayers } from "./skin-layers";
import type { Region } from "@/content/body";
import { regionData } from "@/content/body-data";
import { cn, money } from "@/lib/utils";

export type RegionLinks = {
  treatments: { slug: string; title: string; summary: string }[];
  tests: { slug: string; name: string; price: number; bestFor: string }[];
  program?: { slug: string; name: string; priceFrom: number; duration: string };
};

type Mode = "body" | "face";
type View = "skin" | "inside" | "systems" | "holo";
const VIEWS: { v: View; label: string; hint: string }[] = [
  { v: "skin", label: "Realistic", hint: "Real skin, studio light" },
  { v: "inside", label: "Inside", hint: "Glass skin, organs visible" },
  { v: "systems", label: "Systems", hint: "Every system in its colour" },
  { v: "holo", label: "Nea SI hologram", hint: "Scanning hologram" },
];
const SKIN_IDS = new Set(["face", "forehead", "undereye", "cheeks", "tzone", "mouth", "jaw", "thighs"]);

export function BodyExplorer({ body, face, links }: { body: Region[]; face: Region[]; links: Record<string, RegionLinks> }) {
  const [mode, setMode] = useState<Mode>("body");
  const [view, setView] = useState<View>("skin");
  const [sel, setSel] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sys, setSys] = useState<string>("All");
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Deep links: /body?focus=gut, /body?mode=face&focus=cheeks, /body?open=liver
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("focus") ?? p.get("open");
    const isFace = p.get("mode") === "face" || (f && face.some((r) => r.id === f));
    if (isFace) setMode("face");
    const v = p.get("view");
    if (v && VIEWS.some((x) => x.v === v)) setView(v as View);
    if (f && [...body, ...face].some((r) => r.id === f)) {
      setSel(f);
      if (p.get("open")) setOpen(f);
    }
  }, [body, face]);

  const regions = mode === "body" ? body : face;
  const systems = useMemo(() => ["All", ...Array.from(new Set(regions.map((r) => r.system)))], [regions]);
  const listed = regions.filter((r) => (sys === "All" || r.system === sys) && (!q.trim() || `${r.name} ${r.headline} ${r.system} ${r.disruptors.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase())));
  const region = regions.find((r) => r.id === sel) ?? null;
  const all = [...body, ...face];

  const switchMode = (m: Mode) => {
    setMode(m);
    setSel(null);
    setSys("All");
  };

  return (
    <section className="relative">
      <div className="container">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Viewer */}
          <div className="surface relative h-[64dvh] min-h-[480px] overflow-hidden rounded-[32px] lg:h-[calc(100dvh-235px)] lg:min-h-[600px]">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgb(var(--c-accent)/0.10),transparent_70%)]" />
            <LazyAnatomy key={mode} compact={small} mode={mode} regions={regions} view={view} selected={sel} onSelect={(id) => setSel((s) => (s === id ? null : id))} className="absolute inset-0" />

            <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-3">
              <Segmented value={mode} onChange={(v) => switchMode(v as Mode)} options={[{ v: "body", label: "Full body" }, { v: "face", label: "Face map" }]} />
              <Segmented value={view} onChange={(v) => setView(v as View)} options={(mode === "face" ? VIEWS.filter((x) => x.v !== "inside") : VIEWS).map((x) => ({ v: x.v, label: x.label, title: x.hint }))} />
            </div>

            <AnimatePresence>
              {region && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="glass absolute bottom-4 left-4 right-4 flex items-center gap-4 rounded-3xl p-4 sm:right-auto sm:w-[380px]">
                  <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ background: region.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] text-graphite">{region.system}{region.inside ? " · inside the body" : ""}</p>
                    <p className="truncate font-display text-[1.35rem] leading-tight text-ink">{region.name}</p>
                  </div>
                  <button onClick={() => setOpen(region.id)} className="btn-light shrink-0 !px-4 !py-2 !text-[13px]">
                    <Maximize2 className="h-3.5 w-3.5" /> Open
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!region && (
              <div className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-4 text-[12px] text-graphite sm:flex">
                <span className="flex items-center gap-1.5">
                  <Rotate3d className="h-3.5 w-3.5" /> Drag to rotate
                </span>
                <span className="flex items-center gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5" /> Click any part, then Open
                </span>
                {mode === "body" && (
                  <span className="flex items-center gap-1.5">
                    <Box className="h-3.5 w-3.5" /> Try “Inside” to see organs
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Region index */}
          <div data-lenis-prevent className="surface relative flex flex-col overflow-hidden rounded-[32px] lg:h-[calc(100dvh-235px)] lg:min-h-[600px]">
            <div className="border-b border-ink/[0.06] p-5">
              <p className="eyebrow">{mode === "body" ? `${body.length} systems · ${body.filter((r) => r.inside).length} inside the body` : `${face.length} facial zones`}</p>
              <label className="mt-3 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/70 px-3.5 py-2.5">
                <Search className="h-4 w-4 text-graphite" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={mode === "body" ? "Search: stress, hair, bloating, melasma…" : "Search: lines, oil, spots…"} className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" />
              </label>
              <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
                {systems.map((s) => (
                  <button key={s} onClick={() => setSys(s)} className={cn("shrink-0 rounded-full px-3 py-1 text-[12.5px] transition", sys === s ? "bg-ink text-white" : "bg-ink/[0.05] text-ink/70 hover:text-ink")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <ul className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {listed.map((r) => {
                const d = regionData[r.id];
                const on = sel === r.id;
                return (
                  <li key={r.id}>
                    <div className={cn("group rounded-2xl border transition", on ? "border-ink/20 bg-white" : "border-transparent hover:bg-white/70")}>
                      <button onClick={() => setSel(on ? null : r.id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-[15px] text-ink">
                            {r.name}
                            {r.inside && <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[10px] text-graphite">inside</span>}
                          </span>
                          <span className="block truncate text-[12.5px] text-graphite">{r.headline}</span>
                        </span>
                        <ChevronRight className={cn("h-4 w-4 shrink-0 text-graphite transition", on && "rotate-90")} />
                      </button>
                      <AnimatePresence>
                        {on && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-3.5 pb-3.5">
                              {d && (
                                <div className="grid grid-cols-3 gap-2">
                                  {d.stats.slice(0, 3).map((s) => (
                                    <div key={s.l} className="rounded-xl bg-ink/[0.035] p-2.5">
                                      <p className="font-display text-[1.15rem] leading-none text-ink">{s.v}</p>
                                      <p className="mt-1 text-[10.5px] leading-tight text-graphite">{s.l}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="mt-3 text-[13px] leading-snug text-ink/90">{r.improve}</p>
                              <button onClick={() => setOpen(r.id)} className="btn-light mt-3 !px-4 !py-2 !text-[13px]">
                                <Maximize2 className="h-3.5 w-3.5" /> Open full view
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
              {!listed.length && <li className="p-4 text-[13.5px] text-graphite">Nothing matches. Try another word, or ask Nea SI.</li>}
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>{open && <RegionDetail key={open} region={all.find((r) => r.id === open)!} siblings={body.some((r) => r.id === open) ? body : face} links={links} onClose={() => setOpen(null)} onGo={(id) => (setSel(id), setOpen(id))} />}</AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Full view of one region: its own 3D close-up plus six tabs of detail  */
/* ------------------------------------------------------------------ */
type Tab = "overview" | "inside" | "signs" | "numbers" | "care" | "faq";
function RegionDetail({ region, siblings, links, onClose, onGo }: { region: Region; siblings: Region[]; links: Record<string, RegionLinks>; onClose: () => void; onGo: (id: string) => void }) {
  const ai = useAi();
  const book = useBooking();
  const [tab, setTab] = useState<Tab>("overview");
  const [ticked, setTicked] = useState<string[]>([]);
  const [view, setView] = useState<View>(region.inside ? "inside" : "skin");
  const d = regionData[region.id];
  const l = links[region.id];
  const isFace = !["scalp", "face", "neck", "chest", "arms", "gut", "pelvis", "thighs", "knees", "feet", "brain", "liver", "adrenals"].includes(region.id);
  const showLayers = SKIN_IDS.has(region.id);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const tabs: { k: Tab; l: string; show: boolean }[] = [
    { k: "overview", l: "Overview", show: true },
    { k: "inside", l: showLayers ? "Layers" : "How it works", show: true },
    { k: "signs", l: "Signs", show: !!d?.signs.length },
    { k: "numbers", l: "Numbers", show: !!d },
    { k: "care", l: "Treat & test", show: true },
    { k: "faq", l: "Questions", show: !!d?.faq.length },
  ];
  const idx = siblings.findIndex((r) => r.id === region.id);
  const prev = siblings[(idx - 1 + siblings.length) % siblings.length];
  const next = siblings[(idx + 1) % siblings.length];

  return (
    <motion.div className="fixed inset-0 z-[85] flex items-end justify-center bg-ink/25 backdrop-blur-md sm:items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={region.name}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="surface !bg-[rgb(var(--c-bg)/0.97)] grid h-[94dvh] w-full max-w-6xl overflow-hidden rounded-t-[32px] sm:h-[88vh] sm:rounded-[32px] lg:grid-cols-[1fr_1.05fr]"
      >
        {/* 3D close-up */}
        <div className="relative h-[38vh] min-h-[260px] border-b border-ink/[0.06] lg:h-auto lg:border-b-0 lg:border-r">
          <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 45%, color-mix(in srgb, ${region.color} 18%, transparent), transparent 70%)` }} />
          <LazyAnatomy mode={isFace ? "face" : "body"} regions={siblings} view={view} selected={region.id} onSelect={(id) => id !== region.id && onGo(id)} showLabels={false} className="absolute inset-0" />
          <div className="absolute left-4 top-4">
            <Segmented value={view} onChange={(v) => setView(v as View)} options={(isFace ? VIEWS.filter((x) => x.v !== "inside") : VIEWS).map((x) => ({ v: x.v, label: x.label }))} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <button onClick={() => onGo(prev.id)} className="glass rounded-full px-3.5 py-2 text-[12.5px] text-ink">
              ← {prev.name}
            </button>
            <button onClick={() => onGo(next.id)} className="glass rounded-full px-3.5 py-2 text-[12.5px] text-ink">
              {next.name} →
            </button>
          </div>
        </div>

        {/* detail */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 p-6 pb-3 sm:p-8 sm:pb-4">
            <div>
              <p className="flex items-center gap-2 text-[12.5px] text-graphite">
                <span className="h-2 w-2 rounded-full" style={{ background: region.color }} />
                {region.system}
                {region.inside ? " · inside the body" : ""}
              </p>
              <h2 className="mt-2 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1] text-ink">{region.name}</h2>
              <p className="mt-2 text-[16px] text-graphite">{region.headline}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/70 text-graphite hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-6 sm:px-8">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={cn("relative shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition", tab === t.k ? "text-white" : "text-ink/70 hover:text-ink")}>
                  {tab === t.k && <motion.span layoutId="rd-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{t.l}</span>
                </button>
              ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {tab === "overview" && (
                  <div className="space-y-6">
                    {d && (
                      <div className="grid grid-cols-3 gap-2.5">
                        {d.stats.map((s) => (
                          <div key={s.l} className="rounded-2xl border border-ink/[0.07] bg-white/70 p-3.5">
                            <p className="font-display text-[1.6rem] leading-none text-ink">{s.v}</p>
                            <p className="mt-1.5 text-[11.5px] leading-snug text-graphite">{s.l}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Block icon={<Target className="h-4 w-4" />} title="How NEA improves it">
                      <p className="text-[15px] leading-relaxed text-ink">{region.improve}</p>
                    </Block>
                    {d && (
                      <Block icon={<Sparkles className="h-4 w-4" />} title="When you usually notice a change">
                        <p className="text-[15px] leading-relaxed text-ink">{d.results}</p>
                      </Block>
                    )}
                    {l?.program && (
                      <Link href={`/programs/${l.program.slug}`} onClick={onClose} className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-[var(--glow-a)] to-[var(--glow-b)] p-5">
                        <span>
                          <span className="block text-[12px] text-graphite">Recommended program</span>
                          <span className="font-display text-[1.4rem] text-ink">{l.program.name}</span>
                          <span className="block text-[13px] text-graphite">
                            {l.program.duration} · from {money(l.program.priceFrom)}
                          </span>
                        </span>
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                )}

                {tab === "inside" && (
                  <div className="space-y-6">
                    {showLayers && <SkinLayers />}
                    <Block icon={<Layers className="h-4 w-4" />} title="What it is made of">
                      <ul className="space-y-2.5">
                        {region.madeOf.map((m) => (
                          <li key={m} className="flex gap-3 text-[14.5px] leading-relaxed text-ink/90">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: region.color }} />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </Block>
                    <Block icon={<TriangleAlert className="h-4 w-4" />} title="What throws it off">
                      <div className="flex flex-wrap gap-2">
                        {region.disruptors.map((x) => (
                          <span key={x} className="chip !text-[12.5px]">
                            {x}
                          </span>
                        ))}
                      </div>
                    </Block>
                  </div>
                )}

                {tab === "signs" && d && (
                  <div>
                    <p className="text-[14px] text-graphite">Tick what sounds like you. Nea SI uses it to point you to the right next step.</p>
                    <ul className="mt-4 space-y-2">
                      {d.signs.map((s) => {
                        const on = ticked.includes(s);
                        return (
                          <li key={s}>
                            <button onClick={() => setTicked((t) => (on ? t.filter((x) => x !== s) : [...t, s]))} className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[14.5px] transition", on ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/70 hover:bg-white")}>
                              <span className={cn("grid h-5 w-5 place-items-center rounded-md border", on ? "border-white bg-white text-ink" : "border-ink/20")}>{on && <Check className="h-3.5 w-3.5" />}</span>
                              {s}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <AnimatePresence>
                      {ticked.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-2xl bg-gradient-to-br from-[var(--glow-a)] to-[var(--glow-b)] p-5">
                          <p className="text-[13px] text-graphite">
                            You ticked {ticked.length} of {d.signs.length}
                          </p>
                          <p className="mt-1 text-[15px] leading-relaxed text-ink">
                            {ticked.length >= Math.ceil(d.signs.length / 2)
                              ? `That pattern is worth measuring. ${l?.tests[0] ? `A ${l.tests[0].name} test` : "A free skin scan"} would show what is driving it.`
                              : "Worth keeping an eye on. A free skin scan gives you a baseline to compare against."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => ai.open({ context: region.name, query: `I have these signs: ${ticked.join(", ")}. What should I do?` })} className="btn-light !px-4 !py-2 !text-[13px]">
                              <NeaSiIcon className="h-3.5 w-3.5" /> Ask Nea SI about my signs
                            </button>
                            <Link href="/skin-scan" onClick={onClose} className="btn-ghost !px-4 !py-2 !text-[13px]">
                              <ScanFace className="h-3.5 w-3.5" /> Free skin scan
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {tab === "numbers" && d && (
                  <div className="space-y-6">
                    {d.markers && (
                      <Block icon={<FlaskConical className="h-4 w-4" />} title="What NEA measures">
                        <ul className="divide-y divide-ink/[0.06] rounded-2xl border border-ink/[0.07] bg-white/70">
                          {d.markers.map((m) => (
                            <li key={m.name} className="px-4 py-3">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="text-[14.5px] text-ink">{m.name}</span>
                                <span className="text-[12.5px] text-graphite">{m.range}</span>
                              </div>
                              <p className="mt-0.5 text-[13px] text-graphite">{m.why}</p>
                            </li>
                          ))}
                        </ul>
                      </Block>
                    )}
                    <Block icon={<Sparkles className="h-4 w-4" />} title="What we track over time">
                      <div className="flex flex-wrap gap-2">
                        {region.tracks.map((t) => (
                          <span key={t} className="chip !py-1.5 !text-[13px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </Block>
                    <TimelineBar />
                  </div>
                )}

                {tab === "care" && (
                  <div className="space-y-6">
                    {l && l.treatments.length > 0 && (
                      <Block icon={<Target className="h-4 w-4" />} title="Treatments for this area">
                        <ul className="space-y-2">
                          {l.treatments.map((t) => (
                            <li key={t.slug} className="flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/70 p-3.5">
                              <Link href={`/treatments/${t.slug}`} onClick={onClose} className="min-w-0 flex-1">
                                <span className="block text-[14.5px] text-ink hover:underline">{t.title}</span>
                                <span className="block truncate text-[12.5px] text-graphite">{t.summary}</span>
                              </Link>
                              <button onClick={() => book.open(t.slug, t.title.split(" (")[0])} className="btn-light shrink-0 !px-3.5 !py-1.5 !text-[12.5px]">
                                <CalendarHeart className="h-3.5 w-3.5" /> Book
                              </button>
                            </li>
                          ))}
                        </ul>
                      </Block>
                    )}
                    {l && l.tests.length > 0 && (
                      <Block icon={<FlaskConical className="h-4 w-4" />} title="Tests by BioAro Labs">
                        <ul className="divide-y divide-ink/[0.06] rounded-2xl border border-ink/[0.07] bg-white/70">
                          {l.tests.map((t) => (
                            <li key={t.slug}>
                              <Link href={`/tests#${t.slug}`} onClick={onClose} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white">
                                <span>
                                  <span className="block text-[14.5px] text-ink">{t.name}</span>
                                  <span className="block text-[12.5px] text-graphite">{t.bestFor}</span>
                                </span>
                                <span className="tabular font-display text-[1.2rem]">{money(t.price)}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Block>
                    )}
                  </div>
                )}

                {tab === "faq" && d && (
                  <div className="space-y-3">
                    {d.faq.map((f) => (
                      <details key={f.q} className="group rounded-2xl border border-ink/[0.07] bg-white/70 p-4" open>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] text-ink">
                          <span className="flex items-center gap-2">
                            <CircleHelp className="h-4 w-4 text-flora" /> {f.q}
                          </span>
                        </summary>
                        <p className="mt-2 text-[14px] leading-relaxed text-graphite">{f.a}</p>
                      </details>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-ink/[0.06] p-4 sm:px-8">
            <button onClick={() => book.open(l?.program?.slug ?? l?.treatments[0]?.slug, region.name)} className="btn-light !px-4 !py-2 !text-[13px]">
              <CalendarHeart className="h-4 w-4" /> Book
            </button>
            <button onClick={() => ai.open({ context: region.name, query: `Tell me more about my ${region.name.toLowerCase()} and what NEA would do.` })} className="btn-primary !px-4 !py-2 !text-[13px]">
              <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TimelineBar() {
  const steps = [
    { d: "Day 0", l: "Scan & tests" },
    { d: "Week 2", l: "First treatment" },
    { d: "Day 45", l: "Re-scan" },
    { d: "Day 90", l: "Results report" },
  ];
  return (
    <div>
      <p className="mb-3 text-[13px] text-graphite">How it is tracked</p>
      <ol className="relative grid grid-cols-4 gap-2">
        <span aria-hidden className="absolute left-[12%] right-[12%] top-[9px] h-[2px] rounded-full [background:var(--aurora-deep)] opacity-60" />
        {steps.map((s) => (
          <li key={s.d} className="relative text-center">
            <span className="mx-auto block h-5 w-5 rounded-full border-4 border-white bg-[rgb(var(--c-accent))] shadow" />
            <span className="mt-2 block text-[12.5px] font-medium text-ink">{s.d}</span>
            <span className="block text-[11.5px] text-graphite">{s.l}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[13px] text-graphite [&>svg]:text-flora">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string; title?: string }[] }) {
  return (
    <div role="tablist" className="glass no-scrollbar flex max-w-full overflow-x-auto rounded-full p-1">
      {options.map((o) => (
        <button key={o.v} role="tab" title={o.title} aria-selected={value === o.v} onClick={() => onChange(o.v)} className={cn("relative shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] transition", value === o.v ? "text-white" : "text-ink/70 hover:text-ink")}>
          {value === o.v && <motion.span layoutId={`seg-${options.map((x) => x.v).join("")}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
