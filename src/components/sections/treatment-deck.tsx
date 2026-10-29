"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowUpRight, CalendarHeart, ChevronLeft, ChevronRight, Clock3, Search, Sparkles, Tag, X } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import type { TreatmentCategory } from "@/content/treatments";
import { cn, money } from "@/lib/utils";

export type TreatmentItem = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  category: TreatmentCategory;
  concerns: string[];
  booking: { services: number; min: number | null; price: number | null };
  regions: { id: string; name: string; face: boolean }[];
};

const QUICK = ["acne", "melasma", "wrinkles", "hair loss", "redness", "double chin", "scars", "pores", "weight", "pain"];

/** Words in the title count most, then concerns, then the summary. */
function fit(t: TreatmentItem, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return 1;
  let s = 0;
  for (const w of words) {
    if (t.title.toLowerCase().includes(w)) s += 3;
    if (t.concerns.join(" ").toLowerCase().includes(w)) s += 2;
    if (t.summary.toLowerCase().includes(w)) s += 1;
  }
  return s / (words.length * 3);
}

/**
 * The Treatment Deck: every NEA treatment as a full-screen scene.
 * - A full-bleed photo, the name written large on it, the facts as glass readouts, and Book always in reach.
 * - Type what you want to fix and the deck re-orders itself by fit, with a match score on every card.
 * - Swipe, use the arrow keys, or tap the filmstrip to move through it.
 */
export function TreatmentDeck({ items, categories }: { items: TreatmentItem[]; categories: { id: TreatmentCategory; label: string }[] }) {
  const params = useSearchParams();
  const book = useBooking();
  const ai = useAi();
  const [q, setQ] = useState("");
  const [dir, setDir] = useState(1);
  const stage = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const label = (c: TreatmentCategory) => categories.find((x) => x.id === c)?.label ?? c;
  const order = (c: TreatmentCategory) => categories.findIndex((x) => x.id === c);

  const list = useMemo(() => {
    const scored = items.map((t) => ({ t, s: fit(t, q) })).filter((x) => x.s > 0);
    if (!q.trim()) return scored.sort((a, b) => order(a.t.category) - order(b.t.category));
    const top = Math.max(...scored.map((x) => x.s), 0.0001);
    return scored.sort((a, b) => b.s - a.s).map((x) => ({ ...x, s: Math.round(55 + (x.s / top) * 44) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, q]);

  const [slug, setSlug] = useState<string>(() => list[0]?.t.slug ?? "");
  const idx = Math.max(0, list.findIndex((x) => x.t.slug === slug));
  const cur = list[idx]?.t;
  const score = q.trim() ? list[idx]?.s : undefined;

  // ?focus=skin opens on the first treatment of that group; /treatments#slug opens that treatment
  useEffect(() => {
    const h = window.location.hash.slice(1);
    const f = params.get("focus");
    const hit = items.find((t) => t.slug === h) ?? (f ? list.find((x) => x.t.category === f)?.t : undefined);
    if (hit) setSlug(hit.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // a new search starts at the best match
  useEffect(() => {
    if (q.trim() && list[0]) setSlug(list[0].t.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const go = useCallback(
    (n: number) => {
      if (!list.length) return;
      const next = (n + list.length) % list.length;
      setDir(next >= idx ? 1 : -1);
      setSlug(list[next].t.slug);
    },
    [list, idx],
  );

  // keep the active frame in view in the filmstrip
  useEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    if (el && rail.current) rail.current.scrollTo({ left: el.offsetLeft - rail.current.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [slug]);

  // arrow keys while the deck is on screen
  useEffect(() => {
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    if (stage.current) io.observe(stage.current);
    const key = (e: KeyboardEvent) => {
      if (!visible || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    window.addEventListener("keydown", key);
    return () => (io.disconnect(), window.removeEventListener("keydown", key));
  }, [go, idx]);

  const swipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(idx + 1);
    else if (info.offset.x > 60) go(idx - 1);
  };

  const name = cur?.title.split(" (")[0] ?? "";

  return (
    <section ref={stage} aria-roledescription="carousel" aria-label="NEA treatments" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#1d1714] text-white">
      {/* the scene */}
      <AnimatePresence initial={false} custom={dir}>
        {cur && (
          <motion.div
            key={cur.slug}
            custom={dir}
            initial={{ opacity: 0, scale: 1.08, x: dir * 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: dir * -40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 -z-10"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={swipe}
          >
            <NeaImage src={cur.image} alt="" fill priority sizes="100vw" className="pointer-events-none object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,11,9,0.88)_0%,rgba(15,11,9,0.55)_45%,rgba(15,11,9,0.05)_75%)] max-md:bg-[linear-gradient(180deg,rgba(15,11,9,0.1)_0%,rgba(15,11,9,0.55)_45%,rgba(15,11,9,0.92)_75%)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px animate-[scan_9s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* concern search */}
      <div className="container relative pt-24 md:pt-28">
        <div className="max-w-xl">
          <label className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-xl focus-within:border-white/50">
            <Sparkles className="h-4 w-4 shrink-0 text-[#f3d9a4]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to fix? e.g. dark spots on my cheeks" aria-label="Search treatments by concern" className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/55" />
            {q ? (
              <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Search className="h-4 w-4 shrink-0 text-white/60" />
            )}
          </label>
          <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
            {QUICK.map((w) => (
              <button key={w} onClick={() => setQ(q === w ? "" : w)} className={cn("shrink-0 rounded-full border px-3 py-1 text-[12.5px] backdrop-blur-md transition", q === w ? "border-white bg-white text-ink" : "border-white/20 bg-white/5 text-white/80 hover:border-white/50")}>
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* the words, written on the scene */}
      <div className="container relative mt-auto pb-6 pt-10">
        {cur ? (
          <AnimatePresence mode="wait">
            <motion.div key={cur.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
              <p className="flex items-center gap-3 text-[13px] text-white/75">
                <span className="tabular">
                  {String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
                </span>
                <span className="h-px w-8 bg-white/40" />
                {label(cur.category)}
                {score !== undefined && <span className="rounded-full bg-[#f3d9a4] px-2 py-0.5 text-[11.5px] font-semibold text-ink">{score}% match</span>}
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.95] tracking-[-0.02em] [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">{cur.title}</h2>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/85 md:text-[19px]">{cur.summary}</p>

              <dl className="mt-6 flex flex-wrap gap-2">
                <Readout icon={Clock3} k="Session" v={cur.booking.min ? `${cur.booking.min} min` : "Varies"} />
                <Readout icon={Tag} k="From" v={cur.booking.price ? money(cur.booking.price) : "At consult"} />
                {cur.concerns.slice(0, 3).map((c) => (
                  <button key={c} onClick={() => setQ(c)} className="hidden self-end rounded-full border border-white/20 bg-white/5 px-3 py-1.5 sm:inline-block text-[12.5px] text-white/85 backdrop-blur-md hover:border-white/50">
                    {c}
                  </button>
                ))}
              </dl>
              {cur.regions.length > 0 && (
                <p className="mt-3 hidden flex-wrap gap-x-3 text-[12.5px] text-white/65 sm:flex">
                  Works on:
                  {cur.regions.map((r) => (
                    <Link key={r.id} href={`/body?${r.face ? "mode=face&" : ""}focus=${r.id}`} className="underline-offset-4 hover:text-white hover:underline">
                      {r.name}
                    </Link>
                  ))}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <button onClick={() => book.open(cur.slug, name)} className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[16px] font-semibold text-ink shadow-[0_18px_50px_-12px_rgba(243,217,164,0.7)] transition active:scale-[0.97]" style={{ background: "linear-gradient(110deg,#f6e3c0,#e2a878 55%,#d48a8a)" }}>
                  <span aria-hidden className="absolute inset-0 -z-10 animate-pulse rounded-full opacity-60 blur-xl" style={{ background: "linear-gradient(110deg,#f6e3c0,#e2a878 55%,#d48a8a)" }} />
                  <CalendarHeart className="h-5 w-5" /> Book {name.length > 22 ? "" : name}
                </button>
                <button onClick={() => ai.open({ context: cur.title, query: `Is ${cur.title} right for me?` })} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-[15px] backdrop-blur-md hover:bg-white/20">
                  <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
                </button>
                <Link href={`/treatments/${cur.slug}`} className="inline-flex items-center gap-1.5 px-3 py-3.5 text-[15px] text-white/80 hover:text-white">
                  Full details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="max-w-xl">
            <h2 className="font-display text-4xl">Nothing matches “{q}” yet.</h2>
            <div className="mt-6 flex gap-2">
              <button onClick={() => ai.open({ query: q })} className="btn bg-white text-ink">
                <NeaSiIcon className="h-4 w-4" /> Ask Nea SI
              </button>
              <button onClick={() => setQ("")} className="btn border border-white/30 text-white">
                Show all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* filmstrip */}
      <div className="relative border-t border-white/10 bg-black/25 pb-[calc(var(--dock-h)+0.5rem)] pt-3 backdrop-blur-xl">
        <div className="container flex items-center gap-2">
          <button onClick={() => go(idx - 1)} aria-label="Previous treatment" className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10 sm:grid">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div ref={rail} data-lenis-prevent className="no-scrollbar relative flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-1">
            {list.map(({ t, s }, i) => {
              const on = t.slug === cur?.slug;
              const head = !q.trim() && (i === 0 || list[i - 1].t.category !== t.category);
              return (
                <div key={t.slug} className="flex shrink-0 items-end gap-2">
                  {head && <span className="mb-1 w-16 shrink-0 text-[10.5px] uppercase leading-tight tracking-[0.12em] text-white/50">{label(t.category)}</span>}
                  <button data-slug={t.slug} onClick={() => (setDir(i >= idx ? 1 : -1), setSlug(t.slug))} aria-current={on} aria-label={t.title} className={cn("group relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition md:h-[72px] md:w-28", on ? "ring-2 ring-[#f3d9a4] ring-offset-2 ring-offset-black/40" : "opacity-60 hover:opacity-100")}>
                    <NeaImage src={t.image} alt="" fill sizes="112px" className="object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <span className="absolute inset-x-1.5 bottom-1 line-clamp-2 text-left text-[10.5px] leading-tight text-white">{t.title.split(" (")[0]}</span>
                    {q.trim() && <span className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] tabular text-[#f3d9a4]">{s}%</span>}
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={() => go(idx + 1)} aria-label="Next treatment" className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10 sm:grid">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Readout({ icon: Icon, k, v }: { icon: typeof Clock3; k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-xl">
      <dt className="flex items-center gap-1.5 text-[11.5px] text-white/65">
        <Icon className="h-3.5 w-3.5" /> {k}
      </dt>
      <dd className="tabular mt-0.5 font-display text-[1.35rem] leading-none text-white">{v}</dd>
    </div>
  );
}
