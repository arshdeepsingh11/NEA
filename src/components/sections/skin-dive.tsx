"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Layer = { id: string; name: string; depth: string; mm: number; line: string; nea: string; href: string; paint: (g: CanvasRenderingContext2D, s: number, r: () => number) => void };

/* ---------- textures, painted once in the browser (no images to download) ---------- */
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const skinBase = (g: CanvasRenderingContext2D, s: number, a: string, b: string) => {
  const gr = g.createRadialGradient(s * 0.45, s * 0.4, s * 0.1, s / 2, s / 2, s * 0.75);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
};
const speckle = (g: CanvasRenderingContext2D, s: number, r: () => number, n: number, light: number) => {
  for (let i = 0; i < n; i++) {
    const v = r();
    g.fillStyle = v > 0.5 ? `rgba(255,240,230,${light * r()})` : `rgba(120,60,50,${light * 0.6 * r()})`;
    g.fillRect(r() * s, r() * s, 1 + r() * 1.5, 1 + r() * 1.5);
  }
};

const LAYERS: Layer[] = [
  {
    id: "surface",
    name: "The surface",
    depth: "What you see",
    mm: 0,
    line: "This is the skin in your mirror. Smooth, glowing, or tired. It’s only the last chapter of the story.",
    nea: "Facials and gentle peels keep this layer clean, soft and bright.",
    href: "/treatments/facials",
    paint: (g, s, r) => {
      skinBase(g, s, "#f0c7b0", "#d49a82");
      speckle(g, s, r, 26000, 0.35);
      g.strokeStyle = "rgba(150,90,75,0.18)";
      for (let i = 0; i < 70; i++) {
        g.lineWidth = 0.6 + r();
        g.beginPath();
        const x = r() * s;
        const y = r() * s;
        g.moveTo(x, y);
        g.quadraticCurveTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 40, x + (r() - 0.5) * 220, y + (r() - 0.5) * 60);
        g.stroke();
      }
      const sh = g.createRadialGradient(s * 0.35, s * 0.3, 0, s * 0.35, s * 0.3, s * 0.45);
      sh.addColorStop(0, "rgba(255,250,240,0.35)");
      sh.addColorStop(1, "rgba(255,250,240,0)");
      g.fillStyle = sh;
      g.fillRect(0, 0, s, s);
    },
  },
  {
    id: "pores",
    name: "Pores",
    depth: "Up close",
    mm: 0.05,
    line: "Tiny openings where oil comes out. Too much oil plus bacteria, and you get breakouts.",
    nea: "Acne care and the BioSkin test find out what’s really going on.",
    href: "/treatments/active-acne",
    paint: (g, s, r) => {
      skinBase(g, s, "#eebfa6", "#c98a73");
      speckle(g, s, r, 14000, 0.3);
      for (let i = 0; i < 55; i++) {
        const x = r() * s;
        const y = r() * s;
        const rad = 4 + r() * 11;
        const p = g.createRadialGradient(x, y, 0, x, y, rad * 1.8);
        p.addColorStop(0, "rgba(70,30,25,0.75)");
        p.addColorStop(0.45, "rgba(150,80,65,0.45)");
        p.addColorStop(0.7, "rgba(255,225,210,0.35)");
        p.addColorStop(1, "rgba(255,225,210,0)");
        g.fillStyle = p;
        g.beginPath();
        g.arc(x, y, rad * 1.8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.6)";
        g.fillRect(x - rad * 0.6, y - rad * 0.9, 2, 2);
      }
    },
  },
  {
    id: "epidermis",
    name: "New skin cells",
    depth: "0.1 mm down",
    mm: 0.1,
    line: "Your skin makes brand-new cells here and pushes them up about once a month. Colour (pigment) is made here too.",
    nea: "Medical peels like the Perfect Derma Peel help this layer renew evenly.",
    href: "/treatments/perfect-derma-peel",
    paint: (g, s, r) => {
      g.fillStyle = "#f3d3c4";
      g.fillRect(0, 0, s, s);
      const step = 34;
      for (let y = -step; y < s + step; y += step * 0.86)
        for (let x = -step; x < s + step; x += step) {
          const cx = x + (Math.floor(y / step) % 2 ? step / 2 : 0) + (r() - 0.5) * 10;
          const cy = y + (r() - 0.5) * 10;
          const rad = step * (0.5 + r() * 0.12);
          const c = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, 1, cx, cy, rad);
          c.addColorStop(0, "rgba(255,240,232,0.95)");
          c.addColorStop(1, "rgba(226,170,160,0.95)");
          g.fillStyle = c;
          g.beginPath();
          g.ellipse(cx, cy, rad, rad * 0.86, r() * 3, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(170,100,95,0.45)";
          g.lineWidth = 1.2;
          g.stroke();
          g.fillStyle = "rgba(150,80,90,0.55)";
          g.beginPath();
          g.arc(cx + (r() - 0.5) * 6, cy + (r() - 0.5) * 6, 3 + r() * 2, 0, Math.PI * 2);
          g.fill();
          if (r() > 0.85) {
            g.fillStyle = "rgba(110,62,38,0.7)";
            for (let k = 0; k < 6; k++) g.fillRect(cx + (r() - 0.5) * rad, cy + (r() - 0.5) * rad, 2.5, 2.5);
          }
        }
    },
  },
  {
    id: "collagen",
    name: "Collagen",
    depth: "1–2 mm down",
    mm: 1.5,
    line: "A springy mesh that keeps skin firm and smooth. Sun and time slowly loosen it, and that’s where lines come from.",
    nea: "Fotona laser and microneedling wake up your own collagen.",
    href: "/treatments/fotona-laser",
    paint: (g, s, r) => {
      const bg = g.createLinearGradient(0, 0, s, s);
      bg.addColorStop(0, "#f6d9d6");
      bg.addColorStop(1, "#e7b6b8");
      g.fillStyle = bg;
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 160; i++) {
        const y0 = r() * s;
        const amp = 10 + r() * 30;
        const ph = r() * 6;
        const ang = (r() - 0.5) * 0.9;
        g.save();
        g.translate(s / 2, s / 2);
        g.rotate(ang);
        g.translate(-s / 2, -s / 2);
        g.lineWidth = 1.5 + r() * 4;
        g.strokeStyle = `rgba(${200 + r() * 55},${130 + r() * 70},${150 + r() * 60},${0.35 + r() * 0.45})`;
        g.beginPath();
        for (let x = -40; x <= s + 40; x += 12) g.lineTo(x, y0 + Math.sin(x / 38 + ph) * amp);
        g.stroke();
        g.strokeStyle = "rgba(255,255,255,0.25)";
        g.lineWidth = 0.8;
        g.stroke();
        g.restore();
      }
    },
  },
  {
    id: "vessels",
    name: "Tiny blood vessels",
    depth: "2–3 mm down",
    mm: 2.5,
    line: "They feed your skin with oxygen and nutrients. When they’re irritated, you see redness and flushing.",
    nea: "Laser calms redness, and PRP uses the healing power of your own blood.",
    href: "/treatments/rosacea",
    paint: (g, s, r) => {
      const bg = g.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s * 0.7);
      bg.addColorStop(0, "#f9e1dc");
      bg.addColorStop(1, "#eab8b0");
      g.fillStyle = bg;
      g.fillRect(0, 0, s, s);
      const branch = (x: number, y: number, a: number, len: number, w: number, d: number) => {
        if (d > 7 || w < 0.4) return;
        const x2 = x + Math.cos(a) * len;
        const y2 = y + Math.sin(a) * len;
        g.strokeStyle = `rgba(${170 + r() * 40},${30 + r() * 20},${45 + r() * 20},${0.55 + w / 20})`;
        g.lineWidth = w;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * len * 0.5, (y + y2) / 2 + (r() - 0.5) * len * 0.5, x2, y2);
        g.stroke();
        branch(x2, y2, a + (r() - 0.5) * 0.9 - 0.35, len * 0.78, w * 0.68, d + 1);
        branch(x2, y2, a + (r() - 0.5) * 0.9 + 0.35, len * 0.78, w * 0.68, d + 1);
      };
      for (let i = 0; i < 7; i++) branch(r() < 0.5 ? -10 : s + 10, r() * s, r() < 0.5 ? 0 : Math.PI, 90 + r() * 60, 7 + r() * 4, 0);
    },
  },
  {
    id: "microbiome",
    name: "Your microbiome",
    depth: "On your skin and in your gut",
    mm: 3,
    line: "Trillions of tiny helpers live on your skin and in your gut. When they’re out of balance, it shows on your face.",
    nea: "BioSkin and BioGut tests show what’s living there, and our dietitian helps you fix it.",
    href: "/microbiome",
    paint: (g, s, r) => {
      const bg = g.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s * 0.75);
      bg.addColorStop(0, "#2b2030");
      bg.addColorStop(1, "#140e16");
      g.fillStyle = bg;
      g.fillRect(0, 0, s, s);
      const hues = ["120,220,210", "190,150,255", "243,217,164", "255,150,170"];
      for (let i = 0; i < 140; i++) {
        const c = hues[Math.floor(r() * hues.length)];
        const x = r() * s;
        const y = r() * s;
        g.save();
        g.translate(x, y);
        g.rotate(r() * Math.PI);
        g.shadowColor = `rgba(${c},0.9)`;
        g.shadowBlur = 12;
        g.fillStyle = `rgba(${c},${0.55 + r() * 0.4})`;
        if (r() > 0.45) {
          const l = 14 + r() * 22;
          g.beginPath();
          g.roundRect(-l / 2, -4, l, 8, 4);
          g.fill();
        } else {
          for (let k = 0; k < 1 + Math.floor(r() * 4); k++) {
            g.beginPath();
            g.arc(k * 9, 0, 4 + r() * 1.5, 0, Math.PI * 2);
            g.fill();
          }
        }
        g.restore();
      }
    },
  },
];

/** One full-screen texture that flies towards you as you scroll past its depth. */
function DiveLayer({ layer, i, p }: { layer: Layer; i: number; p: MotionValue<number> }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!;
    const s = 900;
    c.width = s;
    c.height = s;
    layer.paint(c.getContext("2d")!, s, rnd(1000 + i * 77));
  }, [layer, i]);
  const u = useTransform(p, (v) => v - i);
  const scale = useTransform(u, [-1, 0, 1], [0.45, 1, 3.4]);
  const opacity = useTransform(u, [-1, -0.45, 0, 0.55, 1], [0, 1, 1, 0.6, 0]);
  const blur = useTransform(u, [-1, 0, 0.5, 1], ["blur(10px)", "blur(0px)", "blur(1px)", "blur(14px)"]);
  return (
    <motion.div className="absolute inset-0 will-change-transform [-webkit-mask-image:radial-gradient(ellipse_farthest-side,black_72%,transparent)] [mask-image:radial-gradient(ellipse_farthest-side,black_72%,transparent)]" style={{ scale, opacity, filter: blur, zIndex: 10 - i }}>
      <canvas ref={cv} aria-hidden className="h-full w-full object-cover" />
    </motion.div>
  );
}

/**
 * Skin Dive: scroll and travel into your skin, from the surface to collagen, blood vessels and the microbiome.
 * At every depth, one plain sentence about what lives there and which NEA treatment works at that depth.
 */
export function SkinDive() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, [0.04, 0.96], [0, LAYERS.length - 1]);
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(p, "change", (v) => setIdx(Math.max(0, Math.min(LAYERS.length - 1, Math.round(v)))));
  const meter = useTransform(p, [0, LAYERS.length - 1], ["0%", "100%"]);
  const L = LAYERS[idx];

  return (
    <section ref={ref} aria-label="Skin Dive" className="relative" style={{ height: `${LAYERS.length * 85 + 40}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#140e10]">
        <div className="absolute inset-0">
          {LAYERS.map((l, i) => (
            <DiveLayer key={l.id} layer={l} i={i} p={p} />
          ))}
          {/* lens: soft vignette and a magnifier ring */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20" style={{ background: "radial-gradient(70% 65% at 50% 50%, transparent 55%, rgba(12,8,10,0.85) 100%)" }} />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-square w-[min(78vw,70svh)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 shadow-[inset_0_0_80px_rgba(255,255,255,0.08)]" />
        </div>

        {/* the words */}
        <div className="container relative z-30 flex h-full flex-col justify-end pb-[calc(var(--dock-h)+1.5rem)] md:justify-center md:pb-0">
          <p className="text-[12.5px] uppercase tracking-[0.2em] text-white/60">Dive into your skin</p>
          <AnimatePresence mode="wait">
            <motion.div key={L.id} initial={{ opacity: 0, y: 18, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12, filter: "blur(6px)" }} transition={{ duration: 0.45 }} className="mt-3 max-w-md rounded-[28px] border border-white/15 bg-black/35 p-5 text-white backdrop-blur-xl md:p-6">
              <p className="tabular text-[12px] text-[#f3d9a4]">
                {String(idx + 1).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")} · {L.depth}
              </p>
              <h2 className="mt-1 font-display text-[clamp(2rem,5vw,3.2rem)] leading-[1]">{L.name}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-white/85">{L.line}</p>
              <Link href={L.href} className="mt-4 flex items-start gap-2 rounded-2xl bg-white/10 p-3 text-[14.5px] text-white hover:bg-white/15">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#f3d9a4]" />
                <span className="flex-1">{L.nea}</span>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* depth gauge */}
        <div aria-hidden className="absolute right-4 top-1/2 z-30 hidden h-[52svh] -translate-y-1/2 items-stretch gap-3 text-white sm:flex md:right-10">
          <div className="relative w-px bg-white/25">
            <motion.span className="absolute -left-[5px] h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-[#f3d9a4] shadow-[0_0_14px_rgba(243,217,164,0.9)]" style={{ top: meter }} />
          </div>
          <ul className="flex flex-col justify-between text-[11.5px]">
            {LAYERS.map((l, i) => (
              <li key={l.id} className={cn("transition", i === idx ? "text-white" : "text-white/40")}>
                {l.name}
              </li>
            ))}
          </ul>
        </div>
        <p aria-hidden className="absolute left-1/2 top-[4.75rem] z-30 whitespace-nowrap md:top-6 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1 text-[11.5px] text-white/70 backdrop-blur">
          Keep scrolling to go deeper
        </p>
      </div>
    </section>
  );
}
