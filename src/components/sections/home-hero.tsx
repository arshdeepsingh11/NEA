import Link from "next/link";
import { ArrowRight, ScanFace } from "lucide-react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { AiPromptBar } from "@/components/ai/ai-prompt-bar";
import { SplitReveal } from "@/components/motion/split-reveal";
import { TypingAnimation } from "@/components/motion/typing-animation";
import { NumberTicker } from "@/components/ui/number-ticker";
import { LoopVideo } from "@/components/ui/loop-video";
import { treatments } from "@/content/treatments";
import { labTests } from "@/content/tests";

export const HERO_VIDEO = "/media/nea-hero.mp4";
export const HERO_POSTER = "/media/nea-hero.jpg";

/**
 * Home hero, v5: one clear, full-screen film of real skin with the words written on it.
 * Phones: the film fills the screen. Larger screens: the film stands in the centre as a tall window,
 * over a soft, blurred wash of itself, with the headline running across it.
 */
export function HomeHero() {
  const stats = [
    { n: 15, suffix: " min", label: "advanced skin scan, free" },
    { n: treatments.length, suffix: "", label: "treatments in one plan" },
    { n: labTests.length, suffix: "", label: "BioAro lab tests" },
  ];
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#2a211d] text-white">
      {/* wide screens: a blurred wash of the film fills the sides */}
      <div aria-hidden className="absolute inset-0 -z-20 hidden scale-125 bg-cover bg-center opacity-80 blur-3xl md:block" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
      {/* the film: full-bleed on phones, a tall centred window on larger screens */}
      <div className="absolute inset-0 -z-10 md:inset-x-auto md:left-1/2 md:top-[max(5.5rem,8vh)] md:bottom-6 md:aspect-[9/16] md:-translate-x-1/2 md:overflow-hidden md:rounded-[40px] md:shadow-[0_60px_140px_-40px_rgba(0,0,0,0.6)] md:ring-1 md:ring-white/25">
        <LoopVideo src={HERO_VIDEO} poster={HERO_POSTER} className="h-full w-full" />
        {/* light sweep across the window */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden h-px animate-[scan_7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_24px_4px_rgba(255,255,255,0.35)] md:block" />
      </div>
      {/* readability: clear at the top, deep at the bottom where the words sit */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/0 via-black/15 to-black/80" />

      {/* floating readouts either side of the film (large screens) */}
      <dl className="pointer-events-none absolute inset-y-0 left-[max(2rem,calc(50%-34rem))] hidden flex-col justify-center gap-4 xl:flex">
        {stats.slice(0, 2).map((s) => (
          <Readout key={s.label} {...s} />
        ))}
      </dl>
      <dl className="pointer-events-none absolute inset-y-0 right-[max(2rem,calc(50%-34rem))] hidden flex-col justify-center gap-4 xl:flex">
        <Readout {...stats[2]} />
        <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-left backdrop-blur-xl">
          <dt className="text-[12px] text-white/70">Open</dt>
          <dd className="mt-1 font-display text-[1.35rem] leading-tight text-white">Mon–Sat · 9–5</dd>
        </div>
      </dl>

      <div className="container relative pb-[calc(var(--dock-h)+1.5rem)] pt-32 text-center">
        <p className="mx-auto hidden items-center gap-2 rounded-full border border-white/25 sm:inline-flex bg-white/10 px-3.5 py-1.5 text-[12.5px] text-white/90 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f3d9a4]" /> Physician-managed skin clinic · Calgary
        </p>
        <SplitReveal
          as="h1"
          text={"Healthy skin\nstarts *inside.*"}
          emClassName="italic text-[#f3d9a4]"
          className="mx-auto mt-5 max-w-5xl font-display text-[clamp(3.3rem,9vw,8.4rem)] leading-[0.9] tracking-[-0.03em] text-white [text-shadow:0_4px_40px_rgba(0,0,0,0.35)]"
        />
        <p className="mt-5 flex flex-wrap items-baseline justify-center gap-x-2 text-[17px] text-white/85 md:text-[19px]">
          <span>We measure your</span>
          <TypingAnimation className="font-medium text-white" caretClassName="bg-[#f3d9a4]" words={["gut microbiome.", "hormones.", "vitamins and nutrition.", "skin, layer by layer.", "biological age."]} />
        </p>

        <AiPromptBar className="mx-auto mt-7 max-w-[36rem] text-left [&_.chip]:border-white/25 [&_.chip]:bg-white/15 [&_.chip]:text-white [&_.chip]:backdrop-blur-md [&>div]:hidden sm:[&>div]:flex [&>div]:justify-center" suggestions={["Why do I keep breaking out?", "Melasma on brown skin", "Hair thinning plan under $1,500"]} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/skin-scan" className="btn bg-white text-ink hover:bg-white/90">
            <ScanFace className="h-4 w-4" /> Get my free Skin Health Report
          </Link>
          <Link href="/skin-lens" className="btn border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
            <NeaSiIcon className="h-4 w-4" /> Scan my selfie with Nea SI
          </Link>
          <Link href="/body" className="btn hidden text-white/80 hover:text-white sm:inline-flex">
            Explore the 3D body <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

function Readout({ n, suffix, label }: { n: number; suffix: string; label: string }) {
  return (
    <div className="w-44 rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-left backdrop-blur-xl">
      <dt className="sr-only">{label}</dt>
      <dd className="tabular font-display text-[2.2rem] leading-none text-white">
        <NumberTicker value={n} suffix={suffix} />
      </dd>
      <dd className="mt-1.5 text-[12px] leading-snug text-white/70">{label}</dd>
    </div>
  );
}
