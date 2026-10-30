"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, Layers, LineChart, QrCode, ScanFace, Sparkles, Timer, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FACE = "/media/nea-scan-face.jpg";
const EASE = [0.22, 1, 0.36, 1] as const;

/** What each light shows. The looks on screen are illustrations; your real images come from the imager. */
const LIGHTS: { name: string; short: string; shows: string; filter: string; tint?: string; blend?: string }[] = [
  { name: "Daylight", short: "Daylight", shows: "Your skin as everyone sees it: the starting point for every other view.", filter: "none" },
  { name: "Cross-polarized light", short: "Under the surface", shows: "Cuts out surface shine, so redness and brown spots sitting under the surface stand out.", filter: "contrast(1.15) saturate(1.6)" },
  { name: "Parallel-polarized light", short: "Texture", shows: "Lights up the surface itself: fine lines, wrinkles, pores and rough patches.", filter: "grayscale(1) contrast(1.7) brightness(1.08)" },
  { name: "UV light", short: "Sun damage", shows: "Shows sun damage that hasn’t reached the surface yet, and oil and bacteria in pores.", filter: "grayscale(1) contrast(1.5) brightness(0.9)", tint: "#2c3fa8", blend: "multiply" },
  { name: "Wood’s light", short: "Pigment depth", shows: "Helps tell how deep pigment sits, which changes how it’s treated.", filter: "grayscale(1) contrast(1.3)", tint: "#6b3fb8", blend: "color" },
  { name: "Redness map", short: "Redness", shows: "A heat map of redness and sensitivity: where skin is reactive or inflamed.", filter: "grayscale(0.4) contrast(1.2)", tint: "#d0283c", blend: "color" },
  { name: "Brown spot map", short: "Pigment", shows: "A map of every uneven-tone area, including spots you can’t see yet.", filter: "sepia(1) contrast(1.6) saturate(1.3)" },
  { name: "3D texture map", short: "3D depth", shows: "A three-dimensional view that shows how deep lines and scars go.", filter: "grayscale(1) contrast(2.2) brightness(1.15) invert(0.08)" },
];

const MEASURES: { group: string; items: string[] }[] = [
  { group: "On the surface", items: ["Pores", "Wrinkles & fine lines", "Breakouts", "Texture & roughness", "Oil & shine"] },
  { group: "Under the surface", items: ["Sun (UV) damage", "Deep pigment & dark spots", "Hydration", "Firmness & collagen", "Dark circles"] },
  { group: "Sensitivity", items: ["Redness", "Sensitive areas", "Hidden inflammation", "Skin age"] },
];

/**
 * The free scan, explained: the AI skin imager NEA uses, what each of its lights shows, what it measures,
 * and what to expect on the day. Written for clients, not engineers.
 */
export function ScanImager() {
  return (
    <>
      <Machine />
      <Steps />
      <Measures />
      <Expect />
    </>
  );
}

/* The machine and its 8 lights */
function Machine() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % LIGHTS.length), 3200);
    return () => clearInterval(id);
  }, [auto]);
  const L = LIGHTS[i];
  const pick = (n: number) => (setAuto(false), setI(n));

  return (
    <section className="chapter overflow-hidden bg-ink text-white">
      <div className="container grid items-center gap-x-16 gap-y-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="lg:self-end">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[12.5px] text-white/75">
            <ScanFace className="h-3.5 w-3.5 text-[#f3d9a4]" /> What we use: the Bitmoji-tek AI skin imager
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[1]">
            Your mirror shows half the story. <span className="italic text-[#f3d9a4]">This shows the rest.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/75">
            In about 15 seconds, the imager photographs your face in 8 different kinds of light with a 36-megapixel camera. Each light shows something your eyes can’t. Then AI reads every image and grades your skin.
          </p>
        </div>

        {/* the face under each light (sits between the words and the buttons on phones, so you see each change) */}
        <FaceView i={i} />

        <div className="lg:self-start">
          {/* light picker */}
          <div role="tablist" aria-label="The 8 lights" className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-4">
            {LIGHTS.map((l, n) => (
              <button
                key={l.name}
                role="tab"
                aria-selected={n === i}
                onClick={() => pick(n)}
                className={cn("relative overflow-hidden rounded-2xl border px-2 py-2.5 text-center text-[12px] leading-tight transition sm:text-[12.5px]", n === i ? "border-[#f3d9a4] bg-[#f3d9a4] text-ink" : "border-white/15 text-white/75 hover:border-white/40")}
              >
                <span className="tabular block text-[10.5px] opacity-60">0{n + 1}</span>
                {l.short}
                {n === i && auto && <motion.span key={`p${i}`} aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink/40" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 3.2, ease: "linear" }} />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="mt-5 min-h-[4.5rem]">
              <p className="font-display text-[1.4rem] text-white">{L.name}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/70">{L.shows}</p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

function FaceView({ i }: { i: number }) {
  const L = LIGHTS[i];
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-[440px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] bg-black ring-1 ring-white/15">
            <AnimatePresence initial={false}>
              <motion.div key={i} className="absolute inset-0" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
                <Image src={FACE} alt={`Example face under ${L.name.toLowerCase()}`} fill sizes="440px" className="object-cover" style={{ filter: L.filter }} unoptimized />
                {L.tint && <span className="absolute inset-0" style={{ background: L.tint, mixBlendMode: (L.blend ?? "multiply") as React.CSSProperties["mixBlendMode"], opacity: 0.55 }} />}
                {i === 7 && <span className="absolute inset-0 bg-[linear-gradient(rgba(243,217,164,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(243,217,164,0.18)_1px,transparent_1px)] bg-[size:28px_28px]" />}
              </motion.div>
            </AnimatePresence>
            {/* scan line */}
            <motion.span key={`s${i}`} aria-hidden className="absolute inset-x-0 h-0.5 bg-[#f3d9a4] shadow-[0_0_24px_6px_rgba(243,217,164,0.55)]" initial={{ top: "0%", opacity: 1 }} animate={{ top: "100%", opacity: 0 }} transition={{ duration: 0.9, ease: EASE }} />
            {/* corner frame */}
            {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
              <span key={c} aria-hidden className={cn("absolute h-7 w-7 rounded-[4px] border-white/70", c)} />
            ))}
            <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[11.5px] text-white backdrop-blur-md">
              Light {i + 1} of 8 · {L.short}
            </span>
          </div>
          <p className="mt-3 text-center text-[12px] text-white/45">Illustration of what each light reveals. Your real images come from the imager.</p>
        </div>
  );
}

/* Scan → Analyze → Preview → Track */
function Steps() {
  const steps = [
    { icon: Camera, t: "Scan", time: "15 seconds", d: "8 lights, one 36MP camera. Nothing touches your skin, nothing heats it." },
    { icon: Layers, t: "Analyze", time: "Instantly", d: "AI grades 14+ things about your skin and builds your Skin Report Card." },
    { icon: Wand2, t: "Preview", time: "On screen", d: "A simulation shows how your skin may age if left alone, and how it could look with the right care." },
    { icon: LineChart, t: "Track", time: "At 90 days", d: "Your free re-scan sits side by side with the first, so you see the change." },
  ];
  return (
    <section className="chapter">
      <div className="container">
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1] text-ink">Four steps. No guessing.</h2>
        <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-ink/15 to-transparent lg:block" />
          {steps.map((s, n) => (
            <motion.li key={s.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: n * 0.1, ease: EASE }} className="relative rounded-[28px] border border-ink/[0.07] bg-white p-6">
              <span className="relative grid h-12 w-12 place-items-center rounded-full [background:var(--aurora)]">
                <s.icon className="h-5 w-5 text-ink" />
              </span>
              <p className="mt-5 flex items-baseline justify-between gap-2">
                <span className="font-display text-[1.7rem] leading-none text-ink">
                  <span className="tabular mr-1.5 text-[1rem] text-ink/35">0{n + 1}</span>
                  {s.t}
                </span>
                <span className="text-[12.5px] text-graphite">{s.time}</span>
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-graphite">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* What it measures */
function Measures() {
  return (
    <section className="chapter bg-mist/60">
      <div className="container">
        <div className="max-w-3xl">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1] text-ink">Your Skin Report Card.</h2>
          <p className="mt-4 text-[17px] text-graphite">Every one of these gets a score, so you know exactly where your skin is strong and where it needs help.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {MEASURES.map((g, n) => (
            <motion.div key={g.group} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: n * 0.1, ease: EASE }} className="rounded-[28px] bg-white p-6">
              <p className="text-[12px] uppercase tracking-[0.16em] text-graphite">{g.group}</p>
              <ul className="mt-4 space-y-3">
                {g.items.map((x, k) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="flex-1 text-[16px] text-ink">{x}</span>
                    <span aria-hidden className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/[0.07]">
                      <motion.span className="block h-full rounded-full [background:var(--aurora-deep)]" initial={{ width: 0 }} whileInView={{ width: `${[72, 55, 84, 63, 46][k % 5]}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 + k * 0.08, ease: EASE }} />
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-graphite">Bars are an example. Your own scores come from your scan.</p>
      </div>
    </section>
  );
}

/* What to expect on the day */
function Expect() {
  const parts = [
    { icon: Sparkles, t: "Before you come", items: ["Come with a clean face if you can (no makeup or sunscreen). If not, we’ll give you a gentle cleanser.", "Tell us your main concern when you book, so we prepare."] },
    { icon: Timer, t: "During the scan", items: ["You rest your chin, close your eyes, and stay still for about 15 seconds.", "Flashes of light only. Nothing touches you, nothing hurts, nothing heats your skin."] },
    { icon: QrCode, t: "After the scan", items: ["Your aesthetician walks you through every image on a big screen.", "Scan a QR code and your full report is on your phone.", "You leave with 2 or 3 priorities, and a free re-scan in 90 days if you start care."] },
  ];
  return (
    <section className="chapter">
      <div className="container">
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1] text-ink">What to expect.</h2>
        <p className="mt-4 max-w-xl text-[17px] text-graphite">About 20 minutes from hello to your report. No hard sell. If your skin is healthy, we’ll tell you.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {parts.map((p) => (
            <div key={p.t} className="rounded-[28px] border border-ink/[0.07] bg-white p-6">
              <p className="flex items-center gap-2.5 font-display text-[1.5rem] text-ink">
                <p.icon className="h-5 w-5 text-flora" /> {p.t}
              </p>
              <ul className="mt-4 space-y-3">
                {p.items.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[15px] leading-relaxed text-graphite">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-flora" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[12.5px] leading-relaxed text-graphite">
          The skin scan is a cosmetic skin analysis, not a medical diagnosis. Future-skin previews are simulations to help you picture options, not a promise of results. Anything that needs medical attention, such as a changing mole, is referred to a physician.
        </p>
      </div>
    </section>
  );
}
