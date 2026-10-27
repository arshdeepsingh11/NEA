import Link from "next/link";
import { ArrowRight, ScanFace } from "lucide-react";
import { MorphingText } from "@/components/ui/morphing-text";
import { AiPromptBar } from "@/components/ai/ai-prompt-bar";
import { HeroBody } from "./hero-body";
import { NumberTicker } from "@/components/ui/number-ticker";
import { bodyRegions } from "@/content/body";
import { treatments } from "@/content/treatments";
import { labTests } from "@/content/tests";
import { site } from "@/lib/site";

/**
 * Home hero: "Body Intelligence".
 * The 3D body is the point: skin is the output of ten systems, and NEA measures each one.
 * The AI bar is the main way in; the free scan is the main offer.
 */
export function HomeHero() {
  const tests = Object.fromEntries(labTests.map((t) => [t.slug, t.name]));
  const scan = bodyRegions.map((r) => ({ id: r.id, name: r.name, system: r.system, headline: r.headline, color: r.color, tests: r.tests.map((s) => tests[s]).filter(Boolean) as string[], tracks: r.tracks }));
  const stats = [
    { n: bodyRegions.length, label: "body systems mapped" },
    { n: treatments.length, label: "treatments, one plan" },
    { n: labTests.length, label: "lab tests with BioAro" },
  ];
  return (
    <section className="relative isolate overflow-hidden">
      <div className="container grid min-h-[100svh] items-center gap-6 pb-28 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-24">
        <div className="relative z-10 order-2 lg:order-1">
          <p className="chip">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flora" /> NEA Precision Skin · Calgary
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,5.4vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white">
            Healthy skin
            <br />
            starts <span className="aurora-text">inside.</span>
          </h1>
          <div className="mt-5 h-[1.2em] font-display text-[clamp(1.4rem,2.6vw,2rem)] font-medium tracking-tight text-ink/80">
            <MorphingText className="text-left" texts={["Clear skin.", "Even tone.", "Fuller hair.", "Ageless glow.", "Proven in data."]} />
          </div>
          <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-graphite">
            Your skin is the visible result of your gut, hormones, nutrition and environment. We measure all of them, treat the cause, and show you the change in numbers.
          </p>

          <AiPromptBar className="mt-8 max-w-[36rem]" suggestions={["Why do I keep breaking out?", "Melasma on brown skin", "Plan for hair thinning under $1,500"]} />

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/skin-scan" className="btn-primary">
              <ScanFace className="h-4 w-4" /> Free Skin Health Report
            </Link>
            <Link href="/body" className="btn-ghost">
              Explore the 3D body <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-8 grid max-w-[34rem] grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="tabular font-display text-3xl font-semibold text-white">
                  <NumberTicker value={s.n} />
                </dd>
                <dd className="mt-1 text-[12.5px] leading-snug text-graphite">{s.label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[12.5px] text-white/45">Open Monday to Saturday, 9 to 5 · {site.address.line1}, Calgary</p>
        </div>

        <div className="relative order-1 h-[56svh] min-h-[420px] lg:order-2 lg:h-[86svh]">
          <HeroBody regions={scan} />
        </div>
      </div>
    </section>
  );
}
