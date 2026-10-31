"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";
import { openMirror } from "@/components/face/open-mirror";
import { cn } from "@/lib/utils";

type Wish = { id: string; label: string; line: string; a: [number, number, number]; b: [number, number, number] };

/** What people want from their skin, in their words. Each one tints the drop. */
const WISHES: Wish[] = [
  { id: "glow", label: "Glow", line: "Skin that looks rested. Even on a busy week.", a: [255, 232, 196], b: [226, 160, 112] },
  { id: "clear", label: "Clear", line: "Fewer breakouts, because we fix the reason.", a: [255, 214, 222], b: [208, 112, 140] },
  { id: "calm", label: "Calm", line: "Less redness. Skin that finally settles down.", a: [226, 240, 222], b: [128, 172, 132] },
  { id: "even", label: "Even", line: "Softer dark spots. One tone, all over.", a: [238, 222, 248], b: [158, 118, 206] },
];

const SPOT: Record<string, string> = {
  glow: "left-[8%] top-[27%]",
  clear: "right-[8%] top-[22%]",
  calm: "left-[6%] top-[55%]",
  even: "right-[6%] top-[50%]",
};

const mix = (x: number[], y: number[], k: number) => x.map((v, i) => v + (y[i] - v) * k) as [number, number, number];
const rgb = (c: number[], a = 1) => `rgba(${c.map((v) => Math.round(v)).join(",")},${a})`;

/**
 * The home hero: a drop of serum made of light. It breathes, sways and dents where you touch it,
 * and takes the colour of what you want from your skin (glow, clear, calm, even).
 * Drawn on a 2D canvas; pauses off screen; still for reduced motion.
 */
export function GlowDrop({ className }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(0);
  const [held, setHeld] = useState(false);
  const st = useRef({ on: 0, mx: -1, my: -1, ripple: -1e9 });
  st.current.on = on;

  // cycle through the wishes until someone picks one
  useEffect(() => {
    if (held) return;
    const t = window.setInterval(() => setOn((v) => (v + 1) % WISHES.length), 3600);
    return () => clearInterval(t);
  }, [held]);

  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = c.getBoundingClientRect();
      W = r.width;
      H = r.height;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    // tiny bubbles suspended in the serum
    const bubbles = Array.from({ length: 34 }, (_, i) => ({ a: (i * 2.399) % (Math.PI * 2), r: ((i * 0.618) % 1) * 0.85, s: 0.4 + ((i * 0.37) % 1) * 1.6, v: 0.02 + ((i * 0.53) % 1) * 0.05 }));
    let ca = WISHES[0].a;
    let cb = WISHES[0].b;
    let raf = 0;
    const t0 = performance.now();
    const N = 120;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !W) return;
      const t = reduce ? 0 : (now - t0) / 1000;
      const s = st.current;
      const w = WISHES[s.on];
      ca = mix(ca, w.a, 0.04);
      cb = mix(cb, w.b, 0.04);

      const R = Math.min(W, H) * 0.26;
      const cx = W / 2 + Math.sin(t * 0.5) * R * 0.03;
      const cy = H * 0.43 + Math.sin(t * 0.8) * R * 0.04;
      const pa = s.mx > -1 ? Math.atan2(s.my - cy, s.mx - cx) : 0;
      const pd = s.mx > -1 ? Math.hypot(s.mx - cx, s.my - cy) / R : 9;
      const press = pd < 1.6 ? (1.6 - pd) / 1.6 : 0;
      const rt = reduce ? 9 : (now - s.ripple) / 1000;

      const shape: [number, number][] = [];
      for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2;
        let r = 1 + 0.022 * Math.sin(2 * th + t * 0.9) + 0.012 * Math.sin(3 * th - t * 1.2) + 0.005 * Math.sin(5 * th + t * 0.6);
        // a drop is a little heavier at the bottom
        r += 0.05 * Math.max(0, Math.sin(th)) ** 2;
        if (press) {
          let d = Math.abs(th - pa);
          d = Math.min(d, Math.PI * 2 - d);
          r -= 0.09 * press * Math.exp(-(d * d) / 0.25);
        }
        if (rt > 0 && rt < 2.4) r += 0.05 * Math.exp(-rt * 1.6) * Math.sin(th * 6 - rt * 14);
        shape.push([cx + Math.cos(th) * R * r, cy + Math.sin(th) * R * r * 1.04]);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // soft shadow it casts
      const sh = ctx.createRadialGradient(cx, cy + R * 1.32, 0, cx, cy + R * 1.32, R * 0.95);
      sh.addColorStop(0, rgb(cb, 0.32));
      sh.addColorStop(1, rgb(cb, 0));
      ctx.save();
      ctx.translate(0, cy + R * 1.32);
      ctx.scale(1, 0.18);
      ctx.translate(0, -(cy + R * 1.32));
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.arc(cx, cy + R * 1.32, R * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const path = () => {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const [x0, y0] = shape[i % N];
          const [x1, y1] = shape[(i + 1) % N];
          const mx = (x0 + x1) / 2;
          const my = (y0 + y1) / 2;
          if (i === 0) ctx.moveTo(mx, my);
          else ctx.quadraticCurveTo(x0, y0, mx, my);
        }
        ctx.closePath();
      };

      // the body of the drop
      const lx = cx - R * 0.35 + (s.mx > -1 ? ((s.mx - cx) / W) * R * 0.3 : 0);
      const ly = cy - R * 0.42 + (s.my > -1 ? ((s.my - cy) / H) * R * 0.3 : 0);
      const body = ctx.createRadialGradient(lx, ly, R * 0.05, cx, cy, R * 1.15);
      body.addColorStop(0, "rgba(255,253,250,0.98)");
      body.addColorStop(0.35, rgb(ca, 0.95));
      body.addColorStop(1, rgb(cb, 0.95));
      path();
      ctx.fillStyle = body;
      ctx.fill();

      ctx.save();
      path();
      ctx.clip();
      // pearly shimmer
      if ("createConicGradient" in ctx) {
        const cg = ctx.createConicGradient(t * 0.25, cx, cy);
        ["rgba(255,210,230,0.0)", "rgba(255,226,190,0.35)", "rgba(200,220,255,0.3)", "rgba(230,200,255,0.35)", "rgba(255,210,230,0.0)"].forEach((col, i, a) => cg.addColorStop(i / (a.length - 1), col));
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = cg;
        ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
        ctx.globalCompositeOperation = "source-over";
      }
      // depth at the rim
      const rim = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.12);
      rim.addColorStop(0, rgb(cb, 0));
      rim.addColorStop(1, rgb(mix(cb, [90, 50, 60], 0.35), 0.45));
      ctx.fillStyle = rim;
      ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
      // light caught at the bottom
      const caus = ctx.createRadialGradient(cx + R * 0.25, cy + R * 0.62, 0, cx + R * 0.25, cy + R * 0.62, R * 0.55);
      caus.addColorStop(0, "rgba(255,255,255,0.55)");
      caus.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = caus;
      ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
      // bubbles drifting up
      for (const b of bubbles) {
        const y = ((b.r * 2 - ((t * b.v) % 2) + 2) % 2) - 1;
        const x = Math.cos(b.a) * 0.75 + Math.sin(t * 0.6 + b.a) * 0.03;
        const bx = cx + x * R * Math.sqrt(Math.max(0, 1 - y * y));
        const by = cy + y * R;
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * (1 - Math.abs(y))})`;
        ctx.beginPath();
        ctx.arc(bx, by, b.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // glassy edge
      path();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.stroke();

      // the bright highlight that makes it look wet
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(-0.55);
      const hl = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.3);
      hl.addColorStop(0, "rgba(255,255,255,0.95)");
      hl.addColorStop(0.5, "rgba(255,255,255,0.35)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.scale(1, 0.45);
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(lx + R * 0.28, ly - R * 0.05, R * 0.03, 0, Math.PI * 2);
      ctx.fill();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const w = WISHES[on];
  const pick = (i: number) => {
    setHeld(true);
    setOn(i);
    st.current.ripple = performance.now();
  };

  return (
    <div className={cn("relative mx-auto aspect-[4/5] w-full max-w-[560px]", className)}>
      <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[36px] shadow-[0_50px_120px_-60px_rgba(var(--shadow-tint),0.6)] transition-[background] duration-1000" style={{ background: `radial-gradient(70% 55% at 50% 42%, ${rgb(w.a, 0.9)}, rgba(255,250,247,0.95) 70%), #fbf6f3` }}>
        <canvas
          ref={cv}
          aria-hidden
          className="absolute inset-0 h-full w-full touch-pan-y"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            st.current.mx = e.clientX - r.left;
            st.current.my = e.clientY - r.top;
          }}
          onPointerLeave={() => Object.assign(st.current, { mx: -1, my: -1 })}
          onClick={() => pick((on + 1) % WISHES.length)}
        />

        <p className="pointer-events-none absolute inset-x-0 top-[12%] px-10 text-center text-[11px] uppercase tracking-[0.18em] text-ink/55 sm:text-[12px] sm:tracking-[0.22em]">What do you want more of?</p>

        {WISHES.map((x, i) => (
          <button
            key={x.id}
            onClick={() => pick(i)}
            aria-pressed={i === on}
            className={cn(
              "absolute rounded-full border px-4 py-2 text-[14px] font-medium backdrop-blur-md transition duration-500 sm:px-5 sm:py-2.5 sm:text-[15px]",
              SPOT[x.id],
              i === on ? "scale-105 border-white bg-white text-ink shadow-[0_14px_40px_-14px_rgba(var(--shadow-tint),0.6)]" : "border-white/70 bg-white/40 text-ink/70 hover:bg-white/70",
            )}
          >
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: rgb(x.b) }} />
            {x.label}
          </button>
        ))}

        <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.p key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }} className="max-w-[20rem] font-display text-[clamp(1.25rem,3.4vw,1.6rem)] leading-snug text-ink">
              {w.line}
            </motion.p>
          </AnimatePresence>
          <button onClick={() => openMirror()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14.5px] font-medium text-white shadow-[0_18px_40px_-16px_rgba(var(--shadow-tint),0.8)] transition hover:bg-ink/90 active:scale-[0.97]">
            <Camera className="h-4 w-4" /> See your skin in the mirror
          </button>
        </div>
      </div>
    </div>
  );
}
