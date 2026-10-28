"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarHeart, Camera, Check, ImageUp, Loader2, RotateCcw, ScanFace, ShieldCheck } from "lucide-react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { NeaImage } from "@/components/ui/nea-image";
import { useBooking } from "@/components/booking/booking";
import { useAi } from "@/components/ai/ai-provider";
import { SIGNS, type LensResult, type LensSign } from "@/content/lens";
import { programs } from "@/content/programs";
import { treatments } from "@/content/treatments";
import { janeFor } from "@/content/jane";
import { cn, money } from "@/lib/utils";

type Stage = "intro" | "camera" | "analysing" | "result" | "error";
const STEPS = ["Checking light and angle", "Mapping face zones", "Reading visible signs", "Matching NEA treatments"];

/** Downscale to at most 768 px so the photo uploads fast; returns a JPEG data URL. */
function shrink(src: CanvasImageSource, w: number, h: number) {
  const k = Math.min(1, 768 / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

/**
 * Nea SI Skin Lens. Take or upload one selfie; Nea SI reads the visible signs (not a diagnosis),
 * shows where they are on your photo, explains them in plain words, and lines up the NEA treatments and booking.
 * The photo is analysed once and never stored by NEA.
 */
export function SkinLens() {
  const [stage, setStage] = useState<Stage>("intro");
  const [agree, setAgree] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<LensResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const stop = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => stop, []);

  const analyse = useCallback(async (img: string) => {
    setPhoto(img);
    setStage("analysing");
    setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 1300);
    try {
      const res = await fetch("/api/lens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: img }) });
      const d = (await res.json().catch(() => ({}))) as LensResult & { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Skin Lens is busy right now.");
      setResult(d);
      setStage("result");
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Please try again.");
      setStage("error");
    } finally {
      clearInterval(tick);
    }
  }, []);

  const openCamera = async () => {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      stream.current = s;
      setStage("camera");
      requestAnimationFrame(() => {
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
      });
    } catch {
      setError("We couldn't open your camera. Allow camera access, or upload a photo instead.");
    }
  };

  const capture = () => {
    const v = video.current;
    if (!v) return;
    const img = shrink(v, v.videoWidth, v.videoHeight);
    stop();
    analyse(img);
  };

  const upload = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => {
      analyse(shrink(im, im.naturalWidth, im.naturalHeight));
      URL.revokeObjectURL(url);
    };
    im.src = url;
  };

  const reset = () => {
    stop();
    setPhoto(null);
    setResult(null);
    setStage("intro");
  };

  return (
    <div className="surface overflow-hidden rounded-[32px]">
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-8 p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-ink">
              <NeaImage src="https://images.unsplash.com/photo-1713207524097-596f3c17afc3" alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover opacity-90" />
              <FaceGuide scanning />
            </div>
            <div className="flex flex-col justify-center">
              <p className="flex items-center gap-2 text-[13px] text-flora">
                <NeaSiIcon className="h-4 w-4" /> Nea SI Skin Lens
              </p>
              <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-ink">Show Nea SI your skin. See what it sees.</h2>
              <ol className="mt-5 space-y-2.5 text-[15px] text-ink">
                {["Take a selfie in daylight, no filter, hair back.", "Nea SI marks what is visible on your photo, in about 5 seconds.", "You get plain-language notes and the NEA treatments that fit, with prices and booking."].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-flora/10 text-[12px] text-flora">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <label className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-ink/10 bg-white/70 p-4 text-[13.5px] leading-snug text-ink">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--c-accent))]" />
                <span>
                  I agree that my photo is analysed once by Google Gemini to describe visible skin signs. <strong className="font-semibold">NEA does not store it.</strong> This is not a diagnosis.
                </span>
              </label>
              <div className="mt-5 flex flex-wrap gap-2">
                <button disabled={!agree} onClick={openCamera} className="btn-primary disabled:opacity-40">
                  <Camera className="h-4 w-4" /> Use my camera
                </button>
                <button disabled={!agree} onClick={() => file.current?.click()} className="btn-ghost disabled:opacity-40">
                  <ImageUp className="h-4 w-4" /> Upload a photo
                </button>
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
              </div>
              {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-graphite">
                <ShieldCheck className="h-3.5 w-3.5" /> Private: the photo goes to Google only to answer you, and is not saved on NEA’s side.
              </p>
            </div>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-8">
            <div className="relative mx-auto aspect-[3/4] max-h-[70vh] overflow-hidden rounded-[26px] bg-ink">
              <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
              <FaceGuide />
              <p className="absolute inset-x-0 top-4 text-center text-[13px] text-white/90 drop-shadow">Fit your face in the oval, in good light</p>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={capture} className="btn-primary">
                <ScanFace className="h-4 w-4" /> Scan my skin
              </button>
              <button onClick={reset} className="btn-ghost">
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {stage === "analysing" && photo && (
          <motion.div key="analysing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-8 p-6 md:grid-cols-[1fr_1fr] md:p-10">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[26px] bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Your photo" className="h-full w-full object-cover" />
              <FaceGuide scanning />
            </div>
            <div className="flex flex-col justify-center">
              <p className="flex items-center gap-2 text-[13px] text-flora">
                <NeaSiIcon className="h-4 w-4" thinking /> Nea SI is reading your skin…
              </p>
              <ul className="mt-5 space-y-3">
                {STEPS.map((s, i) => (
                  <li key={s} className={cn("flex items-center gap-3 text-[15px] transition", i <= step ? "text-ink" : "text-graphite/50")}>
                    {i < step ? <Check className="h-4 w-4 text-flora" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-flora" /> : <span className="h-4 w-4 rounded-full border border-ink/15" />}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {stage === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center">
            <p className="font-display text-2xl text-ink">That didn’t work this time.</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-graphite">{error}</p>
            <button onClick={reset} className="btn-primary mt-6">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </motion.div>
        )}

        {stage === "result" && photo && result && <Result key="result" photo={photo} result={result} onRetake={reset} />}
      </AnimatePresence>
    </div>
  );
}

function FaceGuide({ scanning }: { scanning?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <mask id="lens-oval">
            <rect width="300" height="400" fill="white" />
            <ellipse cx="150" cy="190" rx="100" ry="135" fill="black" />
          </mask>
        </defs>
        <rect width="300" height="400" fill="rgba(10,8,14,0.35)" mask="url(#lens-oval)" />
        <ellipse cx="150" cy="190" rx="100" ry="135" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
      {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((c) => (
        <span key={c} className={cn("absolute h-7 w-7 rounded-[6px] border-white/80", c)} />
      ))}
      {scanning && <motion.div className="absolute inset-x-[12%] h-[2px] rounded-full bg-white shadow-[0_0_24px_6px_rgb(var(--c-accent2)/0.7)]" animate={{ top: ["15%", "82%", "15%"] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />}
    </div>
  );
}

function Result({ photo, result, onRetake }: { photo: string; result: LensResult; onRetake: () => void }) {
  const [hot, setHot] = useState<number | null>(0);
  const book = useBooking();
  const ai = useAi();
  if (!result.quality.ok) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center">
        <p className="font-display text-2xl text-ink">Let’s try a clearer photo.</p>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-graphite">{result.quality.issue || "Face the camera in daylight, without a filter."}</p>
        <button onClick={onRetake} className="btn-primary mt-6">
          <RotateCcw className="h-4 w-4" /> Retake
        </button>
      </motion.div>
    );
  }
  const signs = result.signs;
  const top = signs[0];
  const program = top && SIGNS[top.key].program ? programs.find((p) => p.slug === SIGNS[top.key].program) : undefined;
  const txSlugs = [...new Set(signs.flatMap((s) => SIGNS[s.key].treatments))].slice(0, 4);
  const tx = txSlugs.map((slug) => {
    const t = treatments.find((x) => x.slug === slug)!;
    const priced = janeFor(slug).filter((j) => j.price).map((j) => j.price as number);
    return { slug, title: t.title, image: t.image, price: priced.length ? Math.min(...priced) : null };
  });
  const askText = `My Skin Lens showed: ${signs.map((s) => `${SIGNS[s.key].label} ${s.level}% (${s.where})`).join(", ")}. What would you suggest first, and what does it cost?`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-8 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-10">
      {/* photo with hotspots */}
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-[26px] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Your photo with the visible signs marked" className="h-full w-full object-cover" />
          {signs.map((s, i) => (
            <button key={i} onMouseEnter={() => setHot(i)} onClick={() => setHot(i)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }} aria-label={`${SIGNS[s.key].label} on ${s.where}`}>
              <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-white/40" />
              <span className={cn("relative grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[11px] font-semibold text-white shadow-lg", hot === i ? "bg-[rgb(var(--c-accent))]" : "bg-black/40 backdrop-blur")}>{i + 1}</span>
              {hot === i && <span className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[12px] text-ink shadow">{SIGNS[s.key].label}</span>}
            </button>
          ))}
        </div>
        <button onClick={onRetake} className="mt-3 flex items-center gap-1.5 text-[13px] text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Retake
        </button>
      </div>

      {/* reading */}
      <div>
        <p className="flex items-center gap-2 text-[13px] text-flora">
          <NeaSiIcon className="h-4 w-4" /> What Nea SI sees
        </p>
        <p className="mt-2 text-[17px] leading-relaxed text-ink">{result.summary}</p>
        {signs.length === 0 && <p className="mt-3 text-[15px] text-graphite">Nothing stands out in this photo. The free in-clinic scan can see what a phone camera can’t.</p>}
        <ul className="mt-5 space-y-2.5">
          {signs.map((s: LensSign, i) => (
            <li key={i}>
              <button onMouseEnter={() => setHot(i)} onClick={() => setHot(i)} className={cn("w-full rounded-2xl border p-3.5 text-left transition", hot === i ? "border-flora/40 bg-white" : "border-ink/[0.07] bg-white/60")}>
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
                    <span className="tabular grid h-5 w-5 place-items-center rounded-full bg-ink/[0.06] text-[11px]">{i + 1}</span>
                    {SIGNS[s.key].label} <span className="font-normal text-graphite">· {s.where}</span>
                  </span>
                  <span className="tabular text-[13px] text-ink">{s.level}%</span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                  <motion.span className="block h-full rounded-full" style={{ background: "linear-gradient(90deg, rgb(var(--viz-1)), rgb(var(--viz-2)))" }} initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} />
                </span>
                <span className="mt-2 block text-[13.5px] leading-snug text-graphite">{s.note}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11.5px] text-graphite">How visible each sign is in this photo, not a medical measurement.</p>

        {(program || tx.length > 0) && (
          <div className="mt-6 rounded-3xl border border-ink/[0.07] bg-white/70 p-4">
            <p className="text-[12px] uppercase tracking-[0.14em] text-graphite">What NEA would look at first</p>
            {program && (
              <Link href={`/programs/${program.slug}`} className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white p-3 hover:shadow-sm">
                <span>
                  <span className="block text-[15px] font-medium text-ink">{program.name}</span>
                  <span className="block text-[12.5px] text-graphite">
                    {program.problem} · from {money(program.priceFrom)} · {program.duration}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-graphite" />
              </Link>
            )}
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {tx.map((t) => (
                <Link key={t.slug} href={`/treatments/${t.slug}`} className="flex items-center gap-3 rounded-2xl bg-white p-2 hover:shadow-sm">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-mist">
                    <NeaImage src={t.image} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] text-ink">{t.title}</span>
                    <span className="block text-[12px] text-graphite">{t.price ? `from ${money(t.price)}` : "Price at consult"}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => book.open(top ? SIGNS[top.key].book : "skin-scan", top ? SIGNS[top.key].label : "Free skin scan")} className="btn-primary">
            <CalendarHeart className="h-4 w-4" /> Book in Jane
          </button>
          <button onClick={() => ai.open({ context: "Skin Lens result", query: askText })} className="btn-ghost">
            <NeaSiIcon className="h-4 w-4" /> Ask Nea SI what to do first
          </button>
          <Link href="/skin-scan" className="btn-ghost">
            <ScanFace className="h-4 w-4" /> Free in-clinic scan
          </Link>
        </div>
        <p className="mt-4 text-[12px] leading-snug text-graphite">A phone photo only shows the surface. NEA’s free Skin Health Report measures hidden pigment, UV damage, pores, texture and hydration with a clinical analyzer.</p>
      </div>
    </motion.div>
  );
}
