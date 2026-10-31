import Link from "next/link";
import { Film } from "@/components/ui/film";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { TestStore } from "@/components/sections/test-store";
import { labTests, testGroups } from "@/content/tests";
import { bodyRegions } from "@/content/body";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Hormone, gut and vitamin tests for your skin",
  description: "Simple tests for the three things behind most skin problems: hormones, gut and vitamins. By BioAro Labs, explained by your NEA team.",
  path: "/tests",
});

export default function TestsPage() {
  const regionsByTest: Record<string, { id: string; name: string }[]> = {};
  for (const r of bodyRegions) for (const t of r.tests) (regionsByTest[t] ??= []).push({ id: r.id, name: r.name });
  return (
    <>
      <section className="chapter-dark relative overflow-hidden">
        <div className="relative">
          <PageHero
            dark
            className="!bg-transparent"
            trail={[{ name: "Testing", path: "/tests" }]}
            title="Find out what’s behind your skin."
            lede="Most skin problems start in one of three places: your hormones, your gut or your vitamins. A simple test shows which one. We explain it in plain words."
          >
            <div className="flex flex-wrap gap-3">
              <Link href="/book?topic=Microbiome%20testing" className="btn-primary">
                Ask which test fits
              </Link>
              <a href="#lab-store" className="btn-ghost">
                See the tests
              </a>
            </div>
            <div className="mt-6">
              <AiQuestionChips questions={["Which test explains my breakouts?", "BioGut or BioSkin?", "Tests for hair thinning"]} />
            </div>
          </PageHero>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="How it works." lede="A small sample. A few weeks. Then we sit down and explain it." />
          <Film
            className="aspect-square rounded-[32px] md:aspect-video"
            label="From sample to insight: how NEA testing works"
            sources={[
              { src: "/media/nea-testing-16x9.mp4", poster: "/media/nea-testing-16x9.jpg", media: "(min-width: 768px)" },
              { src: "/media/nea-testing-1x1.mp4", poster: "/media/nea-testing-1x1.jpg" },
            ]}
            chapters={[
              { at: 0, label: "A painless sample", note: "A gentle swab, a stool kit or a blood draw, depending on the test." },
              { at: 4, label: "Sealed and sent", note: "Your sample is sealed, labelled and sent to BioAro Labs." },
              { at: 7, label: "Analysed in the lab", note: "CLIA-registered laboratories run your test." },
              { at: 10, label: "Your results, explained", note: "Results arrive on your secure dashboard, and your NEA team walks you through them." },
            ]}
          />
        </div>
      </section>
      <section id="lab-store" className="scroll-mt-20 pb-28">
        <div className="container">
          <SectionHead title="Pick what’s bothering you." lede="We’ll show the tests that help. Buy now takes you to the test in BioAro Labs’ shop." />
          <TestStore tests={labTests} groups={testGroups} regionsByTest={regionsByTest} />
          <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-graphite">
            Prices are BioAro Labs list prices in CAD and may change; consultation fees are separate. These tests are not intended to diagnose, treat, cure, or prevent any disease. Results should be discussed with a qualified healthcare provider.
          </p>
        </div>
      </section>
    </>
  );
}
