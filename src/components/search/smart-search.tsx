"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Aperture, CalendarHeart, Clock3, CornerDownLeft, History, Mic, ScanFace, Search, X } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import { smartSearch, TRENDING, type Hit, type Kind } from "@/lib/smart-search";
import { cn, money } from "@/lib/utils";

const GROUP_ORDER: Kind[] = ["Program", "Treatment", "Lab test", "Package", "Video", "Answer", "Experience", "Body", "Page"];
const GROUP_LABEL: Record<Kind, string> = { Program: "Programs", Treatment: "Treatments", "Lab test": "Tests", Package: "Packages", Video: "Glow Feed", Answer: "Answers", Experience: "Experiences", Body: "Body areas", Page: "Pages" };

type Row = { type: "ask" } | { type: "hit"; hit: Hit };

/**
 * Smart Search: one icon, top-right. Tap it (or press "/" or Ctrl K) and it opens into a search bar.
 * Results appear as you type, typos and all, with what Nea SI understood, the best match first, prices and a Book button.
 */
export function SmartSearch() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <motion.button layoutId="nea-search" onClick={() => setOpen(true)} aria-label="Search NEA (press /)" title="Search · press /" className="pointer-events-auto glass grid h-11 w-11 place-items-center rounded-full text-ink transition hover:scale-105">
        <Search className="h-[18px] w-[18px]" />
      </motion.button>
      {typeof document !== "undefined" && createPortal(<AnimatePresence>{open && <Panel onClose={() => setOpen(false)} />}</AnimatePresence>, document.body)}
    </>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const book = useBooking();
  const ai = useAi();

  useEffect(() => {
    setTimeout(() => input.current?.focus(), 80);
    try {
      setRecent(JSON.parse(localStorage.getItem("nea-search-recent") ?? "[]"));
    } catch {}
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const result = useMemo(() => smartSearch(q), [q]);
  const groups = useMemo(() => {
    const g = new Map<Kind, Hit[]>();
    for (const h of result.hits.slice(1)) g.set(h.kind, [...(g.get(h.kind) ?? []), h]);
    return GROUP_ORDER.filter((k) => g.has(k)).map((k) => ({ kind: k, hits: g.get(k)! }));
  }, [result]);
  const top = result.hits[0];
  const rows: Row[] = useMemo(() => {
    if (!q.trim()) return [];
    const hitRows: Row[] = [...(top ? [top] : []), ...groups.flatMap((g) => g.hits)].map((hit) => ({ type: "hit", hit }));
    const ask: Row = { type: "ask" };
    return result.intent.question || !top ? [ask, ...hitRows] : [...hitRows, ask];
  }, [q, top, groups, result.intent.question]);
  useEffect(() => setSel(0), [q]);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem("nea-search-recent", JSON.stringify(next));
    } catch {}
  };

  const go = useCallback(
    (row: Row) => {
      if (q.trim()) remember(q.trim());
      onClose();
      if (row.type === "ask") return ai.open({ query: q });
      const h = row.hit;
      if (h.reel !== undefined) return window.dispatchEvent(new CustomEvent("nea:reels", { detail: { index: h.reel } }));
      router.push(h.href);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, onClose, ai, router, recent]
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return onClose();
    if (e.key === "ArrowDown") (e.preventDefault(), setSel((s) => Math.min(rows.length - 1, s + 1)));
    if (e.key === "ArrowUp") (e.preventDefault(), setSel((s) => Math.max(0, s - 1)));
    if (e.key === "Enter" && rows[sel]) (e.preventDefault(), go(rows[sel]));
  };

  const voice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-CA";
    r.interimResults = true;
    r.onresult = (e) => setQ(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  };

  const understood = [
    result.intent.price && "prices",
    result.intent.book && "booking",
    result.intent.hours && "opening hours",
    result.intent.budget && `a budget of ${money(result.intent.budget)}`,
    result.intent.question && "a question for Nea SI",
  ].filter(Boolean) as string[];
  const idx = (h: Hit) => rows.findIndex((r) => r.type === "hit" && r.hit.id === h.id);
  const askIdx = rows.findIndex((r) => r.type === "ask");

  return (
    <motion.div className="fixed inset-0 z-[86] flex justify-center bg-ink/20 px-3 pt-3 backdrop-blur-md md:pt-[8vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-lenis-prevent>
      <motion.div layoutId="nea-search" onClick={(e) => e.stopPropagation()} className="surface flex max-h-[calc(100dvh-24px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[28px] !bg-[rgb(var(--c-bg)/0.97)] md:max-h-[80vh]" transition={{ type: "spring", stiffness: 380, damping: 34 }} role="dialog" aria-modal="true" aria-label="Search NEA">
        {/* input */}
        <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3 md:px-5">
          <Search className="h-5 w-5 shrink-0 text-flora" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search treatments, prices, tests, videos… or ask anything"
            aria-label="Search"
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls="nea-search-results"
            className="min-w-0 flex-1 bg-transparent py-2 text-[17px] text-ink outline-none placeholder:text-graphite/70"
          />
          <button onClick={voice} aria-label="Search by voice" className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition", listening ? "bg-flora/15 text-flora" : "text-graphite hover:text-ink")}>
            <Mic className="h-4 w-4" />
          </button>
          <button onClick={onClose} aria-label="Close search" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 text-graphite hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div id="nea-search-results" className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4" role="listbox">
          {!q.trim() ? (
            <Empty
              recent={recent}
              onPick={(t) => setQ(t)}
              actions={[
                { label: "Skin Lens selfie", icon: <ScanFace className="h-4 w-4" />, run: () => (onClose(), router.push("/skin-lens")) },
                { label: "Book in Jane", icon: <CalendarHeart className="h-4 w-4" />, run: () => (onClose(), book.open()) },
                { label: "Glow Feed", icon: <Aperture className="h-4 w-4" />, run: () => (onClose(), window.dispatchEvent(new CustomEvent("nea:reels", { detail: { index: 0 } }))) },
                { label: "Ask Nea SI", icon: <NeaSiIcon className="h-4 w-4" />, run: () => (onClose(), ai.open()) },
              ]}
            />
          ) : (
            <>
              {/* what Nea SI understood */}
              <p className="mb-3 flex flex-wrap items-center gap-1.5 px-1 text-[12.5px] text-graphite">
                <NeaSiIcon className="h-4 w-4 text-flora" />
                <span>
                  {understood.length
                    ? `Understood: you’re after ${understood.join(" and ")}${top ? ` for ${top.title}` : ""}.`
                    : top
                      ? `${result.hits.length} results, best match first.`
                      : "Nothing on the site matches yet."}
                </span>
                {result.suggestion && (
                  <button onClick={() => setQ(result.suggestion!)} className="text-flora underline underline-offset-4">
                    Did you mean “{result.suggestion}”?
                  </button>
                )}
              </p>

              {askIdx === 0 && <AskRow q={q} on={sel === 0} onClick={() => go({ type: "ask" })} />}

              {top && <TopCard hit={top} on={sel === idx(top)} onOpen={() => go({ type: "hit", hit: top })} onBook={top.bookKey ? () => (onClose(), book.open(top.bookKey, top.title)) : undefined} onAsk={() => (onClose(), ai.open({ context: top.title, query: q }))} />}

              {result.plan && result.intent.budget && (
                <div className="mb-3 rounded-2xl border border-ink/[0.07] bg-white/70 p-3.5">
                  <p className="text-[12px] text-graphite">Plan for {money(result.intent.budget)}</p>
                  {result.plan.items.map((it) => (
                    <Link key={it.href} href={it.href} onClick={onClose} className="mt-1.5 flex items-center justify-between text-[14px] text-ink hover:underline">
                      {it.title} <span className="tabular">{money(it.price)}</span>
                    </Link>
                  ))}
                  <p className="mt-2 text-[12px] leading-snug text-graphite">{result.plan.note}</p>
                </div>
              )}

              {groups.map((g) => (
                <div key={g.kind} className="mb-3">
                  <p className="mb-1 px-2 text-[11.5px] uppercase tracking-[0.14em] text-graphite">{GROUP_LABEL[g.kind]}</p>
                  {g.hits.map((h) => (
                    <HitRow key={h.id} hit={h} on={sel === idx(h)} onClick={() => go({ type: "hit", hit: h })} />
                  ))}
                </div>
              ))}

              {askIdx > 0 && <AskRow q={q} on={sel === askIdx} onClick={() => go({ type: "ask" })} />}
            </>
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-ink/10 px-5 py-2.5 text-[11.5px] text-graphite md:flex">
          <span>↑ ↓ to move</span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> to open
          </span>
          <span>Esc to close</span>
          <span className="ml-auto">Typos are fine. Try “botoxx price” or “acne under $1500”.</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

type SpeechRecognitionLike = { lang: string; interimResults: boolean; start: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };

function meta(h: Hit) {
  const bits = [h.kind === "Video" ? "Glow Feed video" : h.kind === "Lab test" ? "Lab test" : h.kind];
  if (h.price) bits.push(`${h.priceFrom ? "from " : ""}${money(h.price)}`);
  if (h.minutes) bits.push(`${h.minutes} min`);
  return bits.join(" · ");
}

function TopCard({ hit, on, onOpen, onBook, onAsk }: { hit: Hit; on: boolean; onOpen: () => void; onBook?: () => void; onAsk: () => void }) {
  return (
    <div className={cn("mb-3 overflow-hidden rounded-3xl border bg-white/80 transition", on ? "border-flora/50 shadow-[0_18px_40px_-24px_rgba(var(--shadow-tint),0.8)]" : "border-ink/[0.07]")}>
      <button onClick={onOpen} className="flex w-full items-stretch gap-4 p-3 text-left" role="option" aria-selected={on}>
        <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mist md:h-28 md:w-36">
          {hit.image ? <NeaImage src={hit.image} alt="" fill sizes="144px" className="object-cover" /> : hit.kind === "Video" ? <Aperture className="h-7 w-7 text-flora" /> : <Search className="h-6 w-6 text-graphite" />}
        </span>
        <span className="min-w-0 flex-1 py-1">
          <span className="text-[11.5px] uppercase tracking-[0.14em] text-flora">Best match</span>
          <span className="mt-1 block font-display text-[1.6rem] leading-[1.05] text-ink">{hit.title}</span>
          <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug text-graphite">{hit.text}</span>
          <span className="tabular mt-1.5 block text-[12.5px] text-ink/80">{meta(hit)}</span>
        </span>
      </button>
      <div className="flex flex-wrap gap-2 border-t border-ink/[0.06] px-3 py-2.5">
        <button onClick={onOpen} className="btn-ghost !px-3.5 !py-1.5 !text-[13px]">
          {hit.kind === "Video" ? "Watch" : "Open"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {onBook && (
          <button onClick={onBook} className="btn-light !px-3.5 !py-1.5 !text-[13px]">
            <CalendarHeart className="h-3.5 w-3.5" /> Book in Jane
          </button>
        )}
        <button onClick={onAsk} className="btn-ghost !px-3.5 !py-1.5 !text-[13px]">
          <NeaSiIcon className="h-3.5 w-3.5" /> Ask Nea SI
        </button>
      </div>
    </div>
  );
}

function HitRow({ hit, on, onClick }: { hit: Hit; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="option" aria-selected={on} className={cn("flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition", on ? "bg-white shadow-sm" : "hover:bg-white/60")}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist">
        {hit.image ? <NeaImage src={hit.image} alt="" fill sizes="40px" className="object-cover" /> : hit.kind === "Video" ? <Aperture className="h-4 w-4 text-flora" /> : hit.kind === "Answer" ? <NeaSiIcon className="h-4 w-4" /> : hit.kind === "Page" && /hours|contact/i.test(hit.title) ? <Clock3 className="h-4 w-4 text-graphite" /> : <Search className="h-4 w-4 text-graphite" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] text-ink">{hit.title}</span>
        <span className="tabular block truncate text-[12px] text-graphite">{meta(hit)}</span>
      </span>
      <ArrowRight className={cn("h-4 w-4 shrink-0 transition", on ? "text-ink" : "text-graphite/40")} />
    </button>
  );
}

function AskRow({ q, on, onClick }: { q: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="option" aria-selected={on} className={cn("mb-3 flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition", on ? "border-flora/50 bg-white" : "border-dashed border-ink/15 hover:bg-white/60")}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl [background:var(--aurora)]">
        <NeaSiIcon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] text-ink">
          Ask Nea SI: <span className="font-medium">“{q}”</span>
        </span>
        <span className="block text-[12px] text-graphite">A written answer from NEA’s knowledge, with prices and the right booking</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-graphite" />
    </button>
  );
}

function Empty({ recent, onPick, actions }: { recent: string[]; onPick: (t: string) => void; actions: { label: string; icon: React.ReactNode; run: () => void }[] }) {
  return (
    <div className="space-y-5 p-1">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {actions.map((a) => (
          <button key={a.label} onClick={a.run} className="flex items-center gap-2 rounded-2xl border border-ink/[0.07] bg-white/70 px-3 py-3 text-[13.5px] text-ink transition hover:bg-white">
            <span className="text-flora">{a.icon}</span> {a.label}
          </button>
        ))}
      </div>
      {recent.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-[11.5px] uppercase tracking-[0.14em] text-graphite">Recent</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((r) => (
              <button key={r} onClick={() => onPick(r)} className="chip !text-[13px] hover:text-ink">
                <History className="h-3.5 w-3.5" /> {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 px-1 text-[11.5px] uppercase tracking-[0.14em] text-graphite">People search for</p>
        <div className="flex flex-wrap gap-1.5">
          {TRENDING.map((t) => (
            <button key={t} onClick={() => onPick(t)} className="chip !text-[13px] hover:text-ink">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
