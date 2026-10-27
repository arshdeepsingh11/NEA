import { Download } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { NeaImage } from "@/components/ui/nea-image";
import { LeadForm } from "@/components/sections/lead-form";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "NEA Magazine and BioNow", description: "Download the Precision Skin Magazine and BioNow 2025: science-backed reasons why skincare is not a luxury but an investment in your health.", path: "/magazine" });

export default function MagazinePage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Magazine", path: "/magazine" }]}
        title="Precision Skin Magazine."
        lede="Discover the science-backed reasons why skincare isn’t just a luxury. Beyond aesthetics, skincare is a celebration of health and vitality, a daily ritual that harmonizes with your well-being."
      />
      <section className="pb-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[3/4] overflow-hidden rounded-5xl bg-mist">
            <NeaImage src="2023/12/Nea-Skincare-YYC-Magazine.jpg" alt="NEA Magazine cover" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-display-md font-semibold">The Fall Edition.</h2>
            <p className="measure mt-4 text-lede text-graphite">Download now and start a transformative journey towards a healthier, more beautiful you.</p>
            <a href={site.downloads.magazine} target="_blank" rel="noreferrer" className="btn-primary mt-8">
              <Download className="h-4 w-4" /> Download NEA Magazine (PDF)
            </a>
          </div>
        </div>
      </section>
      <section className="chapter chapter-dark" id="bionow">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md font-semibold">How old are you… really?</h2>
            <p className="measure mt-5 text-lede text-white/70">
              BioNow 2025 is a guide to health trends, new science and practical ways to “know your age” on a deeper level: your backstage pass to the future of health, longevity and sustainable living.
            </p>
          </div>
          <div className="glass-dark rounded-4xl p-6 md:p-10">
            <p className="mb-6 text-white/70">Fill in your details to get the magazine.</p>
            <LeadForm kind="magazine" source="bionow" dark />
          </div>
        </div>
      </section>
    </>
  );
}
