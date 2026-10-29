"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Activity, Apple, ArrowUpRight, Brain, CalendarHeart, Clock, Dna, Droplet, Globe2, HeartPulse, Hourglass, Layers, PersonStanding, Search, ShoppingBag, Sprout, X } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import { buyUrl, testPhoto, type LabTest, type TestGroup } from "@/content/tests";
import { cn, money } from "@/lib/utils";

type Group = { id: TestGroup; label: string; blurb: string; system: string };
type Region = { id: string; name: string };

const ICON: Record<TestGroup, typeof Activity> = { microbiome: Sprout, hormones: Activity, nutrition: Apple, aging: Hourglass, organs: HeartPulse, brain: Brain, genetics: Dna };
const HUE: Record<TestGroup, string> = { microbiome: "110 139 78", hormones: "181 86 111", nutrition: "176 132 51", aging: "169 83 58", organs: "184 69 90", brain: "72 103 184", genetics: "96 84 170" };

/** Everyday words → the tests that answer them. */
const CONCERNS: { label: string; words: string; tests: string[] }[] = [
  { label: "Acne", words: "acne breakouts pimples spots oily", tests: ["bioskin", "hormone-health", "biogut", "dhea-s", "total-testosterone", "hs-crp"] },
  { label: "Hair thinning", words: "hair loss thinning shedding bald", tests: ["dht", "ultra-hormone-health", "vitamin-d", "core-amino-acid", "disease-based-dna"] },
  { label: "Bloating & gut", words: "bloating gut digestion ibs stomach", tests: ["biogut", "core-amino-acid", "hs-crp"] },
  { label: "Tired all the time", words: "tired fatigue energy exhausted stress sleep", tests: ["cortisol", "vitamin-d", "essential-vitamin-health", "hormone-health", "advanced-amino-acid"] },
  { label: "Aging & longevity", words: "aging longevity wrinkles age biological", tests: ["telomere-length", "core-inflammation-aging", "ultra-inflammation-aging", "gdf-15", "brain-health"] },
  { label: "Feminine health", words: "vaginal uti yeast bv cycle period fertility perimenopause", tests: ["biofemme", "estradiol", "progesterone", "ultra-hormone-health"] },
  { label: "Redness & rosacea", words: "redness rosacea flushing eczema irritation", tests: ["bioskin", "hs-crp", "il-6", "biogut"] },
  { label: "Heart & metabolism", words: "heart cholesterol weight metabolism diabetes blood sugar kidney", tests: ["pai-1", "hs-crp", "cystatin-c", "advanced-inflammation-aging", "advanced-amino-acid"] },
  { label: "Memory", words: "memory brain focus cognitive alzheimer", tests: ["brain-health", "p-tau217", "beta-amyloid"] },
  { label: "Medicines & DNA", words: "medication medicine drug genes dna genetic family inherited", tests: ["pharmacogenomics", "wgs-30x", "disease-based-dna"] },
];

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);

/** Ranks every test for a free-text concern; returns 0–100 per slug. */
function rank(tests: LabTest[], q: string): Record<string, number> {
  const qw = words(q);
  if (!qw.length) return {};
  const raw: Record<string, number> = {};
  for (const c of CONCERNS) {
    const hit = qw.some((w) => c.label.toLowerCase().includes(w) || c.words.split(" ").some((cw) => cw.startsWith(w) || w.startsWith(cw)));
    if (hit) c.tests.forEach((s, i) => (raw[s] = (raw[s] ?? 0) + 6 - Math.min(i, 4)));
  }
  for (const t of tests) {
    const name = words(t.name);
    const body = words(`${t.bestFor} ${t.plain} ${t.neaUse} ${t.group}`);
    for (const w of qw) {
      if (name.some((n) => n.startsWith(w))) raw[t.slug] = (raw[t.slug] ?? 0) + 5;
      else if (body.some((b) => b.startsWith(w))) raw[t.slug] = (raw[t.slug] ?? 0) + 1.5;
    }
  }
  const top = Math.max(0, ...Object.values(raw));
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.round(55 + (v / top) * 44)]));
}

export function TestStore({ tests, groups, regionsByTest = {} }: { tests: LabTest[]; groups: Group[]; regionsByTest?: Record<string, Region[]> }) {
  const [sys, setSys] = useState<TestGroup | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const scores = useMemo(() => rank(tests, q), [tests, q]);
  const searching = Object.keys(scores).length > 0;
  const shown = useMemo(() => {
    let list = sys === "all" ? tests : tests.filter((t) => t.group === sys);
    if (searching) list = list.filter((t) => scores[t.slug]).sort((a, b) => scores[b.slug] - scores[a.slug]);
    return list;
  }, [tests, sys, scores, searching]);
  const cur = tests.find((t) => t.slug === open);
  const groupOf = Object.fromEntries(groups.map((g) => [g.id, g]));

  // deep links: /tests#bioskin opens that test
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (h && tests.some((t) => t.slug === h)) setOpen(h);
  }, [tests]);

  return (
    <div>
      {/* Concern scanner */}
      <div className="relative overflow-hidden rounded-[32px] border border-ink/[0.07] bg-white p-5 shadow-[0_30px_80px_-50px_rgba(var(--shadow-tint),0.6)] md:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl" style={{ background: "var(--aurora)" }} />
        <p className="relative text-[12px] uppercase tracking-[0.18em] text-graphite">{tests.length} tests · one blood draw, swab or sample away</p>
        <label className="relative mt-3 flex items-center gap-3 rounded-2xl border border-ink/10 bg-porcelain/60 px-4 py-3.5 focus-within:border-ink/30">
          <Search className="h-5 w-5 shrink-0 text-graphite" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to understand? Try “hair thinning” or “always tired”" className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-graphite/70" aria-label="Search tests by concern" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.06] text-ink/70 hover:bg-ink/10">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        <div className="relative mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {CONCERNS.map((c) => (
            <button key={c.label} onClick={() => setQ(q === c.label ? "" : c.label)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition", q === c.label ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/80 hover:border-ink/25")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body systems */}
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        <SystemTile on={sys === "all"} onClick={() => setSys("all")} icon={Layers} label="All" count={tests.length} hue="31 30 28" />
        {groups.map((g) => (
          <SystemTile key={g.id} on={sys === g.id} onClick={() => setSys(sys === g.id ? "all" : g.id)} icon={ICON[g.id]} label={g.system} count={tests.filter((t) => t.group === g.id).length} hue={HUE[g.id]} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={sys + String(searching)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-[14px] text-graphite">
          {searching ? `${shown.length} tests match “${q}”, best match first.` : sys === "all" ? "Every BioAro Labs test, explained in plain words. Tap any test for details." : groupOf[sys].blurb}
        </motion.p>
      </AnimatePresence>

      {/* Tests */}
      <LayoutGroup>
        <motion.ul layout className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {shown.map((t) => (
              <motion.li key={t.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 34 }}>
                <TestCard t={t} score={scores[t.slug]} system={groupOf[t.group].system} onOpen={() => setOpen(t.slug)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
      {shown.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-ink/15 p-8 text-center text-[15px] text-graphite">
          No test matches that yet. <button onClick={() => setQ("")} className="underline underline-offset-4">Show all tests</button>
        </div>
      )}

      <AnimatePresence>{cur && <TestSheet t={cur} system={groupOf[cur.group].system} regions={regionsByTest[cur.slug] ?? []} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function SystemTile({ on, onClick, icon: Icon, label, count, hue }: { on: boolean; onClick: () => void; icon: typeof Activity; label: string; count: number; hue: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cn("group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-2 py-3 text-center transition", on ? "border-transparent bg-ink text-white" : "border-ink/[0.08] bg-white text-ink hover:border-ink/20")}>
      <span className="grid h-9 w-9 place-items-center rounded-full transition" style={{ background: on ? `rgb(${hue} / 0.35)` : `rgb(${hue} / 0.12)`, color: on ? "#fff" : `rgb(${hue})` }}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[12px] leading-tight">{label}</span>
      <span className={cn("tabular text-[11px]", on ? "text-white/60" : "text-graphite")}>{count}</span>
    </button>
  );
}

function TestCard({ t, score, system, onOpen }: { t: LabTest; score?: number; system: string; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const hue = HUE[t.group];
  // light follows the pointer across the card
  const move = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !ref.current) return;
    ref.current.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div ref={ref} onPointerMove={move} className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-ink/[0.07] bg-white shadow-[0_20px_50px_-40px_rgba(var(--shadow-tint),0.7)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(var(--shadow-tint),0.8)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgb(${hue} / 0.12), transparent 45%)` }} />
      <button onClick={onOpen} className="relative block aspect-[16/10] w-full overflow-hidden text-left" aria-label={`${t.name} details`}>
        <NeaImage src={testPhoto(t)} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
        {/* scan line */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:animate-[scan_1.8s_ease-in-out_infinite] group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, rgb(${hue}), transparent)`, boxShadow: `0 0 18px 2px rgb(${hue} / 0.6)` }} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] text-ink backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${hue})` }} />
          {system}
        </span>
        {score !== undefined && <MatchRing value={score} hue={hue} />}
        {t.usaOnly && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] text-white backdrop-blur">
            <Globe2 className="h-3 w-3" /> USA only
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <button onClick={onOpen} className="text-left font-display text-[1.25rem] leading-tight text-ink hover:underline hover:underline-offset-4">
            {t.name}
          </button>
          <span className="tabular shrink-0 font-display text-[1.25rem] text-ink">{money(t.price)}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-graphite">{t.bestFor}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11.5px] text-ink/75">
          {t.sample && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.045] px-2 py-0.5">
              <Droplet className="h-3 w-3" /> {t.sample.split(" (")[0]}
            </span>
          )}
          {t.results && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.045] px-2 py-0.5">
              <Clock className="h-3 w-3" /> {t.results}
            </span>
          )}
          {t.markers && <span className="rounded-full bg-ink/[0.045] px-2 py-0.5">{t.markers}</span>}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <a href={buyUrl(t)} target="_blank" rel="noopener" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.97]">
            <ShoppingBag className="h-4 w-4" /> Buy now
          </a>
          <button onClick={onOpen} className="rounded-full border border-ink/10 px-4 py-2.5 text-[14px] text-ink transition hover:border-ink/25">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchRing({ value, hue }: { value: number; hue: string }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <span className="absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-full bg-white/90 backdrop-blur" title={`${value}% match`}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(0 0 0 / 0.08)" strokeWidth="3" />
        <motion.circle cx="20" cy="20" r={r} fill="none" stroke={`rgb(${hue})`} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} />
      </svg>
      <span className="tabular relative text-[11px] font-semibold text-ink">{value}%</span>
    </span>
  );
}

function TestSheet({ t, system, regions, onClose }: { t: LabTest; system: string; regions: Region[]; onClose: () => void }) {
  const book = useBooking();
  const ai = useAi();
  const hue = HUE[t.group];
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#${t.slug}`);
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
  }, [onClose, t.slug]);
  const specs: [string, string | undefined][] = [
    ["Sample", t.sample],
    ["Preparation", t.prep],
    ["Results", t.results],
    ["Measures", t.markers],
  ];
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-label={t.name}
        data-lenis-prevent
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-[32px] bg-white shadow-2xl md:rounded-[32px]"
      >
        <div className="relative aspect-[16/9] w-full md:aspect-[16/8]">
          <NeaImage src={testPhoto(t)} alt={t.name} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink backdrop-blur hover:bg-white">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-6 bottom-5 text-white">
            <p className="inline-flex items-center gap-1.5 text-[12.5px] text-white/85">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${hue})`, boxShadow: `0 0 10px rgb(${hue})` }} />
              {system} · BioAro Labs
            </p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <h3 className="font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.02]">{t.name}</h3>
              <span className="tabular shrink-0 font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-none">{money(t.price)}</span>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-[18px] leading-relaxed text-ink">{t.plain}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-graphite">Best for</p>
              <p className="mt-1 text-[15px] text-ink">{t.bestFor}</p>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-graphite">How NEA uses it</p>
              <p className="mt-1 text-[15px] text-ink">{t.neaUse}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-porcelain/70 p-3">
                <dt className="text-[11.5px] text-graphite">{k}</dt>
                <dd className="mt-0.5 text-[14px] leading-snug text-ink">{v ?? "Explained when you order"}</dd>
              </div>
            ))}
          </dl>
          {t.usaOnly && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-ink/10 p-3 text-[13.5px] text-ink/80">
              <Globe2 className="mt-0.5 h-4 w-4 shrink-0" /> BioAro currently offers this test in the USA only{t.prep && /referral|prescription/i.test(t.prep) ? `, and it needs a ${/prescription/i.test(t.prep) ? "prescription" : "referral"}` : ""}. Ask NEA about the right route for you.
            </p>
          )}
          {regions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <PersonStanding className="h-3.5 w-3.5 text-graphite" />
              {regions.map((r) => (
                <Link key={r.id} href={`/body?focus=${r.id}`} className="rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-[12px] text-ink/80 hover:bg-ink/10">
                  {r.name}
                </Link>
              ))}
            </div>
          )}
          <div className="sticky bottom-0 -mx-6 mt-6 grid grid-cols-2 gap-2 border-t border-ink/[0.06] bg-white px-6 pb-1 pt-4 sm:flex sm:flex-wrap md:-mx-8 md:px-8">
            <a href={buyUrl(t)} target="_blank" rel="noopener" className="col-span-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.97]">
              <ShoppingBag className="h-4 w-4" /> Buy now · {money(t.price)} <ArrowUpRight className="h-4 w-4 opacity-70" />
            </a>
            <button onClick={() => book.open("microbiome", t.name)} className="btn-ghost !px-4">
              <CalendarHeart className="h-4 w-4" /> Book a consult
            </button>
            <button onClick={() => (onClose(), ai.open({ query: `Should I take the ${t.name} test?`, context: t.name }))} className="btn-ghost !px-4">
              <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
            </button>
          </div>
          <p className="mt-3 text-[12px] text-graphite">Buy now opens this test in BioAro Labs’ secure shop, where you add it to your cart and check out.</p>
        </div>
      </motion.article>
    </motion.div>
  );
}
