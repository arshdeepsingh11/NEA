"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Compass, LocateFixed, Minus, Navigation, Plus, RotateCcw, TrainFront } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPE } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Holo Map: NEA's own interactive map of NE Calgary (no Google embed).
 * Drag or swipe to move, pinch or scroll to zoom, switch to 3D, tap a place to see the drive,
 * or tap "Locate me" for your own distance. Schematic: roads and places are approximate.
 */
type LL = [number, number]; // [lat, lng]
const C: LL = [site.address.lat, site.address.lng];
const KX = 111.32 * Math.cos((C[0] * Math.PI) / 180);
const KY = 110.57;
const toXY = ([lat, lng]: LL) => [(lng - C[1]) * KX, -(lat - C[0]) * KY] as const;
const km = (a: LL, b: LL) => Math.hypot((a[1] - b[1]) * KX, (a[0] - b[0]) * KY);
// city driving: ~1.3× straight-line distance at ~38 km/h average
const driveMin = (d: number) => Math.max(3, Math.round(((d * 1.3) / 38) * 60));

const ROADS: { name: string; pts: LL[]; major?: boolean }[] = [
  { name: "Deerfoot Trail", major: true, pts: [[50.99, -114.025], [51.03, -114.032], [51.055, -114.04], [51.08, -114.035], [51.11, -114.03], [51.15, -114.02]] },
  { name: "Stoney Trail", major: true, pts: [[51.16, -114.06], [51.162, -113.99], [51.15, -113.935], [51.1, -113.925], [51.05, -113.925], [50.99, -113.93]] },
  { name: "16 Ave NE (Hwy 1)", major: true, pts: [[51.067, -114.09], [51.067, -113.92]] },
  { name: "32 Ave NE", pts: [[51.082, -114.06], [51.082, -113.92]] },
  { name: "McKnight Blvd", pts: [[51.096, -114.09], [51.096, -113.92]] },
  { name: "Memorial Dr", pts: [[51.051, -114.075], [51.051, -113.92]] },
  { name: "Country Hills Blvd", pts: [[51.15, -114.06], [51.15, -113.93]] },
  { name: "36 St NE", pts: [[51.0, -113.985], [51.14, -113.985]] },
  { name: "Barlow Trail", pts: [[51.03, -114.006], [51.13, -114.006]] },
  { name: "52 St NE", pts: [[51.0, -113.955], [51.15, -113.955]] },
  { name: "27 St NE", pts: [[51.07, -114.0], [51.095, -114.0]] },
];
const RIVER: LL[] = [[51.06, -114.12], [51.052, -114.085], [51.047, -114.06], [51.042, -114.04], [51.03, -114.02], [51.012, -114.01], [50.99, -114.0]];
const TRAIN: LL[] = [[51.047, -114.06], [51.05, -114.03], [51.053, -114.011], [51.064, -113.995], [51.077, -113.983], [51.087, -113.972], [51.095, -113.96], [51.105, -113.955], [51.12, -113.948]];

type Place = { name: string; at: LL; kind: "area" | "landmark" | "transit" };
const PLACES: Place[] = [
  { name: "Downtown", at: [51.046, -114.065], kind: "area" },
  { name: "YYC Airport", at: [51.131, -114.01], kind: "landmark" },
  { name: "Sunridge", at: [51.074, -113.985], kind: "area" },
  { name: "Whitehorn", at: [51.088, -113.968], kind: "area" },
  { name: "Rundle", at: [51.07, -113.97], kind: "area" },
  { name: "Marlborough", at: [51.058, -113.965], kind: "area" },
  { name: "Falconridge", at: [51.1, -113.945], kind: "area" },
  { name: "Saddle Ridge", at: [51.13, -113.945], kind: "area" },
  { name: "Martindale", at: [51.118, -113.955], kind: "area" },
  { name: "Taradale", at: [51.122, -113.935], kind: "area" },
  { name: "Redstone", at: [51.168, -113.955], kind: "area" },
  { name: "Bridgeland", at: [51.054, -114.04], kind: "area" },
  { name: "Mayland Heights", at: [51.062, -114.01], kind: "area" },
  { name: "Rundle station", at: [51.077, -113.983], kind: "transit" },
];

const path = (pts: LL[]) => pts.map((p, i) => `${i ? "L" : "M"}${toXY(p)[0].toFixed(2)},${toXY(p)[1].toFixed(2)}`).join(" ");

export function HoloMap({ className }: { className?: string }) {
  const [view, setView] = useState({ x: 0, y: 0, s: 1 });
  const [tilt, setTilt] = useState(false);
  const [sel, setSel] = useState<Place | null>(null);
  const [me, setMe] = useState<LL | null>(null);
  const [locating, setLocating] = useState<"idle" | "busy" | "denied">("idle");
  const svg = useRef<SVGSVGElement>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; d: number } | null>(null);
  const moved = useRef(0);

  // map units: 1 = 1 km; viewBox shows ±9 km around the clinic at zoom 1
  const VB = 18;
  const clamp = (v: { x: number; y: number; s: number }) => ({ s: Math.min(6, Math.max(0.6, v.s)), x: Math.max(-12, Math.min(12, v.x)), y: Math.max(-12, Math.min(12, v.y)) });
  const toKm = useCallback((dx: number, dy: number) => {
    const r = svg.current?.getBoundingClientRect();
    const k = r ? VB / Math.min(r.width, r.height) : 0.02;
    return [(dx * k) / view.s, (dy * k) / view.s] as const;
  }, [view.s]);

  const onDown = (e: RPE) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    last.current = null;
  };
  const onMove = (e: RPE) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...ptrs.current.values()];
    const cx = ps.reduce((a, p) => a + p.x, 0) / ps.length;
    const cy = ps.reduce((a, p) => a + p.y, 0) / ps.length;
    const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0;
    if (last.current) {
      const [mx, my] = toKm(cx - last.current.x, cy - last.current.y);
      moved.current += Math.abs(cx - last.current.x) + Math.abs(cy - last.current.y);
      setView((v) => clamp({ x: v.x - mx, y: v.y - (tilt ? my * 1.6 : my), s: d && last.current!.d ? v.s * (d / last.current!.d) : v.s }));
    }
    last.current = { x: cx, y: cy, d };
  };
  const onUp = (e: RPE) => {
    ptrs.current.delete(e.pointerId);
    last.current = null;
  };

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => clamp({ ...v, s: v.s * (e.deltaY < 0 ? 1.12 : 0.89) }));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return setLocating("denied");
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const ll: LL = [p.coords.latitude, p.coords.longitude];
        setMe(ll);
        setSel(null);
        setLocating("idle");
        const [x, y] = toXY(ll);
        const d = Math.hypot(x, y);
        setView({ x: x / 2, y: y / 2, s: Math.min(3, Math.max(0.6, 7 / Math.max(1, d))) });
      },
      () => setLocating("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const target = sel?.at ?? me;
  const dist = target ? km(target, C) : null;
  const routeD = useMemo(() => {
    if (!target) return "";
    const [x, y] = toXY(target);
    // a gentle curve toward the clinic, like a route line
    return `M${x},${y} Q${x * 0.35 + y * 0.18},${y * 0.6 - x * 0.12} 0,0`;
  }, [target]);
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`;
  const inv = 1 / view.s; // keep labels and pins the same size while zooming

  return (
    <div className={cn("relative overflow-hidden rounded-[32px] border border-white/80 bg-[radial-gradient(120%_90%_at_50%_40%,rgb(var(--c-bg)),rgb(var(--c-mist)))]", className)}>
      <div className="absolute inset-0" style={{ perspective: "1100px" }}>
        <motion.div className="absolute inset-0" animate={{ rotateX: tilt ? 52 : 0, scale: tilt ? 1.25 : 1, y: tilt ? "6%" : "0%" }} transition={{ type: "spring", stiffness: 90, damping: 18 }} style={{ transformOrigin: "50% 60%" }}>
          <svg
            ref={svg}
            viewBox={`${-VB / 2} ${-VB / 2} ${VB} ${VB}`}
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label="Interactive map of NE Calgary showing NEA Precision Skin at 3151 27 Street NE"
          >
            <defs>
              <pattern id="hm-dots" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                <circle cx="0.25" cy="0.25" r="0.03" fill="rgb(var(--c-ink) / 0.18)" />
              </pattern>
              <radialGradient id="hm-glow">
                <stop offset="0" stopColor="rgb(var(--c-accent))" stopOpacity="0.35" />
                <stop offset="1" stopColor="rgb(var(--c-accent))" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hm-route" x1="0" x2="1">
                <stop offset="0" stopColor="rgb(var(--c-accent2))" />
                <stop offset="1" stopColor="rgb(var(--c-accent))" />
              </linearGradient>
            </defs>
            <g transform={`scale(${view.s}) translate(${-view.x} ${-view.y})`}>
              <rect x="-40" y="-40" width="80" height="80" fill="url(#hm-dots)" />
              {/* drive-time rings around the clinic */}
              {[5, 10, 15].map((m) => {
                const r = ((m / 60) * 38) / 1.3;
                return (
                  <g key={m}>
                    <circle r={r} fill="none" stroke="rgb(var(--c-accent) / 0.25)" strokeWidth={0.04 * inv} strokeDasharray={`${0.15 * inv} ${0.15 * inv}`} />
                    <text x={r * 0.71 + 0.15} y={-r * 0.71} fontSize={0.34 * inv} fill="rgb(var(--c-accent))" style={{ fontFamily: "var(--font-sans)" }}>
                      {m} min
                    </text>
                  </g>
                );
              })}
              <path d={path(RIVER)} fill="none" stroke="rgb(var(--c-accent3) / 0.35)" strokeWidth={0.5} strokeLinecap="round" />
              {ROADS.map((r) => (
                <path key={r.name} d={path(r.pts)} fill="none" stroke={r.major ? "rgb(var(--c-ink) / 0.32)" : "rgb(var(--c-ink) / 0.16)"} strokeWidth={(r.major ? 0.16 : 0.08) * Math.max(0.7, inv)} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              <path d={path(TRAIN)} fill="none" stroke="rgb(var(--c-accent2) / 0.55)" strokeWidth={0.07 * inv} strokeDasharray={`${0.25 * inv} ${0.12 * inv}`} />
              {ROADS.filter((r) => r.major || view.s > 1.6).map((r) => {
                const [x, y] = toXY(r.pts[Math.floor(r.pts.length / 2)]);
                return (
                  <text key={r.name} x={x + 0.15} y={y - 0.15} fontSize={0.3 * inv} fill="rgb(var(--c-ink) / 0.45)" style={{ fontFamily: "var(--font-sans)" }}>
                    {r.name}
                  </text>
                );
              })}
              {routeD && (
                <motion.path key={routeD} d={routeD} fill="none" stroke="url(#hm-route)" strokeWidth={0.12 * inv} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }} />
              )}
              {PLACES.map((p) => {
                const [x, y] = toXY(p.at);
                const on = sel?.name === p.name;
                return (
                  <g
                    key={p.name}
                    transform={`translate(${x} ${y})`}
                    className="cursor-pointer"
                    onClick={() => moved.current < 6 && setSel(on ? null : p)}
                    role="button"
                    aria-label={`${p.name}: about ${driveMin(km(p.at, C))} minutes to NEA`}
                  >
                    <circle r={0.6 * inv} fill="transparent" />
                    <circle r={(on ? 0.16 : 0.1) * inv} fill={p.kind === "transit" ? "rgb(var(--c-accent2))" : on ? "rgb(var(--c-accent))" : "rgb(var(--c-ink) / 0.55)"} />
                    <text x={0.22 * inv} y={0.1 * inv} fontSize={(on ? 0.4 : 0.32) * inv} fill={on ? "rgb(var(--c-ink))" : "rgb(var(--c-ink) / 0.7)"} style={{ fontFamily: "var(--font-sans)", fontWeight: on ? 600 : 400 }}>
                      {p.name}
                    </text>
                  </g>
                );
              })}
              {me && (
                <g transform={`translate(${toXY(me)[0]} ${toXY(me)[1]})`}>
                  <circle r={0.5 * inv} fill="rgb(var(--c-accent2) / 0.2)">
                    <animate attributeName="r" values={`${0.2 * inv};${0.7 * inv};${0.2 * inv}`} dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r={0.14 * inv} fill="rgb(var(--c-accent2))" stroke="#fff" strokeWidth={0.05 * inv} />
                  <text x={0.25 * inv} y={0.12 * inv} fontSize={0.36 * inv} fill="rgb(var(--c-ink))" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                    You
                  </text>
                </g>
              )}
              {/* the clinic */}
              <g>
                <circle r={2.2 * inv} fill="url(#hm-glow)" />
                <circle r={0.3 * inv} fill="none" stroke="rgb(var(--c-accent))" strokeWidth={0.04 * inv}>
                  <animate attributeName="r" values={`${0.3 * inv};${1.4 * inv}`} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle r={0.22 * inv} fill="rgb(var(--c-accent))" stroke="#fff" strokeWidth={0.07 * inv} />
              </g>
            </g>
          </svg>
        </motion.div>
      </div>

      {/* clinic label (stays crisp, outside the tilt) */}
      <div className="pointer-events-none absolute left-1/2 top-[calc(50%-74px)] -translate-x-1/2">
        <div className="glass rounded-2xl px-3.5 py-2 text-center">
          <p className="font-display text-[17px] leading-none text-ink">NEA Precision Skin</p>
          <p className="mt-1 text-[11.5px] text-graphite">{site.address.line1}</p>
        </div>
      </div>

      {/* controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        {[
          { l: "Zoom in", i: <Plus className="h-4 w-4" />, f: () => setView((v) => clamp({ ...v, s: v.s * 1.3 })) },
          { l: "Zoom out", i: <Minus className="h-4 w-4" />, f: () => setView((v) => clamp({ ...v, s: v.s / 1.3 })) },
          { l: tilt ? "Flat view" : "3D view", i: <Compass className="h-4 w-4" />, f: () => setTilt((t) => !t), on: tilt },
          { l: "Reset", i: <RotateCcw className="h-4 w-4" />, f: () => (setView({ x: 0, y: 0, s: 1 }), setSel(null)) },
        ].map((b) => (
          <button key={b.l} onClick={b.f} aria-label={b.l} title={b.l} className={cn("grid h-10 w-10 place-items-center rounded-xl border border-white/80 shadow-sm backdrop-blur transition", b.on ? "bg-ink text-white" : "bg-white/80 text-ink hover:bg-white")}>
            {b.i}
          </button>
        ))}
      </div>

      {/* info card */}
      <div className="absolute inset-x-4 bottom-4 sm:left-4 sm:right-auto sm:w-[340px]">
        <div className="glass rounded-3xl p-4">
          <AnimatePresence mode="wait">
            <motion.div key={sel?.name ?? (me ? "me" : "clinic")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {dist !== null ? (
                <>
                  <p className="text-[12px] text-graphite">From {sel?.name ?? "your location"}</p>
                  <p className="mt-1 flex items-baseline gap-3 font-display text-[2rem] leading-none text-ink">
                    ~{driveMin(dist)} min <span className="font-sans text-[13px] text-graphite">{(dist * 1.3).toFixed(1)} km by car</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[12px] text-graphite">Tap any place, or find yourself</p>
                  <p className="mt-1 font-display text-[1.6rem] leading-none text-ink">Easy to reach in NE Calgary</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-graphite">
            <span className="flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" /> Off 32 Ave NE
            </span>
            <span className="flex items-center gap-1.5">
              <TrainFront className="h-3.5 w-3.5" /> CTrain Blue Line · Rundle
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={locate} className="btn-ghost !px-4 !py-2 !text-[13px]">
              <LocateFixed className={cn("h-4 w-4", locating === "busy" && "animate-spin")} /> {locating === "denied" ? "Location off" : "Locate me"}
            </button>
            <a href={dirUrl} target="_blank" rel="noreferrer" className="btn-light !px-4 !py-2 !text-[13px]">
              <Navigation className="h-4 w-4" /> Directions
            </a>
          </div>
        </div>
      </div>
      <p className="pointer-events-none absolute bottom-2 right-4 hidden text-[10.5px] text-graphite/70 sm:block">Schematic map · drive times are estimates</p>
    </div>
  );
}
