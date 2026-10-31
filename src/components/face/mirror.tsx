"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CalendarHeart, Download, Loader2, ScanFace, ShieldCheck, Sparkles, X } from "lucide-react";
import { ParticleFace, ZONE_LABEL } from "./particle-face";
import { PartLayers } from "@/components/ui/holo-portrait";
import { useBooking } from "@/components/booking/booking";
import { faceZones } from "@/content/body";
import { EDGES, ZONES } from "@/content/face-mesh";
import { cameraSupported, loadLandmarker, startCamera, track, type Pt } from "@/lib/face-tracker";
import { cn } from "@/lib/utils";


type Stage = "intro" | "loading" | "live" | "fallback";

/**
 * NEA's AR mirror: the face map drawn live on the visitor's own face.
 * Everything runs in their browser; the camera picture is never recorded, saved or sent.
 * Tap a zone on your face to open it. No camera? The particle face works the same way.
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
      setNote("This browser can’t use the camera, so here is the face map to explore instead.");
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
      setNote(denied ? "No problem. Without the camera you can still explore the face map here." : "The camera couldn’t start, so here is the face map to explore instead.");
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
      const beam = top + (((t * 0.28) % 1.4) - 0.2) * size;

      ctx.lineWidth = 0.7;
      ctx.strokeStyle = "rgba(243,217,164,0.22)";
      ctx.beginPath();
      for (const [a, b] of EDGES) {
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      for (const [x, y] of pts) {
        const near = Math.max(0, 1 - Math.abs(y - beam) / (size * 0.04));
        ctx.fillStyle = `rgba(255,${Math.round(225 - near * 20)},${Math.round(190 + near * 60)},${0.35 + near * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + near * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // zones: a soft dot each, a halo and label on the chosen one
      const active = zoneRef.current;
      const cents: Record<string, [number, number]> = {};
      for (const [z, ids] of Object.entries(ZONES)) {
        const cx = ids.reduce((s, i) => s + pts[i][0], 0) / ids.length;
        const cy = ids.reduce((s, i) => s + pts[i][1], 0) / ids.length;
        cents[z] = [cx, cy];
        const on = z === active;
        ctx.fillStyle = on ? "#fff" : "rgba(243,217,164,0.95)";
        ctx.beginPath();
        ctx.arc(cx, cy, on ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        if (on) {
          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.1 * (1 + Math.sin(t * 3) * 0.06), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
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
    g.fillText("NEA Precision Skin · face map", 16 * k, out.height - 18 * k);
    const a = document.createElement("a");
    a.download = "my-nea-face-map.png";
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

          {/* before the camera, and when there isn't one: the particle face */}
          {stage !== "live" && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-[min(78svh,760px)] w-[min(92vw,620px)]">
                <ParticleFace zone={zone} onZone={setZone} demo={!zone} />
              </div>
            </div>
          )}

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
            <p className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[12.5px] backdrop-blur-md">
              <ScanFace className="h-4 w-4 text-[#f3d9a4]" /> NEA face map
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
              <p className="font-display text-[1.6rem] leading-tight">See your face the way we do.</p>
              <p className="mt-1.5 text-[14.5px] text-white/75">Turn on your camera and your face map appears on you, live. Tap any part of your face to learn about it.</p>
              <button onClick={begin} disabled={stage === "loading"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f3d9a4] px-6 py-3.5 text-[15.5px] font-semibold text-ink transition hover:bg-[#f6e3c0] disabled:opacity-70">
                {stage === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                {stage === "loading" ? "Getting your face map ready…" : "Turn on my camera"}
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
