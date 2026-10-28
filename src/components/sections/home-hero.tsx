import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { ArrowRight, ScanFace } from "lucide-react";
import { AiPromptBar } from "@/components/ai/ai-prompt-bar";
import { SplitReveal } from "@/components/motion/split-reveal";
import { HeroScan } from "./hero-scan";
import { NumberTicker } from "@/components/ui/number-ticker";
import { treatments } from "@/content/treatments";
import { labTests } from "@/content/tests";
import { site } from "@/lib/site";
import { IMG } from "@/content/media";
import { TypingAnimation } from "@/components/motion/typing-animation";

export const HERO_IMAGE = IMG.hero;

/**
 * Home hero, v4: editorial serif headline, a real face in an arch with a live AI skin scan,
 * and the AI prompt as the main way in. The free scan is the main offer.
 */
export function HomeHero() {
  const stats = [
    { n: 15, suffix: " min", label: "advanced skin scan, free" },
    { n: treatments.length, suffix: "", label: "treatments in one plan" },
    { n: labTests.length, suffix: "", label: "lab tests with BioAro" },
  ];
  return (
    <section className="relative isolate overflow-hidden">
      <div className="container grid min-h-[100svh] items-center gap-12 pb-32 pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 lg:pb-24">
        <div className="relative z-10 order-2 lg:order-1">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-8 bg-ink/30" /> Physician-managed skin clinic · Calgary
          </p>
          <SplitReveal as="h1" text={"Healthy skin\nstarts *inside.*"} className="mt-6 font-display text-[clamp(3.4rem,7vw,7rem)] leading-[0.92] tracking-[-0.025em] text-ink" />
          <p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-[17px] text-graphite">
            <span>We measure your</span>
            <TypingAnimation className="font-medium text-ink" caretClassName="bg-flora" words={["gut microbiome.", "hormones.", "vitamins and nutrition.", "skin, layer by layer.", "biological age."]} />
          </p>
          <p className="mt-4 max-w-[32rem] text-[18px] leading-relaxed text-graphite">
            Your skin is the visible result of your gut, hormones, nutrition and environment. We measure all of them, treat the cause, and show you the change in numbers.
          </p>

          <AiPromptBar className="mt-9 max-w-[36rem]" suggestions={["Why do I keep breaking out?", "Melasma on brown skin", "Hair thinning plan under $1,500"]} />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/skin-scan" className="btn-light">
              <ScanFace className="h-4 w-4" /> Get my free Skin Health Report
            </Link>
            <Link href="/skin-lens" className="btn-ghost">
              <NeaSiIcon className="h-4 w-4" /> Scan my selfie with Nea SI
            </Link>
            <Link href="/body" className="btn text-graphite hover:text-ink">
              Explore the 3D body <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-12 grid max-w-[34rem] grid-cols-3 gap-6 border-t border-ink/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="tabular font-display text-[2.6rem] leading-none text-ink">
                  <NumberTicker value={s.n} suffix={s.suffix} />
                </dd>
                <dd className="mt-2 text-[12.5px] leading-snug text-graphite">{s.label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[12.5px] text-graphite/80">Open Monday to Saturday, 9 to 5 · {site.address.line1}, Calgary</p>
        </div>

        <HeroScan image={HERO_IMAGE} alt="Client with clear, healthy skin" className="order-1 lg:order-2" />
      </div>
    </section>
  );
}
