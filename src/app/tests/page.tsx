import Link from "next/link";
import { TestJourney } from "@/components/sections/test-journey";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { TestStore } from "@/components/sections/test-store";
import { LazySignal } from "@/components/three/lazy";
import { labTests, testGroups } from "@/content/tests";
import { bodyRegions } from "@/content/body";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Microbiome, hormone and DNA testing by BioAro Labs",
  description: "All 46 BioAro Labs tests: skin, gut, oral and vaginal microbiome, hormones, vitamins, amino acids, inflammation, heart, kidney, brain and DNA. Plain-language details, list prices and Buy now.",
  path: "/tests",
});

export default function TestsPage() {
  const regionsByTest: Record<string, { id: string; name: string }[]> = {};
  for (const r of bodyRegions) for (const t of r.tests) (regionsByTest[t] ??= []).push({ id: r.id, name: r.name });
  return (
    <>
      <section className="chapter-dark relative overflow-hidden">
        <LazySignal className="absolute inset-0 opacity-70" offsetX={3.4} />
        <div className="relative">
          <PageHero
            dark
            className="!bg-transparent"
            trail={[{ name: "Testing", path: "/tests" }]}
            title="Understand your biology before symptoms become decisions."
            lede="Microbiome, hormones, vitamins, inflammation, heart, brain and DNA. Fulfilled by BioAro Labs in CLIA-registered laboratories and explained by your NEA team."
          >
            <div className="flex flex-wrap gap-3">
              <Link href="/book?topic=Microbiome%20testing" className="btn-primary">
                Ask which test fits
              </Link>
              <a href="#lab-store" className="btn-ghost">
                Browse all {labTests.length} tests
              </a>
            </div>
            <div className="mt-6">
              <AiQuestionChips questions={["Which test explains my acne?", "BioGut vs BioSkin", "Tests for hair loss"]} />
            </div>
          </PageHero>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="How testing works." lede="Four steps, from the first conversation to a plan that changes because of your results. Tap a step to see what happens and why." />
          <TestJourney />
        </div>
      </section>
      <section id="lab-store" className="scroll-mt-20 pb-28">
        <div className="container">
          <SectionHead title="Every test, one tap from your cart." lede="Search by what you feel, or browse by body system. Buy now takes you straight to the test in BioAro Labs’ shop." />
          <TestStore tests={labTests} groups={testGroups} regionsByTest={regionsByTest} />
          <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-graphite">
            Prices are BioAro Labs list prices in CAD and may change; consultation fees are separate. These tests are not intended to diagnose, treat, cure, or prevent any disease. Results should be discussed with a qualified healthcare provider.
          </p>
        </div>
      </section>
    </>
  );
}
