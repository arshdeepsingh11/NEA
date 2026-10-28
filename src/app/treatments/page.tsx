import { Suspense } from "react";
import { PageHero } from "@/components/sections/page-hero";
import { TreatmentsBrowser } from "@/components/sections/treatments-browser";
import { categories, treatments } from "@/content/treatments";
import { pageMeta } from "@/lib/seo";
import { janeFor } from "@/content/jane";
import { bodyRegions, faceZones } from "@/content/body";

export const metadata = pageMeta({
  title: "All treatments: Fotona laser, injectables, peels, PRP and more",
  description: "Every NEA Precision Skin treatment in one place, grouped by what it does: skin and peels, Fotona laser, injectables, body, hair, wellness and feminine health.",
  path: "/treatments",
});

export default function TreatmentsPage() {
  const items = treatments.map(({ slug, title, summary, image, category, concerns }) => {
    const j = janeFor(slug);
    const priced = j.filter((x) => x.price).map((x) => x.price as number);
    return {
      slug,
      title,
      summary,
      image,
      category,
      concerns,
      jane: { services: j.length, min: j[0]?.min ?? null, price: priced.length ? Math.min(...priced) : null },
      regions: [...bodyRegions.map((r) => ({ r, face: false })), ...faceZones.map((r) => ({ r, face: true }))].filter(({ r }) => r.treatments.includes(slug)).map(({ r, face }) => ({ id: r.id, name: r.name, face })),
    };
  });
  return (
    <>
      <PageHero
        trail={[{ name: "Treatments", path: "/treatments" }]}
        title="Tell SI what you want to fix. It ranks every treatment."
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
