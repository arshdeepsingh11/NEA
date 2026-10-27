import { BodyExplorer, type RegionLinks } from "@/components/body/body-explorer";
import { bodyRegions, faceZones } from "@/content/body";
import { getProgram } from "@/content/programs";
import { getTest } from "@/content/tests";
import { getTreatment } from "@/content/treatments";
import { JsonLd, breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "3D Body Explorer: how NEA connects skin, gut, hormones and more",
  description:
    "Rotate a realistic 3D human body and face. Click any area to see what it is made of, what throws it off, which BioAro test measures it and which NEA treatment improves it.",
  path: "/body",
});

/** Resolve only the light fields each region needs, so the client bundle stays small. */
function resolveLinks(): Record<string, RegionLinks> {
  const out: Record<string, RegionLinks> = {};
  for (const r of [...bodyRegions, ...faceZones]) {
    const p = r.program ? getProgram(r.program) : undefined;
    out[r.id] = {
      treatments: r.treatments.flatMap((s) => {
        const t = getTreatment(s);
        return t ? [{ slug: t.slug, title: t.title, summary: t.summary }] : [];
      }),
      tests: r.tests.flatMap((s) => {
        const t = getTest(s);
        return t ? [{ slug: t.slug, name: t.name, price: t.price, bestFor: t.bestFor }] : [];
      }),
      program: p ? { slug: p.slug, name: p.name, priceFrom: p.priceFrom, duration: p.duration } : undefined,
    };
  }
  return out;
}

export default function BodyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Body Explorer", path: "/body" }])} />
      <header className="container flex flex-wrap items-end justify-between gap-4 pb-5 pt-8 md:pt-10">
        <h1 className="max-w-4xl font-display text-[clamp(1.8rem,3.4vw,2.9rem)] font-semibold leading-[1.05] tracking-tight text-ink">
          Skin is the surface. <span className="aurora-text">Here is what is underneath.</span>
        </h1>
        <p className="chip">Body Intelligence · 3D</p>
      </header>
      <BodyExplorer body={bodyRegions} face={faceZones} links={resolveLinks()} />
      <div className="container pb-32 pt-8">
        <p className="max-w-3xl text-[12px] leading-relaxed text-graphite/80">
          Educational information, not a diagnosis. Your NEA practitioner will recommend treatments and tests only after an assessment. Body model: MakeHuman (CC0). Face scan: “Lee Perry-Smith” head by Infinite Realities, licensed CC BY 3.0.
        </p>
      </div>
    </>
  );
}
