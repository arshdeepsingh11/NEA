"use client";
import { useEffect, useRef, useState } from "react";
import { Aperture, CalendarHeart } from "lucide-react";
import { FollowButton, useReels } from "@/components/reels/reels";
import { useBooking } from "@/components/booking/booking";
import { cleanCaption, embedFor, embedHeight, reelTopic } from "@/content/reels";

const CARD = 280;

/**
 * NEA's latest videos on the home page. Each one plays right here in the platform's embedded player;
 * "Watch reels" opens the full-screen viewer.
 */
export function ReelsStrip() {
  const { videos, load, open } = useReels();
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // load the players only when the section is close to the screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setNear(true);
          load();
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  if (!videos.length) return null;
  const list = videos.slice(0, 12);

  return (
    <section ref={root} className="chapter" aria-label="Glow Feed">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="text-[13px] text-graphite">Glow Feed · @neaprecisionskin</p>
            <h2 className="mt-2 max-w-2xl text-display-md font-semibold">
              Straight from the <em className="aurora-text">clinic floor.</em>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => open(0)} className="btn-primary">
              <Aperture className="h-4 w-4" /> Open Glow Feed
            </button>
            <FollowButton />
          </div>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {list.map((v, i) => (
            <Card key={v.url} url={v.url} caption={v.caption ?? ""} load={near} onOpen={() => open(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ url, caption, load, onOpen }: { url: string; caption: string; load: boolean; onOpen: () => void }) {
  const e = embedFor(url)!;
  const h = embedHeight(e.platform, CARD);
  const topic = reelTopic(caption);
  const text = cleanCaption(caption);
  const book = useBooking();
  return (
    <div className="shrink-0 snap-start" style={{ width: CARD }}>
      <div className="relative overflow-hidden rounded-[22px] border border-ink/[0.06] bg-white shadow-[0_24px_60px_-30px_rgba(var(--shadow-tint),0.7)]" style={{ height: h }}>
        <div className="absolute inset-0 grid place-items-center text-[13px] text-graphite">Loading video…</div>
        {load && <iframe src={e.src} title={text || "NEA video"} width={CARD} height={e.platform === "instagram" ? h + 170 : h} loading="lazy" className="relative block border-0" allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; web-share" allowFullScreen scrolling="no" />}
      </div>
      {text && (
        <button onClick={onOpen} className="mt-3 line-clamp-2 text-left text-[13.5px] leading-snug text-ink/80 hover:text-ink">
          {text}
        </button>
      )}
      <button onClick={() => book.open(topic.key, topic.label)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-flora hover:underline">
        <CalendarHeart className="h-3.5 w-3.5" /> {topic.key === "popular" ? "Book a visit" : `Book ${topic.label}`}
      </button>
    </div>
  );
}
