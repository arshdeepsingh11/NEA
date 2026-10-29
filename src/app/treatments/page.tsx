import { Suspense } from "react";
import { PageHero } from "@/components/sections/page-hero";
import { TreatmentRows } from "@/components/sections/treatment-rows";
import { categories, treatments } from "@/content/treatments";
import { pageMeta } from "@/lib/seo";
import { janeFor } from "@/content/jane";
import { bodyRegions, faceZones } from "@/content/body";

export const metadata = pageMeta({
  title: "All treatments: Fotona laser, injectables, peels, PRP and more",
  description: "Every NEA Precision Skin treatment in one place: skin and peels, Fotona laser, injectables, body, hair, health and wellness, and feminine health. Session times, prices and online booking.",
  path: "/treatments",
});

export default function TreatmentsPage() {
  const items = treatments.map(({ slug, title, summary, image, category, concerns, intro, list }) => {
    const j = janeFor(slug);
    const priced = j.filter((x) => x.price).map((x) => x.price as number);
    return {
      slug,
      title,
      summary,
      about: intro[0] ?? "",
      includes: list,
      image,
      category,
      concerns,
      booking: { services: j.length, min: j[0]?.min ?? null, price: priced.length ? Math.min(...priced) : null },
      regions: [...bodyRegions.map((r) => ({ r, face: false })), ...faceZones.map((r) => ({ r, face: true }))].filter(({ r }) => r.treatments.includes(slug)).map(({ r, face }) => ({ id: r.id, name: r.name, face })),
    };
  });
  return (
    <>
      <PageHero trail={[{ name: "Treatments", path: "/treatments" }]} title="What would you like to change?" lede="Every treatment at NEA, with what it costs and how long it takes. Tap any one to see more, or book it straight away." className="!pb-8 md:!pb-10" />
      <section className="pb-28">
        <Suspense>
          <TreatmentRows items={items} categories={categories} />
        </Suspense>
      </section>
    </>
  );
}
