"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Play } from "lucide-react";
import { useReels, type ReelItem } from "@/components/reels/reels";
import { cleanCaption, reelTopic } from "@/content/reels";

/**
 * NEA's latest videos, playing silently on the home page. Tap one to watch full screen with sound.
 * Renders nothing until there is at least one video.
 */
export function ReelsStrip() {
  const { feed, load, open } = useReels();
  const root = useRef<HTMLElement>(null);

  // only ask for the videos when the section is close to the screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es[0].isIntersecting && (load(), io.disconnect()), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  const reels = feed?.reels.slice(0, 12) ?? [];

  return (
    <section ref={root} className={reels.length ? "chapter" : undefined} aria-label="NEA Reels">
      {reels.length > 0 && (
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="flex items-center gap-2 text-[13px] text-graphite">
                @neaprecisionskin <BadgeCheck className="h-4 w-4 text-sky-500" />
              </p>
              <h2 className="mt-2 max-w-2xl text-display-md font-semibold">
                Straight from the <em className="aurora-text">clinic floor.</em>
              </h2>
            </div>
            <button onClick={() => open(0)} className="btn-ghost">
              <Play className="h-4 w-4" /> Watch all {feed!.reels.length}
            </button>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
            {reels.map((r, i) => (
              <Card key={r.id} reel={r} onOpen={() => open(i)} delay={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ reel, onOpen, delay }: { reel: ReelItem; onOpen: () => void; delay: number }) {
  const v = useRef<HTMLVideoElement>(null);
  const topic = reelTopic(reel.caption);
  const caption = cleanCaption(reel.caption);

  // play while on screen, pause when scrolled away
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(delay, 5) * 0.06 }}
      className="group relative aspect-[9/16] w-[62vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-[26px] bg-ink text-left shadow-[0_24px_60px_-30px_rgba(var(--shadow-tint),0.8)] sm:w-[240px]"
      aria-label={`Play video: ${caption.slice(0, 80) || topic.label}`}
    >
      <video ref={v} src={reel.video} poster={reel.poster ?? undefined} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition group-hover:bg-white group-hover:text-ink">
        <Play className="h-4 w-4 translate-x-px" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        {topic.key !== "popular" && <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] backdrop-blur-md">{topic.label}</span>}
        {caption && <p className="line-clamp-3 text-[13px] leading-snug text-white/90">{caption}</p>}
      </div>
    </motion.button>
  );
}
