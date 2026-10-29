"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarHeart, ChevronLeft, ChevronRight, Clock3, Search, Tag, X } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import type { TreatmentCategory } from "@/content/treatments";
import { cn, money } from "@/lib/utils";
import { smartSearch } from "@/lib/smart-search";

export type TreatmentItem = {
  slug: string;
  title: string;
  summary: string;
  about: string;
  includes: string[];
  image: string;
  category: TreatmentCategory;
  concerns: string[];
  booking: { services: number; min: number | null; price: number | null };
  regions: { id: string; name: string; face: boolean }[];
};
type Cat = { id: TreatmentCategory; label: string; blurb: string };

const HINTS = ["acne that keeps coming back", "dark spots on my cheeks", "thinning hair", "wrinkles on my forehead", "double chin", "knee pain"];

/** Words in the title count most, then concerns, then the text. 0 = no match. */
function fit(t: TreatmentItem, q: string) {
  const words = q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !["the", "and", "for", "that", "with", "keeps", "coming", "back", "my", "on"].includes(w));
  if (!words.length) return 0;
  let s = 0;
  for (const w of words) {
    const stem = w.replace(/(ing|es|s)$/, "");
    if (t.title.toLowerCase().includes(stem)) s += 3;
    if (t.concerns.join(" ").toLowerCase().includes(stem)) s += 2;
    if (`${t.summary} ${t.about}`.toLowerCase().includes(stem)) s += 1;
  }
  return s;
}

/**
 * Treatments, shown the way people browse: one bright row per kind of care, big clear photos,
 * and a Book button on every card. Tap a card and it opens into the full story (it grows out of the card).
 * Typing what you want to fix swaps the rows for the best matches.
 */
export function TreatmentRows({ items, categories }: { items: TreatmentItem[]; categories: Cat[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [hint, setHint] = useState(0);
  const cur = items.find((t) => t.slug === open);

  useEffect(() => {
    const id = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2800);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (items.some((t) => t.slug === h)) setOpen(h);
  }, [items]);

  const matches = useMemo(() => {
    if (q.trim().length < 2) return null;
    // NEA's site-wide search understands typos and everyday words ("dark spots" → pigmentation, "botox" → neuromodulators)
    const raw = new Map<string, number>();
    smartSearch(q, 40)
      .hits.filter((h) => h.kind === "Treatment")
      .forEach((h, i) => raw.set(h.href.split("/").pop()!, 40 - i));
    for (const t of items) {
      const f = fit(t, q);
      if (f) raw.set(t.slug, (raw.get(t.slug) ?? 0) + f * 2);
    }
    const top = Math.max(1, ...raw.values());
    return items
      .filter((t) => raw.has(t.slug))
      .map((t) => ({ t, pct: Math.round(60 + ((raw.get(t.slug) ?? 0) / top) * 39) }))
      .sort((a, b) => b.pct - a.pct);
  }, [items, q]);

  return (
    <div>
      {/* search */}
      <div className="container">
        <label className="flex items-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3.5 shadow-[0_20px_50px_-35px_rgba(var(--shadow-tint),0.7)] focus-within:border-ink/30 md:max-w-2xl">
          <Search className="h-5 w-5 shrink-0 text-graphite" />
          <span className="relative min-w-0 flex-1">
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="What do you want to change?" className="w-full bg-transparent text-[16px] text-ink outline-none" />
            {!q && (
              <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-[16px] text-graphite/75">
                <AnimatePresence mode="wait">
                  <motion.span key={hint} className="truncate" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    Try “{HINTS[hint]}”
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </span>
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.06] hover:bg-ink/10">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      {matches ? (
        <div className="container mt-8">
          <p className="text-[14px] text-graphite">{matches.length ? `${matches.length} treatment${matches.length > 1 ? "s" : ""} for “${q}”, best match first` : `Nothing matches “${q}” yet.`}</p>
          {matches.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {matches.map(({ t, pct }) => (
                <Card key={t.slug} t={t} pct={pct} onOpen={() => setOpen(t.slug)} grid />
              ))}
            </div>
          ) : (
            <AskInstead q={q} />
          )}
        </div>
      ) : (
        <div className="mt-10 space-y-12 md:space-y-16">
          {categories.map((c) => {
            const row = items.filter((t) => t.category === c.id);
            return row.length ? <Row key={c.id} cat={c} row={row} onOpen={setOpen} /> : null;
          })}
        </div>
      )}

      <AnimatePresence>{cur && <Detail key={cur.slug} t={cur} label={categories.find((c) => c.id === cur.category)?.label ?? ""} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function Row({ cat, row, onOpen }: { cat: Cat; row: TreatmentItem[]; onOpen: (s: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const check = useCallback(() => {
    const el = ref.current;
    if (el) setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(check, [check]);
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section aria-label={cat.label}>
      <div className="container flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight text-ink">{cat.label}</h2>
          <p className="mt-1 text-[14.5px] text-graphite">{cat.blurb}</p>
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button onClick={() => by(-1)} disabled={edge.start} aria-label={`Scroll ${cat.label} back`} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-ink/30 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => by(1)} disabled={edge.end} aria-label={`Scroll ${cat.label} forward`} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-ink/30 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} onScroll={check} data-lenis-prevent className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 sm:gap-4 md:scroll-px-[max(2rem,calc((100vw-1240px)/2+2rem))] md:px-[max(2rem,calc((100vw-1240px)/2+2rem))]">
        {row.map((t) => (
          <Card key={t.slug} t={t} onOpen={() => onOpen(t.slug)} />
        ))}
      </div>
    </section>
  );
}

function Card({ t, pct, onOpen, grid }: { t: TreatmentItem; pct?: number; onOpen: () => void; grid?: boolean }) {
  const book = useBooking();
  const name = t.title.split(" (")[0];
  return (
    <motion.article
      layoutId={`tx-${t.slug}`}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      role="button"
      tabIndex={0}
      aria-label={`${t.title}: details`}
      className={cn("group relative cursor-pointer snap-start overflow-hidden rounded-[26px] bg-mist outline-none focus-visible:ring-2 focus-visible:ring-ink", grid ? "aspect-[3/4]" : "aspect-[3/4] w-[64vw] shrink-0 sm:w-[300px] lg:w-[290px]")}
      style={{ borderRadius: 26 }}
    >
      <NeaImage src={t.image} alt="" fill sizes="(min-width:640px) 300px, 64vw" className="object-cover transition duration-700 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      {pct !== undefined && <span className="tabular absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">{pct}% match</span>}
      {t.booking.price && pct === undefined && <span className="tabular absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[12px] text-white backdrop-blur-md">from {money(t.booking.price)}</span>}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
        <h3 className="font-display text-[clamp(1.15rem,4.6vw,1.55rem)] leading-[1.05] sm:text-[1.55rem]">{t.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-white/80 max-sm:hidden">{t.summary}</p>
        <button
          onClick={(e) => (e.stopPropagation(), book.open(t.slug, name))}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-ink shadow-lg transition hover:bg-white/90 active:scale-[0.96]"
        >
          <CalendarHeart className="h-4 w-4" /> Book
        </button>
      </div>
    </motion.article>
  );
}

function Detail({ t, label, onClose }: { t: TreatmentItem; label: string; onClose: () => void }) {
  const book = useBooking();
  const ai = useAi();
  const name = t.title.split(" (")[0];
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

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
      <motion.button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/45 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.article
        layoutId={`tx-${t.slug}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className="relative flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-white md:h-auto md:max-h-[92dvh]"
        style={{ borderRadius: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
      >
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
            <NeaImage src={t.image} alt={t.title} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink backdrop-blur hover:bg-white">
              <X className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-5 bottom-5 text-white md:inset-x-8">
              <p className="text-[13px] text-white/80">{label}</p>
              <h2 className="mt-1 font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1]">{t.title}</h2>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} exit={{ opacity: 0 }} className="px-5 pb-6 pt-6 md:px-8">
            <p className="text-[18px] leading-relaxed text-ink">{t.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Fact icon={Clock3} k="Session" v={t.booking.min ? `${t.booking.min} min` : "Varies"} />
              <Fact icon={Tag} k="From" v={t.booking.price ? money(t.booking.price) : "At consult"} />
            </div>
            {t.about && <p className="mt-6 text-[15.5px] leading-relaxed text-graphite">{t.about}</p>}
            {t.includes.length > 0 && (
              <ul className="mt-5 space-y-2">
                {t.includes.slice(0, 8).map((x) => (
                  <li key={x} className="flex gap-2.5 text-[15px] text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flora" />
                    {x}
                  </li>
                ))}
              </ul>
            )}
            {t.concerns.length > 0 && (
              <div className="mt-6">
                <p className="text-[12px] uppercase tracking-[0.14em] text-graphite">Helps with</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.concerns.map((c) => (
                    <span key={c} className="rounded-full bg-ink/[0.05] px-3 py-1 text-[13px] text-ink/80">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {t.regions.length > 0 && (
              <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[13.5px] text-graphite">
                Works on:
                {t.regions.map((r) => (
                  <Link key={r.id} href={`/body?${r.face ? "mode=face&" : ""}focus=${r.id}`} className="text-ink underline-offset-4 hover:underline">
                    {r.name}
                  </Link>
                ))}
              </p>
            )}
            <Link href={`/treatments/${t.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-ink underline-offset-4 hover:underline">
              Read everything about {name} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        {/* always in reach */}
        <div className="flex gap-2 border-t border-ink/[0.07] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-8">
          <button onClick={() => book.open(t.slug, name)} className="btn-light flex-1 !py-3.5 !text-[16px]">
            <CalendarHeart className="h-5 w-5" /> Book
          </button>
          <button onClick={() => (onClose(), ai.open({ context: t.title, query: `Is ${t.title} right for me?` }))} className="btn-ghost !px-5">
            <NeaSiIcon className="h-4 w-4" /> <span className="max-[360px]:hidden">Ask Nea SI</span>
          </button>
        </div>
      </motion.article>
    </div>
  );
}

function Fact({ icon: Icon, k, v }: { icon: typeof Clock3; k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-porcelain px-4 py-2.5">
      <p className="flex items-center gap-1.5 text-[12px] text-graphite">
        <Icon className="h-3.5 w-3.5" /> {k}
      </p>
      <p className="tabular mt-0.5 font-display text-[1.35rem] leading-none text-ink">{v}</p>
    </div>
  );
}

function AskInstead({ q }: { q: string }) {
  const ai = useAi();
  return (
    <button onClick={() => ai.open({ query: q })} className="btn-light mt-5">
      <NeaSiIcon className="h-4 w-4" /> Ask Nea SI about “{q}”
    </button>
  );
}
