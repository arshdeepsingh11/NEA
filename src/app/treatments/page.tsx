import { Suspense } from "react";
import { PageHero } from "@/components/sections/page-hero";
import { TreatmentsBrowser } from "@/components/sections/treatments-browser";
import { categories, treatments } from "@/content/treatments";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "All treatments: Fotona laser, injectables, peels, PRP and more",
  description: "Every NEA Precision Skin treatment in one place, grouped by what it does: skin and peels, Fotona laser, injectables, body, hair, wellness and feminine health.",
  path: "/treatments",
});

export default function TreatmentsPage() {
  const items = treatments.map(({ slug, title, summary, image, category, concerns }) => ({ slug, title, summary, image, category, concerns }));
  return (
    <>
      <PageHero
        trail={[{ name: "Treatments", path: "/treatments" }]}
        title="Every treatment, grouped by what it does."
        lede="Medical-grade care in one physician-managed clinic. Not sure where to start? A free Skin Health Report tells you which of these will actually help."
      />
      <section className="pb-28">
        <div className="container">
          <Suspense>
            <TreatmentsBrowser items={items} categories={categories} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
