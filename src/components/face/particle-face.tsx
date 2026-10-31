"use client";
import { useEffect, useRef } from "react";
import { BASE, EDGES, ZONES } from "@/content/face-mesh";
import { cn } from "@/lib/utils";

type P3 = [number, number, number];

// Every vertex plus two points along every edge: about 3,100 particles of light.
const PARTICLES: { p: P3; tone: number; zone?: string }[] = (() => {
  const zoneOf = new Map<number, string>();
  for (const [z, ids] of Object.entries(ZONES)) ids.forEach((i) => zoneOf.set(i, z));
  const out: { p: P3; tone: number; zone?: string }[] = BASE.map((p, i) => ({ p, tone: 1, zone: zoneOf.get(i) }));
  for (const [a, b] of EDGES) {
    const A = BASE[a];
    const B = BASE[b];
    for (const t of [1 / 3, 2 / 3]) out.push({ p: [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], tone: 0.55 });
  }
  return out;
})();
const CENTROID: Record<string, P3> = Object.fromEntries(
  Object.entries(ZONES).map(([z, ids]) => [z, ids.reduce((s, i) => [s[0] + BASE[i][0] / ids.length, s[1] + BASE[i][1] / ids.length, s[2] + BASE[i][2] / ids.length], [0, 0, 0] as P3)]),
);

export const ZONE_LABEL: Record<string, string> = { forehead: "Forehead", undereye: "Under-eye", cheeks: "Cheeks", tzone: "Nose & T-zone", mouth: "Lips & smile lines", jaw: "Jawline & chin" };

/**
 * A face made of light: ~3,100 particles on a real 468-point face mesh, breathing and turning in 3D.
 * Particles ripple away from the pointer, a scan beam passes over the face, and face zones glow in turn.
 * Tap a zone to choose it (onZone). Drawn on a 2D canvas, paused when off screen, still for reduced motion.
 */
export function ParticleFace({ className, zone, onZone, demo = true, labels = true }: { className?: string; zone?: string | null; onZone?: (z: string) => void; demo?: boolean; labels?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ zone: zone ?? null, mx: -9, my: -9, demoZone: "cheeks", hover: null as string | null });
  state.current.zone = zone ?? null;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);

    const zones = Object.keys(ZONES);
    let dz = 0;
    const demoTimer = demo ? window.setInterval(() => (state.current.demoZone = zones[(dz = (dz + 1) % zones.length)]), 2600) : 0;

    const proj = (p: P3, ry: number, rx: number, s: number, cx: number, cy: number) => {
      const cy_ = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx_ = Math.cos(rx);
      const sx = Math.sin(rx);
      const x1 = p[0] * cy_ - p[2] * sy;
      const z1 = p[0] * sy + p[2] * cy_;
      const y2 = p[1] * cx_ - z1 * sx;
      const z2 = p[1] * sx + z1 * cx_;
      const f = 3.2 / (3.2 + z2);
      return [cx + x1 * s * f, cy + y2 * s * f, z2, f] as const;
    };

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !W) return;
      const t = reduce ? 0 : (now - t0) / 1000;
      const st = state.current;
      const active = st.hover ?? st.zone ?? (demo ? st.demoZone : null);
      const scale = Math.min(W * 1.02, H * 0.68) * (1 + Math.sin(t * 0.9) * 0.012);
      const cx = W / 2;
      const cy = H * 0.5;
      const ry = Math.sin(t * 0.35) * 0.3 + (st.mx > -1 ? (st.mx / W - 0.5) * 0.5 : 0);
      const rx = Math.sin(t * 0.27) * 0.08 + (st.my > -1 ? (st.my / H - 0.5) * -0.25 : 0);
      const beam = ((t * 0.32) % 1.6) - 0.3; // passes from top to bottom, then rests

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // the mesh, faintly
      const pts = BASE.map((p) => proj(p, ry, rx, scale, cx, cy));
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(243,217,164,0.10)";
      ctx.beginPath();
      for (const [a, b] of EDGES) {
        if (pts[a][2] > 0.06 && pts[b][2] > 0.06) continue; // hide the far side
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
      }
      ctx.stroke();

      // particles
      ctx.globalCompositeOperation = "lighter";
      const ys = scale * 0.5;
      for (const q of PARTICLES) {
        let [x, y, z, f] = proj(q.p, ry, rx, scale, cx, cy);
        if (z > 0.08) continue;
        // ripple away from the pointer
        const dx = x - st.mx;
        const dy = y - st.my;
        const d2 = dx * dx + dy * dy;
        let lift = 0;
        if (d2 < 5000) {
          const k = (1 - d2 / 5000) * 10;
          const d = Math.sqrt(d2) || 1;
          x += (dx / d) * k;
          y += (dy / d) * k;
          lift = k / 10;
        }
        const yn = (y - (cy - ys)) / (2 * ys); // 0 top → 1 bottom
        const near = Math.abs(yn - beam) < 0.04 ? 1 - Math.abs(yn - beam) / 0.04 : 0;
        const inZone = active && q.zone === active;
        const a = Math.min(1, (0.28 + (-z + 0.1) * 1.6) * q.tone + near * 0.7 + lift * 0.6 + (inZone ? 0.8 : 0));
        const r = (inZone ? 2.4 : 1.1 + near * 1.2) * f;
        // gold at the top, rose towards the chin
        const R = 243;
        const G = Math.round(217 - yn * 80);
        const B = Math.round(164 - yn * 30 + near * 80);
        ctx.fillStyle = `rgba(${R},${G},${B},${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // scan beam
      if (beam > 0 && beam < 1) {
        const by = cy - ys + beam * 2 * ys;
        const g = ctx.createLinearGradient(0, by - 1, W, by + 1);
        g.addColorStop(0, "rgba(243,217,164,0)");
        g.addColorStop(0.5, "rgba(255,240,220,0.55)");
        g.addColorStop(1, "rgba(243,217,164,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - scale * 0.55, by - 0.75, scale * 1.1, 1.5);
      }

      // zone halo and label
      if (active && CENTROID[active]) {
        const [zx, zy] = proj(CENTROID[active], ry, rx, scale, cx, cy);
        const pulse = 1 + Math.sin(t * 3) * 0.08;
        ctx.strokeStyle = "rgba(255,240,220,0.75)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(zx, zy, scale * 0.09 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        if (labels) {
          const right = zx < cx;
          const lx = right ? zx + scale * 0.16 : zx - scale * 0.16;
          ctx.strokeStyle = "rgba(243,217,164,0.6)";
          ctx.beginPath();
          ctx.moveTo(zx + (right ? 1 : -1) * scale * 0.09, zy);
          ctx.lineTo(lx, zy);
          ctx.stroke();
          const text = ZONE_LABEL[active] ?? active;
          ctx.font = "500 12px Inter, system-ui, sans-serif";
          const tw = ctx.measureText(text).width;
          const bx = right ? lx : lx - tw - 20;
          ctx.fillStyle = "rgba(20,14,16,0.55)";
          ctx.beginPath();
          ctx.roundRect(bx, zy - 13, tw + 20, 26, 13);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(text, bx + 10, zy + 4);
        }
      }
      // remember where the zones are for taps
      cv.dataset.zones = JSON.stringify(Object.fromEntries(Object.entries(CENTROID).map(([z, c]) => [z, proj(c, ry, rx, scale, cx, cy).slice(0, 2).map(Math.round)])));
      cv.dataset.r = String(Math.round(scale * 0.11));
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (demoTimer) clearInterval(demoTimer);
    };
  }, [demo, labels]);

  const zoneAt = (e: React.PointerEvent) => {
    const cv = ref.current!;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const zs = JSON.parse(cv.dataset.zones || "{}") as Record<string, [number, number]>;
    const rad = Number(cv.dataset.r || 40);
    let best: string | null = null;
    let bd = rad * rad;
    for (const [z, [zx, zy]] of Object.entries(zs)) {
      const d = (zx - x) ** 2 + (zy - y) ** 2;
      if (d < bd) (bd = d), (best = z);
    }
    return { x, y, best };
  };

  return (
    <canvas
      ref={ref}
      className={cn("block h-full w-full", onZone && "cursor-pointer", className)}
      onPointerMove={(e) => {
        const { x, y, best } = zoneAt(e);
        state.current.mx = x;
        state.current.my = y;
        state.current.hover = onZone && e.pointerType === "mouse" ? best : null;
      }}
      onPointerLeave={() => Object.assign(state.current, { mx: -9, my: -9, hover: null })}
      onClick={(e) => {
        const { best } = zoneAt(e as unknown as React.PointerEvent);
        if (best && onZone) onZone(best);
      }}
      role={onZone ? "img" : undefined}
      aria-label="A face drawn in light, with the six face zones NEA looks at"
    />
  );
}
