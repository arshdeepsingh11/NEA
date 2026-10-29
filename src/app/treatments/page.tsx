import { Suspense } from "react";
import Link from "next/link";
import { TreatmentDeck } from "@/components/sections/treatment-deck";
import { SectionHead } from "@/components/sections/page-hero";
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
      booking: { services: j.length, min: j[0]?.min ?? null, price: priced.length ? Math.min(...priced) : null },
      regions: [...bodyRegions.map((r) => ({ r, face: false })), ...faceZones.map((r) => ({ r, face: true }))].filter(({ r }) => r.treatments.includes(slug)).map(({ r, face }) => ({ id: r.id, name: r.name, face })),
    };
  });
  return (
    <>
      <h1 className="sr-only">All NEA Precision Skin treatments</h1>
      <Suspense>
        <TreatmentDeck items={items} categories={categories} />
      </Suspense>
      <section className="chapter">
        <div className="container">
          <SectionHead title="Every treatment, at a glance." lede="Not sure where to start? A free Skin Health Report tells you which of these will actually help." />
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.id}>
                <p className="text-[12px] uppercase tracking-[0.14em] text-graphite">{c.label}</p>
                <ul className="mt-3 space-y-1.5">
                  {treatments
                    .filter((t) => t.category === c.id)
                    .map((t) => (
                      <li key={t.slug}>
                        <Link href={`/treatments/${t.slug}`} className="text-[15px] text-ink underline-offset-4 hover:underline">
                          {t.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/skin-scan" className="btn-light">
              Get my free Skin Health Report
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
