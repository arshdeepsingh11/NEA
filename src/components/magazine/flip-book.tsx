"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { animate, motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlipBookHandle = { goToPage: (page: number) => void };
type Props = {
  pages: string[];
  /** page height ÷ width (A4 = 1.414) */
  ratio?: number;
  /** tallest the book may be, in px */
  maxHeight: number;
  /** page to open at (1-based) */
  startPage?: number;
  onPageChange?: (label: string, first: number) => void;
  onFullscreen?: () => void;
  title?: string;
  className?: string;
};

const SPRING = { type: "spring" as const, stiffness: 60, damping: 15, mass: 0.9 };
const PAPER = "#fbf8f4";

/**
 * A 3D magazine you can actually turn.
 * - Two-page spreads on larger screens, one page at a time on phones.
 * - Pages bend on a real spine: drag a corner, swipe, tap, or use the arrow keys.
 * - The spine shifts so a closed book sits centred; the turned and unturned leaves stack up on each side.
 * - Light falls across a turning page and a soft crease shadows the gutter.
 * - Hovering an outer edge lifts the corner so you can peek at what's next.
 */
export const FlipBook = forwardRef<FlipBookHandle, Props>(function FlipBook({ pages, ratio = 1.414, maxHeight, startPage = 1, onPageChange, onFullscreen, title = "Magazine", className }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spread = W >= 720;
  const n = pages.length;
  const L = spread ? Math.ceil(n / 2) : n;
  const pw = Math.max(120, Math.floor(spread ? Math.min((W - 40) / 2, maxHeight / ratio) : Math.min(W - 8, maxHeight / ratio)));
  const ph = Math.round(pw * ratio);

  const leaves = useMemo(() => Array.from({ length: L }, (_, i) => (spread ? { front: pages[2 * i], back: pages[2 * i + 1] } : { front: pages[i], back: undefined })), [pages, L, spread]);
  const angles = useRef<MotionValue<number>[]>([]);
  if (angles.current.length !== L) angles.current = Array.from({ length: L }, (_, i) => angles.current[i] ?? motionValue(0));

  const toFlipped = useCallback((page: number) => (spread ? (page % 2 === 0 ? page / 2 : (page - 1) / 2) : Math.min(page - 1, L - 1)), [spread, L]);
  const [flipped, setFlipped] = useState(() => 0);
  const maxFlip = spread ? L : L - 1;
  const [moving, setMoving] = useState<number[]>([]);
  const reduced = useRef(false);

  // open at the start page, and keep the angles right when switching between spread and single page
  const first = useRef(true);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const f = first.current ? Math.max(0, Math.min(maxFlip, toFlipped(startPage))) : Math.min(flipped, maxFlip);
    first.current = false;
    angles.current.forEach((mv, i) => mv.set(i < f ? -180 : 0));
    setFlipped(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, L]);

  const go = useCallback(
    (target: number) => {
      const t = Math.max(0, Math.min(maxFlip, target));
      if (t === flipped) return;
      const fwd = t > flipped;
      const turning = fwd ? Array.from({ length: t - flipped }, (_, k) => flipped + k) : Array.from({ length: flipped - t }, (_, k) => flipped - 1 - k);
      setMoving(turning);
      setFlipped(t);
      turning.forEach((i, k) => {
        animate(angles.current[i], fwd ? -180 : 0, reduced.current ? { duration: 0 } : { ...SPRING, delay: k * 0.07 });
      });
      window.setTimeout(() => setMoving([]), reduced.current ? 0 : 1100 + turning.length * 70);
    },
    [flipped, maxFlip],
  );

  useImperativeHandle(ref, () => ({ goToPage: (p: number) => go(toFlipped(p)) }), [go, toFlipped]);

  // what's showing
  const label = spread ? (flipped === 0 ? `Cover` : flipped === L ? `Back cover` : `Pages ${2 * flipped}–${Math.min(n, 2 * flipped + 1)} of ${n}`) : `Page ${flipped + 1} of ${n}`;
  const firstShown = spread ? Math.max(1, 2 * flipped) : flipped + 1;
  useEffect(() => onPageChange?.(label, firstShown), [label, firstShown, onPageChange]);

  // keyboard, while the book is on screen
  useEffect(() => {
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.4 });
    if (box.current) io.observe(box.current);
    const key = (e: KeyboardEvent) => {
      if (!seen || /INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowRight") go(flipped + 1);
      if (e.key === "ArrowLeft") go(flipped - 1);
    };
    window.addEventListener("keydown", key);
    return () => (io.disconnect(), window.removeEventListener("keydown", key));
  }, [go, flipped]);

  /* ---------- drag, tap and hover-peek ---------- */
  const book = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x0: number; side: "next" | "prev"; leaf: number; active: boolean } | null>(null);
  const peeking = useRef<number | null>(null);
  const spineX = () => {
    const r = book.current!.getBoundingClientRect();
    return spread ? r.left + r.width / 2 : r.left;
  };
  const angleAt = (x: number, side: "next" | "prev", x0: number) => {
    if (spread) {
      const rel = Math.max(-1, Math.min(1, (x - spineX()) / pw));
      return (-Math.acos(rel) * 180) / Math.PI;
    }
    const p = Math.max(0, Math.min(1, (side === "next" ? x0 - x : x - x0) / (pw * 0.9)));
    return side === "next" ? -180 * p : -180 + 180 * p;
  };
  const unpeek = () => {
    if (peeking.current === null) return;
    const i = peeking.current;
    peeking.current = null;
    animate(angles.current[i], i < flipped ? -180 : 0, { type: "spring", stiffness: 160, damping: 20 });
  };
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !book.current) return;
    const right = spread ? e.clientX > spineX() : e.clientX > spineX() + pw * 0.3;
    const side = right ? "next" : "prev";
    const leaf = side === "next" ? flipped : flipped - 1;
    if (leaf < 0 || leaf >= L || (side === "next" && flipped >= maxFlip)) return;
    drag.current = { id: e.pointerId, x0: e.clientX, side, leaf, active: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      if (!d.active && Math.abs(e.clientX - d.x0) > 8) {
        d.active = true;
        peeking.current = null;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setMoving([d.leaf]);
      }
      if (d.active) angles.current[d.leaf].set(angleAt(e.clientX, d.side, d.x0));
      return;
    }
    // hover peek (mouse only, spreads only)
    if (e.pointerType !== "mouse" || !spread || !book.current) return;
    const r = book.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const want = fx > 0.82 && flipped < L ? flipped : fx < 0.18 && flipped > 0 ? flipped - 1 : null;
    if (want === peeking.current) return;
    unpeek();
    if (want !== null) {
      peeking.current = want;
      setMoving([want]);
      animate(angles.current[want], want < flipped ? -162 : -18, { type: "spring", stiffness: 140, damping: 18 });
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const a = angles.current[d.leaf].get();
    if (!d.active) {
      // a tap: right side goes forward, left side goes back
      return go(d.side === "next" ? flipped + 1 : flipped - 1);
    }
    const done = d.side === "next" ? a < -55 : a > -125;
    if (done) {
      setFlipped(d.side === "next" ? flipped + 1 : flipped - 1);
      animate(angles.current[d.leaf], d.side === "next" ? -180 : 0, SPRING);
    } else animate(angles.current[d.leaf], d.side === "next" ? 0 : -180, SPRING);
    window.setTimeout(() => setMoving([]), 900);
  };

  // the book slides so it always looks centred: closed on the cover, open in the middle, closed on the back
  const shift = spread ? (flipped === 0 ? -pw / 2 : flipped === L ? pw / 2 : 0) : 0;
  const leftStack = spread ? flipped : 0;
  const rightStack = (spread ? L : L) - flipped;
  const edge = (count: number) => Math.min(9, Math.max(count > 0 ? 1.5 : 0, count * 0.55));

  return (
    <div ref={box} className={cn("relative w-full select-none", className)}>
      {W > 0 && (
        <>
          <div className="relative flex justify-center" style={{ height: ph + 24, perspective: spread ? 2600 : 1800 }}>
            <motion.div
              ref={book}
              role="region"
              aria-roledescription="flip book"
              aria-label={`${title}: ${label}. Use the arrow keys or swipe to turn pages.`}
              className="relative mt-3 touch-pan-y"
              style={{ width: spread ? pw * 2 : pw, height: ph, transformStyle: "preserve-3d" }}
              animate={{ x: shift }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onPointerLeave={(e) => (drag.current?.active ? null : (unpeek(), e))}
            >
              {/* floor shadow */}
              <motion.div aria-hidden className="pointer-events-none absolute -bottom-5 h-8 rounded-[50%] bg-black/35 blur-xl" animate={{ left: spread && flipped === 0 ? pw * 1.05 : "6%", right: spread && flipped === L ? pw * 1.05 : "6%" }} transition={{ type: "spring", stiffness: 70, damping: 18 }} />

              {/* page stacks: the thickness of the leaves on each side */}
              {leftStack > 0 && <Stack side="left" w={edge(leftStack)} h={ph} />}
              {rightStack > 0 && <Stack side="right" w={edge(rightStack)} h={ph} x={spread ? pw * 2 : pw} />}

              {leaves.map((lf, i) => {
                const near = Math.abs(i - flipped) <= 3 || moving.includes(i);
                const z = moving.includes(i) ? L * 2 + (moving.length > 1 ? moving.indexOf(i) : 0) : i < flipped ? i + 1 : L - i + L;
                return <Leaf key={i} mv={angles.current[i]} left={spread ? pw : 0} w={pw} h={ph} z={z} front={near ? lf.front : undefined} back={near ? lf.back : undefined} single={!spread} index={i} total={n} spread={spread} />;
              })}
            </motion.div>
          </div>

          {/* controls */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => go(flipped - 1)} disabled={flipped === 0} aria-label="Previous page" className="grid h-11 w-11 place-items-center rounded-full border border-current/20 transition hover:bg-current/10 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="tabular min-w-[9.5rem] text-center text-[14px]" aria-live="polite">
              {label}
            </p>
            <button onClick={() => go(flipped + 1)} disabled={flipped >= maxFlip} aria-label="Next page" className="grid h-11 w-11 place-items-center rounded-full border border-current/20 transition hover:bg-current/10 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
            {onFullscreen && (
              <button onClick={onFullscreen} aria-label="Read full screen" className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-current/20 transition hover:bg-current/10">
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});

function Stack({ side, w, h, x = 0 }: { side: "left" | "right"; w: number; h: number; x?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top: 3,
        height: h - 6,
        width: w,
        left: side === "left" ? -w : x,
        borderRadius: side === "left" ? "3px 0 0 3px" : "0 3px 3px 0",
        background: `repeating-linear-gradient(90deg, #e6dfd6 0 1px, ${PAPER} 1px 2px)`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
      }}
    />
  );
}

function Leaf({ mv, left, w, h, z, front, back, single, index, total, spread }: { mv: MotionValue<number>; left: number; w: number; h: number; z: number; front?: string; back?: string; single: boolean; index: number; total: number; spread: boolean }) {
  // light and shade follow the angle of the page
  const frontShade = useTransform(mv, [0, -90], [0, 0.55]);
  const backShade = useTransform(mv, [-90, -180], [0.55, 0]);
  const gloss = useTransform(mv, [0, -45, -90, -135, -180], [0, 0.22, 0, 0.18, 0]);
  const lift = useTransform(mv, (a) => `0 ${4 + Math.sin((-a * Math.PI) / 180) * 18}px ${10 + Math.sin((-a * Math.PI) / 180) * 40}px rgba(0,0,0,${0.18 + Math.sin((-a * Math.PI) / 180) * 0.18})`);
  const fade = useTransform(mv, [-110, -180], [1, 0]);
  const pageNo = spread ? 2 * index + 1 : index + 1;
  return (
    <motion.div className="absolute top-0" style={{ left, width: w, height: h, zIndex: z, rotateY: mv, transformOrigin: "left center", transformStyle: "preserve-3d", opacity: single ? fade : 1 }}>
      {/* front: a right-hand page */}
      <motion.div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: PAPER, borderRadius: "0 4px 4px 0", boxShadow: lift }}>
        {front && <img src={front} alt={`Page ${pageNo} of ${total}`} draggable={false} decoding="async" className="h-full w-full object-cover" />}
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 3%, transparent 9%, transparent 94%, rgba(255,255,255,0.08) 100%)" }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: frontShade, background: "linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.35))" }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: gloss, background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)" }} />
      </motion.div>
      {/* back: the left-hand page once turned */}
      <motion.div className="absolute inset-0 overflow-hidden" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: PAPER, borderRadius: "4px 0 0 4px" }}>
        {back && <img src={back} alt={`Page ${pageNo + 1} of ${total}`} draggable={false} decoding="async" className="h-full w-full object-cover" />}
        {!back && single && front && <img src={front} alt="" aria-hidden draggable={false} className="h-full w-full scale-x-[-1] object-cover opacity-[0.12]" />}
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 3%, transparent 9%)" }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: backShade, background: "linear-gradient(270deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.35))" }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: gloss, background: "linear-gradient(260deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)" }} />
      </motion.div>
    </motion.div>
  );
}
