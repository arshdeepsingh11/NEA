"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CalendarHeart, Download, Loader2, ScanFace, ShieldCheck, Sparkles, X } from "lucide-react";
import { PartLayers } from "@/components/ui/holo-portrait";
import { useBooking } from "@/components/booking/booking";
import { faceZones } from "@/content/body";
import { ZONES, ZONE_LABEL } from "@/content/face-mesh";
import { IMG } from "@/content/media";
import { cameraSupported, loadLandmarker, startCamera, track, type Pt } from "@/lib/face-tracker";
import { cn } from "@/lib/utils";


type Stage = "intro" | "loading" | "live" | "fallback";

/**
 * NEA's AR mirror: the face map drawn live on the visitor's own face.
 * Everything runs in their browser; the camera picture is never recorded, saved or sent.
 * Tap a zone on your face to open it. No camera? A real face with the same zones works the same way.
 */
export function MirrorHost() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [zone, setZone] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [found, setFound] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stops = useRef<(() => void)[]>([]);
  const face = useRef<Pt[] | null>(null);
  const zoneRef = useRef<string | null>(null);
  zoneRef.current = zone;
  const book = useBooking();

  useEffect(() => {
    const on = (e: Event) => {
      setZone((e as CustomEvent).detail?.zone ?? null);
      setStage("intro");
      setNote(null);
      setOpen(true);
    };
    window.addEventListener("nea:mirror", on);
    return () => window.removeEventListener("nea:mirror", on);
  }, []);

  const stopAll = useCallback(() => {
    stops.current.forEach((s) => s());
    stops.current = [];
    face.current = null;
  }, []);
  const close = useCallback(() => {
    stopAll();
    setOpen(false);
  }, [stopAll]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const begin = async () => {
    if (!cameraSupported()) {
      setNote("This browser can’t use the camera. Tap any part of her face instead.");
      return setStage("fallback");
    }
    setStage("loading");
    try {
      const [lm, stop] = await Promise.all([loadLandmarker(), startCamera(video.current!)]);
      stops.current.push(stop);
      stops.current.push(track(video.current!, lm, (p) => (face.current = p)));
      stops.current.push(draw());
      setStage("live");
    } catch (e) {
      stopAll();
      const denied = (e as Error)?.name === "NotAllowedError";
      setNote(denied ? "No problem. Tap any part of her face instead." : "The camera couldn’t start. Tap any part of her face instead.");
      setStage("fallback");
    }
  };

  /** Maps landmarks onto the mirrored, cover-fitted video. */
  const layout = () => {
    const v = video.current!;
    const c = canvas.current!;
    const W = c.clientWidth;
    const H = c.clientHeight;
    const s = Math.max(W / (v.videoWidth || 1), H / (v.videoHeight || 1));
    const dw = (v.videoWidth || 1) * s;
    const dh = (v.videoHeight || 1) * s;
    const ox = (W - dw) / 2;
    const oy = (H - dh) / 2;
    return { W, H, map: (p: Pt) => [W - (ox + p.x * dw), oy + p.y * dh] as [number, number] };
  };

  const draw = () => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let lost = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(c.clientWidth * dpr)) {
        c.width = Math.round(c.clientWidth * dpr);
        c.height = Math.round(c.clientHeight * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { W, H, map } = layout();
      ctx.clearRect(0, 0, W, H);
      const f = face.current;
      if (!f) {
        if (++lost === 20) setFound(false);
        return;
      }
      if (lost >= 20) setFound(true);
      lost = 0;
      const pts = f.slice(0, 468).map(map);
      const ys = pts.map((p) => p[1]);
      const top = Math.min(...ys);
      const bot = Math.max(...ys);
      const size = bot - top;
      const t = (now - t0) / 1000;

      // zones: a soft dot each, a halo and label on the chosen one
      const active = zoneRef.current;
      const cents: Record<string, [number, number]> = {};
      for (const [z, ids] of Object.entries(ZONES)) {
        const cx = ids.reduce((s, i) => s + pts[i][0], 0) / ids.length;
        const cy = ids.reduce((s, i) => s + pts[i][1], 0) / ids.length;
        cents[z] = [cx, cy];
        const on = z === active;
        // a soft glow on the chosen zone, like light on skin
        if (on) {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.16);
          g.addColorStop(0, "rgba(255,240,220,0.45)");
          g.addColorStop(1, "rgba(255,240,220,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
        const pulse = 1 + Math.sin(t * 2.4 + cx) * 0.25;
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(cx, cy, (on ? 9 : 7) * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cx, cy, on ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        const label = ZONE_LABEL[z];
        ctx.font = `${on ? 600 : 500} ${on ? 13 : 11}px Inter, system-ui, sans-serif`;
        const tw = ctx.measureText(label).width;
        const right = cx > W / 2;
        const bx = right ? cx + 12 : cx - tw - 30;
        ctx.fillStyle = on ? "rgba(255,255,255,0.92)" : "rgba(20,14,16,0.5)";
        ctx.beginPath();
        ctx.roundRect(bx, cy - 11, tw + 18, 22, 11);
        ctx.fill();
        ctx.fillStyle = on ? "#1f1a17" : "#fff";
        ctx.fillText(label, bx + 9, cy + 4);
      }
      c.dataset.zones = JSON.stringify(cents);
      c.dataset.r = String(Math.round(size * 0.14));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  };

  const tapLive = (e: React.MouseEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const zs = JSON.parse(c.dataset.zones || "{}") as Record<string, [number, number]>;
    let best: string | null = null;
    let bd = Number(c.dataset.r || 60) ** 2;
    for (const [z, [zx, zy]] of Object.entries(zs)) {
      const d = (zx - x) ** 2 + (zy - y) ** 2;
      if (d < bd) (bd = d), (best = z);
    }
    if (best) setZone(best);
  };

  const freeze = () => {
    const v = video.current!;
    const c = canvas.current!;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const g = out.getContext("2d")!;
    const { W, H } = layout();
    const k = out.width / W;
    const s = Math.max(W / v.videoWidth, H / v.videoHeight);
    g.save();
    g.scale(-k, k);
    g.drawImage(v, -(W + (v.videoWidth * s - W) / 2), (H - v.videoHeight * s) / 2, v.videoWidth * s, v.videoHeight * s);
    g.restore();
    g.drawImage(c, 0, 0);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.font = `${14 * k}px Inter, system-ui, sans-serif`;
    g.fillText("NEA Precision Skin · skin mirror", 16 * k, out.height - 18 * k);
    const a = document.createElement("a");
    a.download = "my-nea-skin-map.png";
    a.href = out.toDataURL("image/png");
    a.click();
  };

  const z = faceZones.find((x) => x.id === zone);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] bg-[#120d0e] text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent role="dialog" aria-modal="true" aria-label="NEA face map mirror">
          {/* the live camera (always mounted so it can start instantly) */}
          <video ref={video} className={cn("absolute inset-0 h-full w-full scale-x-[-1] object-cover transition-opacity duration-700", stage === "live" ? "opacity-100" : "opacity-0")} playsInline muted />
          <div aria-hidden className={cn("pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-opacity", stage === "live" ? "opacity-100" : "opacity-0")} />
          <canvas ref={canvas} onClick={tapLive} className={cn("absolute inset-0 h-full w-full", stage === "live" ? "block" : "hidden")} />

          {/* before the camera, and when there isn't one: a real face with the same zones */}
          {stage !== "live" && <PhotoMap zone={zone} onZone={setZone} dim={stage !== "fallback" && !zone} />}
          {/* a soft ring light around the mirror */}
          <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(255,236,214,0.35)]" />

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
            <p className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[12.5px] backdrop-blur-md">
              <ScanFace className="h-4 w-4 text-[#f3d9a4]" /> NEA skin mirror
            </p>
            <div className="flex gap-2">
              {stage === "live" && (
                <button onClick={freeze} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[13px] backdrop-blur-md hover:bg-white/25">
                  <Download className="h-4 w-4" /> Save my map
                </button>
              )}
              <button onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* intro card */}
          {(stage === "intro" || stage === "loading") && !zone && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-4 bottom-6 mx-auto max-w-md rounded-3xl border border-white/15 bg-black/45 p-5 text-center backdrop-blur-xl sm:bottom-10">
              <p className="font-display text-[1.6rem] leading-tight">See your skin, zone by zone.</p>
              <p className="mt-1.5 text-[14.5px] text-white/75">Turn on your camera, then tap any part of your face to see what it needs.</p>
              <button onClick={begin} disabled={stage === "loading"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f3d9a4] px-6 py-3.5 text-[15.5px] font-semibold text-ink transition hover:bg-[#f6e3c0] disabled:opacity-70">
                {stage === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                {stage === "loading" ? "Getting ready…" : "Turn on my camera"}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-white/60">
                <ShieldCheck className="h-3.5 w-3.5" /> Your camera stays on your device. Nothing is recorded, saved or sent.
              </p>
              <button onClick={() => setStage("fallback")} className="mt-2 text-[13px] text-white/60 underline-offset-4 hover:text-white hover:underline">
                Explore without the camera
              </button>
            </motion.div>
          )}

          {stage === "live" && !found && <p className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-[14px] backdrop-blur">Look at the camera</p>}
          {(stage === "live" || stage === "fallback") && !zone && (
            <p className="absolute inset-x-0 bottom-8 mx-auto w-fit rounded-full bg-black/45 px-4 py-2 text-center text-[13.5px] backdrop-blur-md">
              <Sparkles className="mr-1.5 inline h-4 w-4 text-[#f3d9a4]" />
              {note ?? "Tap any part of your face"}
            </p>
          )}

          {/* the opened zone */}
          <AnimatePresence>
            {z && (
              <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="absolute inset-x-3 bottom-3 mx-auto max-h-[58svh] max-w-md overflow-y-auto rounded-3xl text-ink sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0" data-lenis-prevent>
                <PartLayers
                  title={z.name}
                  kicker={z.headline}
                  color={z.color}
                  onClose={() => setZone(null)}
                  layers={[
                    { label: "What it’s made of", items: z.madeOf.slice(0, 2) },
                    { label: "What throws it off", items: z.disruptors.slice(0, 3) },
                    { label: "How NEA treats it", items: [z.improve] },
                  ]}
                  footer={
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => (close(), book.open(z.treatments[0], z.name))} className="btn-light !px-4 !py-2.5 !text-[14px]">
                        <CalendarHeart className="h-4 w-4" /> Book
                      </button>
                      <Link href="/skin-lens" onClick={close} className="btn-ghost !px-4 !py-2.5 !text-[14px]">
                        <ScanFace className="h-4 w-4" /> Analyse with Skin Lens
                      </Link>
                    </div>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// a different face from the Skin Twin's, so no photo repeats; zone spots are fractions of the photo
const PHOTO = { w: 1000, h: 1258, face: 0.324, cx: 0.5, cy: 0.53 };
const PHOTO_ZONES: Record<string, [number, number]> = {
  forehead: [0.505, 0.42],
  undereye: [0.421, 0.525],
  tzone: [0.505, 0.548],
  cheeks: [0.614, 0.565],
  mouth: [0.505, 0.632],
  jaw: [0.495, 0.69],
};

/** A real, smiling face filling the mirror, with a soft dot on each zone to tap. */
function PhotoMap({ zone, onZone, dim }: { zone: string | null; onZone: (z: string) => void; dim?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState({ x: 0, y: 0, w: 0, h: 0 });
  useEffect(() => {
    const fit = () => {
      const b = box.current;
      if (!b) return;
      const W = b.clientWidth;
      const H = b.clientHeight;
      const s = Math.max((0.5 * H) / (PHOTO.face * PHOTO.h), W / PHOTO.w, H / PHOTO.h);
      const w = PHOTO.w * s;
      const h = PHOTO.h * s;
      setK({ x: Math.min(0, Math.max(W - w, W / 2 - PHOTO.cx * w)), y: Math.min(0, Math.max(H - h, H * 0.42 - PHOTO.cy * h)), w, h });
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {k.w > 0 && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG.twin}?auto=format&fit=crop&w=1400&q=80`} alt="Example face" className="absolute max-w-none select-none" style={{ left: k.x, top: k.y, width: k.w, height: k.h }} draggable={false} />
          <div aria-hidden className={cn("absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55 transition-opacity duration-500", dim ? "opacity-100" : "opacity-60")} />
          {Object.entries(PHOTO_ZONES).map(([z, [fx, fy]]) => {
            const on = z === zone;
            const left = k.x + fx * k.w;
            const right = left > (box.current?.clientWidth ?? 0) / 2;
            return (
              <button key={z} onClick={() => onZone(z)} aria-label={`Open ${ZONE_LABEL[z]}`} aria-pressed={on} className="group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left, top: k.y + fy * k.h }}>
                {on && <span className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,240,220,0.45),transparent_70%)]" />}
                <span className="absolute h-5 w-5 animate-ping rounded-full bg-white/50" style={{ animationDuration: "2.6s" }} />
                <span className={cn("relative rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition", on ? "h-3.5 w-3.5" : "h-2.5 w-2.5 group-hover:scale-125")} />
                <span className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium backdrop-blur-md transition", right ? "left-9" : "right-9", on ? "bg-white text-ink" : "bg-black/40 text-white")}>{ZONE_LABEL[z]}</span>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
