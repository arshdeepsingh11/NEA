import Link from "next/link";
import { TestJourney } from "@/components/sections/test-journey";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { TestsCatalog } from "@/components/sections/tests-catalog";
import { LazySignal } from "@/components/three/lazy";
import { labTests, testGroups } from "@/content/tests";
import { bodyRegions } from "@/content/body";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Microbiome, hormone and DNA testing by BioAro Labs",
  description: "BioSkin, BioGut and BioFemme microbiome tests, hormone panels, vitamins, inflammation, telomeres and DNA — the tests NEA uses to personalize skin and health plans, with list prices.",
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
            lede="Skin, gut and vaginal microbiome, hormones, vitamins, inflammation and DNA. Fulfilled by BioAro Labs in CLIA-registered laboratories and explained by your NEA team."
          >
            <div className="flex flex-wrap gap-3">
              <Link href="/book?topic=Microbiome%20testing" className="btn-primary">
                Ask which test fits
              </Link>
              <a href={site.ecosystem.bioaroShop} target="_blank" rel="noreferrer" className="btn-ghost">
                Full BioAro catalog
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
      <section className="pb-28">
        <div className="container">
          <TestsCatalog tests={labTests} groups={testGroups} regionsByTest={regionsByTest} />
          <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-graphite">
            Prices are BioAro Labs list prices in CAD and may change; consultation fees are separate. These tests are not intended to diagnose, treat, cure, or prevent any disease. Results should be discussed with a qualified healthcare provider.
          </p>
        </div>
      </section>
    </>
  );
}
