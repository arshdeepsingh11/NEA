import { PageHero } from "@/components/sections/page-hero";
import { MagazineReader } from "@/components/magazine/magazine-reader";
import { issues } from "@/content/magazine";
import { LeadForm } from "@/components/sections/lead-form";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "NEA Magazine and BioNow", description: "Read NEA’s Precision Skin Magazine as a page-turning flip book: acne, chemical peels, Fotona laser, injectables, hair restoration, nutrition and more. Or download the PDF.", path: "/magazine" });

export default function MagazinePage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Magazine", path: "/magazine" }]}
        title="Precision Skin Magazine."
        lede="Turn the pages right here. 32 pages on acne, peels, lasers, injectables, hair, nutrition and more, written by the NEA team."
        className="!pb-10 md:!pb-14"
      />
      <MagazineReader issue={issues[0]} />
      <section className="chapter chapter-dark" id="bionow">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md font-semibold">How old are you… really?</h2>
            <p className="measure mt-5 text-lede text-graphite">
              BioNow 2025 is a guide to health trends, new science and practical ways to “know your age” on a deeper level: your backstage pass to the future of health, longevity and sustainable living.
            </p>
          </div>
          <div className="glass-dark rounded-4xl p-6 md:p-10">
            <p className="mb-6 text-graphite">Fill in your details to get the magazine.</p>
            <LeadForm kind="magazine" source="bionow" dark />
          </div>
        </div>
      </section>
    </>
  );
}
