"use client";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CalendarHeart, ChevronDown, ChevronUp, Instagram, Pause, Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAi } from "@/components/ai/ai-provider";
import { useBooking } from "@/components/booking/booking";
import { cleanCaption, reelTopic } from "@/content/reels";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ReelItem = { id: string; video: string; poster: string | null; caption: string; permalink: string; date: string };

const ReelsCtx = createContext<{ open: () => void }>({ open: () => {} });
export const useReels = () => useContext(ReelsCtx);

/** Full-screen viewer for NEA's own Instagram videos. Open it from anywhere with useReels().open(). */
export function ReelsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ reels: ReelItem[]; connected: boolean } | null>(null);
  const [error, setError] = useState(false);

  const show = useCallback(() => {
    setOpen(true);
    if (!data) {
      fetch("/api/reels")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d: { reels: ReelItem[]; connected: boolean }) => setData(d))
        .catch(() => setError(true));
    }
  }, [data]);

  return (
    <ReelsCtx.Provider value={{ open: show }}>
      {children}
      <AnimatePresence>{open && <Viewer data={data} error={error} onClose={() => setOpen(false)} />}</AnimatePresence>
    </ReelsCtx.Provider>
  );
}

function Viewer({ data, error, onClose }: { data: { reels: ReelItem[]; connected: boolean } | null; error: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const list = useRef<HTMLDivElement>(null);
  const reels = data?.reels ?? [];

  const go = useCallback(
    (i: number) => {
      const el = list.current?.children[Math.max(0, Math.min(reels.length - 1, i))] as HTMLElement | undefined;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [reels.length],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") (e.preventDefault(), go(index + 1));
      if (e.key === "ArrowUp") (e.preventDefault(), go(index - 1));
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", k);
    };
  }, [go, index, onClose]);

  // which reel is on screen
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setIndex(Number((e.target as HTMLElement).dataset.i))),
      { root, threshold: 0.6 },
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reels.length]);

  return (
    <motion.div role="dialog" aria-modal="true" aria-label="NEA on Instagram" className="fixed inset-0 z-[88] bg-[rgb(12_10_16/0.92)] backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 text-white md:p-6">
        <a href={site.social.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-md transition hover:bg-white/15">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
            <span className="grid h-full w-full place-items-center rounded-full bg-[#0f1a3a] text-[9px] font-semibold tracking-wide">NEA</span>
          </span>
          <span className="text-[13.5px]">neaprecisionskin</span>
          <BadgeCheck className="h-4 w-4 text-sky-400" />
        </a>
        <div className="flex items-center gap-2">
          {reels.length > 0 && (
            <span className="tabular rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] text-white/80">
              {index + 1} / {reels.length}
            </span>
          )}
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!data && !error && (
        <div className="grid h-full place-items-center">
          <div className="aspect-[9/16] h-[78dvh] max-w-[92vw] animate-pulse rounded-[28px] bg-white/[0.06]" />
        </div>
      )}

      {(error || (data && reels.length === 0)) && (
        <div className="grid h-full place-items-center px-6 text-center text-white">
          <div>
            <Instagram className="mx-auto h-10 w-10 text-white/70" />
            <p className="mt-4 font-display text-3xl">Watch NEA on Instagram</p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] text-white/70">Treatments, before-and-afters and skincare tips from the team.</p>
            <a href={site.social.instagram} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-medium text-ink transition hover:bg-white/90">
              <Instagram className="h-4 w-4" /> Open @neaprecisionskin
            </a>
          </div>
        </div>
      )}

      {reels.length > 0 && (
        <>
          <div ref={list} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
            {reels.map((r, i) => (
              <section key={r.id} data-i={i} className="flex h-[100dvh] snap-start items-center justify-center py-3 md:py-6">
                <ReelCard reel={r} active={i === index} near={Math.abs(i - index) <= 1} muted={muted} onMute={() => setMuted((m) => !m)} />
              </section>
            ))}
          </div>
          {/* desktop up / down */}
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
            <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous video" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30">
              <ChevronUp className="h-5 w-5" />
            </button>
            <button onClick={() => go(index + 1)} disabled={index === reels.length - 1} aria-label="Next video" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

function ReelCard({ reel, active, near, muted, onMute }: { reel: ReelItem; active: boolean; near: boolean; muted: boolean; onMute: () => void }) {
  const v = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [more, setMore] = useState(false);
  const book = useBooking();
  const ai = useAi();
  const topic = reelTopic(reel.caption);
  const caption = cleanCaption(reel.caption);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (active && !paused) el.play().catch(() => setPaused(true));
    else el.pause();
    if (!active) el.currentTime = 0;
  }, [active, paused]);
  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  const hold = () => setPaused(true);

  return (
    <div className="relative aspect-[9/16] h-full max-h-[calc(100dvh-24px)] max-w-[100vw] overflow-hidden bg-black md:rounded-[28px] md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
      {failed ? (
        <a href={reel.permalink} target="_blank" rel="noreferrer" className="absolute inset-0 grid place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {reel.poster && <img src={reel.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
          <span className="relative flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] text-ink">
            <Instagram className="h-4 w-4" /> Watch on Instagram
          </span>
        </a>
      ) : (
        <video
          ref={v}
          src={near ? reel.video : undefined}
          poster={reel.poster ?? undefined}
          muted={muted}
          loop
          playsInline
          preload={near ? "auto" : "none"}
          onClick={() => setPaused((p) => !p)}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        />
      )}

      {paused && !failed && (
        <button onClick={() => setPaused(false)} aria-label="Play" className="absolute inset-0 grid place-items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md">
            <Play className="h-7 w-7 translate-x-0.5" />
          </span>
        </button>
      )}

      {/* progress */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/20">
        <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* side actions */}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-4 text-white">
        <Action label={muted ? "Sound" : "Mute"} onClick={onMute}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Action>
        <Action label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)}>
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Action>
        <Action label="Ask SI" onClick={() => (hold(), ai.open({ context: topic.label, query: caption ? `Tell me about this: ${caption.slice(0, 140)}` : `Tell me about ${topic.label}` }))}>
          <Sparkles className="h-5 w-5" />
        </Action>
        <Action label="Instagram" href={reel.permalink}>
          <Instagram className="h-5 w-5" />
        </Action>
      </div>

      {/* caption + booking */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 text-white md:p-5 md:pt-20">
        {caption && (
          <button onClick={() => setMore((m) => !m)} className={cn("block pr-14 text-left text-[13.5px] leading-snug text-white/90", !more && "line-clamp-2")}>
            {caption}
          </button>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => (hold(), book.open(topic.key, topic.label))} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13.5px] font-medium text-ink transition hover:bg-white/90">
            <CalendarHeart className="h-4 w-4" /> {topic.key === "popular" ? "Book a visit" : `Book ${topic.label}`}
          </button>
          <span className="text-[11.5px] text-white/60">{new Date(reel.date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

function Action({ label, onClick, href, children }: { label: string; onClick?: () => void; href?: string; children: ReactNode }) {
  const cls = "grid h-11 w-11 place-items-center rounded-full bg-black/35 backdrop-blur-md transition hover:bg-black/55";
  return (
    <span className="flex flex-col items-center gap-1">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
          {children}
        </a>
      ) : (
        <button onClick={onClick} aria-label={label} className={cls}>
          {children}
        </button>
      )}
      <span className="text-[10.5px] text-white/80">{label}</span>
    </span>
  );
}
