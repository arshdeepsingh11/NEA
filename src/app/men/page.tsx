import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { NeaImage } from "@/components/ui/nea-image";
import { getTreatment } from "@/content/treatments";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Treatments for men in Calgary: truSculpt, hair, laser, injectables",
  description: "Yes, absolutely. Men get laser, facials, hair restoration, truSculpt flex muscle sculpting, fillers and neuromodulators at NEA, all tailored to you.",
  path: "/men",
});

const PICKS = ["muscle-sculpting", "hair-restoration", "migraine-treatment", "dermal-fillers", "facials", "laser-hair-removal", "neuromodulators", "active-acne"];

export default function MenPage() {
  const list = PICKS.map(getTreatment).filter((t): t is NonNullable<typeof t> => Boolean(t));
  return (
    <>
      <PageHero
        trail={[{ name: "Treatments for men", path: "/men" }]}
        title="Can men get treatments? Yes, absolutely."
        lede="A growing number of men are getting laser treatments, facial treatments and injectables to enhance their faces and bodies. At NEA, every treatment is tailor-made to you and your specific needs."
      >
        <div className="flex flex-wrap gap-3">
          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Book online
          </a>
          <Link href="/experiences/mens-skin-check" className="btn-ghost">
            Men’s skin check at your barbershop
          </Link>
        </div>
      </PageHero>
      <section className="pb-28">
        <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((t) => (
            <Link key={t.slug} href={`/treatments/${t.slug}`} className="group overflow-hidden rounded-4xl surface">
              <div className="relative aspect-square bg-mist">
                <NeaImage src={t.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-700 ease-spring group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold tracking-tight">{t.title}</h2>
                <p className="mt-1 text-[14px] text-graphite">{t.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
