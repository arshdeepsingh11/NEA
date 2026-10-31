"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, CameraOff, Loader2, ShieldCheck } from "lucide-react";
import { IMG } from "@/content/media";
import { TWIN_PHOTO, TWIN_POINTS } from "@/content/face-mesh";
import { cameraSupported, loadLandmarker, startCamera, track, type Pt } from "@/lib/face-tracker";
import { cn } from "@/lib/utils";

export type TwinLook = { glow: number; clarity: number; tone: number; calm: number };

// fixed small offsets so breakouts and spots never sit exactly on a landmark
const JIT = [[0.6, -0.4], [-0.5, 0.7], [0.3, 0.5], [-0.7, -0.2], [0.4, -0.8], [-0.3, 0.3], [0.8, 0.2], [-0.6, -0.6], [0.2, 0.9], [-0.9, 0.1], [0.5, 0.6], [-0.2, -0.9]];

/** Paints the habits onto a face: glow on the high points, redness on the cheeks, breakouts and sun spots. */
function paint(ctx: CanvasRenderingContext2D, pts: [number, number][], m: TwinLook) {
  const ys = pts.map((p) => p[1]);
  const size = Math.max(...ys) - Math.min(...ys);
  const blob = (i: number, r: number, color: string, a: number, mode: GlobalCompositeOperation) => {
    const [x, y] = pts[i];
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("A", String(a)));
    g.addColorStop(1, color.replace("A", "0"));
    ctx.globalCompositeOperation = mode;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const red = ((100 - m.calm) / 100) * 0.38;
  TWIN_POINTS.redness.forEach((i, k) => blob(i, size * (k === 2 ? 0.08 : 0.19), "rgba(214,60,60,A)", red, "multiply"));
  const glow = Math.max(0, (m.glow - 25) / 75) * 0.5;
  TWIN_POINTS.glow.forEach((i) => blob(i, size * 0.1, "rgba(255,248,236,A)", glow, "screen"));
  ctx.globalCompositeOperation = "source-over";
  const n = Math.round(((100 - m.clarity) / 100) * TWIN_POINTS.breakouts.length * 1.15);
  TWIN_POINTS.breakouts.slice(0, n).forEach((i, k) => {
    const x = pts[i][0] + JIT[k % JIT.length][0] * size * 0.025;
    const y = pts[i][1] + JIT[k % JIT.length][1] * size * 0.025;
    const r = size * 0.012;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
    g.addColorStop(0, "rgba(190,52,52,0.95)");
    g.addColorStop(0.4, "rgba(214,96,90,0.55)");
    g.addColorStop(1, "rgba(214,96,90,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
  const spot = Math.max(0, Math.min(1, (100 - m.tone) / 70)) * 0.55;
  if (spot > 0.02)
    TWIN_POINTS.spots.forEach((i, k) => {
      const x = pts[i][0] + JIT[(k + 3) % JIT.length][0] * size * 0.03;
      const y = pts[i][1] + JIT[(k + 3) % JIT.length][1] * size * 0.03;
      ctx.fillStyle = `rgba(110,68,40,${spot})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.011, size * 0.008, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
}

const PHOTO = { w: 1000, h: 1500 };

/**
 * The Skin Twin's face. A real photo by default; "Try it on my face" swaps in the visitor's live camera,
 * and the same habit effects are painted onto their own face as they move the sliders.
 * The camera never leaves the device.
 */
export function TwinStage({ look, children, className }: { look: TwinLook; children?: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(look);
  lookRef.current = look;
  const face = useRef<Pt[] | null>(null);
  const stops = useRef<(() => void)[]>([]);
  const [mode, setMode] = useState<"photo" | "loading" | "camera">("photo");
  const [note, setNote] = useState<string | null>(null);
  const crop = useRef({ x: 0, y: 0, w: 1, h: 1 });

  // frame the photo so the face fills the box
  useEffect(() => {
    const fit = () => {
      const b = box.current;
      if (!b) return;
      const W = b.clientWidth;
      const H = b.clientHeight;
      const faceH = 0.182 * PHOTO.h; // face height in the photo, in px
      let s = (0.5 * H) / faceH;
      s = Math.max(s, W / PHOTO.w, H / PHOTO.h);
      const w = PHOTO.w * s;
      const h = PHOTO.h * s;
      const x = Math.min(0, Math.max(W - w, W / 2 - 0.49 * w));
      const y = Math.min(0, Math.max(H - h, H * 0.46 - 0.476 * h));
      crop.current = { x, y, w, h };
      if (img.current) Object.assign(img.current.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  // draw the effects every frame (photo or camera)
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const b = box.current;
      if (!b) return;
      const W = b.clientWidth;
      const H = b.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(W * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      let pts: [number, number][] | null = null;
      if (mode === "camera") {
        const v = video.current!;
        const f = face.current;
        if (f && v.videoWidth) {
          const s = Math.max(W / v.videoWidth, H / v.videoHeight);
          const dw = v.videoWidth * s;
          const dh = v.videoHeight * s;
          const ox = (W - dw) / 2;
          const oy = (H - dh) / 2;
          pts = f.slice(0, 468).map((p) => [W - (ox + p.x * dw), oy + p.y * dh]);
        }
      } else {
        const k = crop.current;
        pts = TWIN_PHOTO.map(([x, y]) => [k.x + x * k.w, k.y + y * k.h]);
      }
      if (pts) paint(ctx, pts, lookRef.current);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => () => stops.current.forEach((s) => s()), []);

  const camOn = async () => {
    if (!cameraSupported()) return setNote("This browser can’t use the camera.");
    setMode("loading");
    setNote(null);
    try {
      const [lm, stop] = await Promise.all([loadLandmarker(), startCamera(video.current!)]);
      stops.current.push(stop, track(video.current!, lm, (p) => (face.current = p)));
      setMode("camera");
    } catch (e) {
      stops.current.forEach((s) => s());
      stops.current = [];
      setMode("photo");
      setNote((e as Error)?.name === "NotAllowedError" ? "Camera not allowed, so we’re showing the example face." : "The camera couldn’t start, so we’re showing the example face.");
    }
  };
  const camOff = () => {
    stops.current.forEach((s) => s());
    stops.current = [];
    face.current = null;
    setMode("photo");
  };

  const filter = `saturate(${0.75 + look.glow / 320}) brightness(${0.92 + look.glow / 1000}) contrast(${0.97 + look.glow / 2500})`;

  return (
    <div className={cn("relative", className)}>
      <div ref={box} className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#e9dfd3] shadow-[0_50px_120px_-60px_rgba(var(--shadow-tint),0.65)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} src={`${IMG.hero}?auto=format&fit=crop&w=1200&q=80`} alt="Example face for the Skin Twin" className={cn("absolute max-w-none select-none transition-opacity duration-500", mode === "camera" ? "opacity-0" : "opacity-100")} style={{ filter }} draggable={false} />
        <video ref={video} playsInline muted className={cn("absolute inset-0 h-full w-full scale-x-[-1] object-cover transition-opacity duration-500", mode === "camera" ? "opacity-100" : "opacity-0")} style={{ filter }} />
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[24%] animate-[heroscan_5s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-b from-transparent via-white/25 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[11.5px] text-ink backdrop-blur sm:left-4 sm:top-4">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flora" /> {mode === "camera" ? "Skin Twin · your face" : "Skin Twin · live"}
        </div>
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          {mode === "camera" ? (
            <button onClick={camOff} className="inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur hover:bg-ink">
              <CameraOff className="h-3.5 w-3.5" /> Back to example
            </button>
          ) : (
            <button onClick={camOn} disabled={mode === "loading"} className="inline-flex items-center gap-1.5 rounded-full bg-[#f3d9a4] px-3.5 py-1.5 text-[12.5px] font-semibold text-ink shadow-lg transition hover:bg-[#f6e3c0] disabled:opacity-70">
              {mode === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />} {mode === "loading" ? "Starting…" : "Try it on my face"}
            </button>
          )}
        </div>
        {(note || mode === "loading") && (
          <p className="absolute inset-x-3 top-14 mx-auto w-fit rounded-full bg-black/55 px-3 py-1.5 text-center text-[12px] text-white backdrop-blur">
            {note ?? (
              <>
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Your camera stays on your device.
              </>
            )}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
