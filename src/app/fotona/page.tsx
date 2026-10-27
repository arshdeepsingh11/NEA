import Link from "next/link";
import { LazyBeam } from "@/components/three/lazy";
import { NeaImage } from "@/components/ui/nea-image";
import { SectionHead } from "@/components/sections/page-hero";
import { treatments } from "@/content/treatments";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Fotona laser in Calgary: SP Dynamis, 4D, NightLase and more",
  description: "NEA is one of the first centres to offer Fotona laser and all its applications. Er:YAG and Nd:YAG modes for tightening, resurfacing, hair, snoring, feminine health and nails.",
  path: "/fotona",
});

export default function FotonaPage() {
  const laser = treatments.filter((t) => ["laser"].includes(t.category) || ["laser-hair-removal", "wart-removal", "snoring-sleep-apnea", "feminine-health", "fungal-nail", "body-contouring", "hair-restoration", "large-pores"].includes(t.slug));
  return (
    <>
      <section className="chapter-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <LazyBeam />
        </div>
        <div className="container relative flex min-h-[92vh] flex-col justify-end pb-20 pt-40">
          <h1 className="max-w-4xl text-display-xl font-semibold">Fotona laser.</h1>
          <p className="measure mt-6 text-lede text-white/75">
            Widely acclaimed for its versatility. NEA is one of the first centres to offer Fotona and all its applications, with predictable, safe results and short downtime, clinically proven for all skin types and colours.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-light">
              Book a session
            </a>
            <Link href="/treatments?focus=laser" className="btn border border-white/20 text-white hover:bg-white/10">
              See laser treatments
            </Link>
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div className="prose-nea">
            <h2 className="!mt-0 !text-display-md">Fotona SP Dynamis.</h2>
            <p>An advanced and versatile laser with two wavelengths: Erbium (Er:YAG) and long-pulse Nd:YAG 1064nm. They can be used in many combinations, and both can be delivered with a prolonged, gentle delivery time that gently heats the skin.</p>
            <p>This gentle heating causes immediate tightening of the collagen as well as switching on new collagen production for several weeks. The result is tightening of slack or sagging skin and improvement in fine lines, wrinkles and skin quality.</p>
            <p className="text-[14px]">Disclaimer: The risk of post-treatment infections is very low, as NEA takes all precautions to ensure a sterile, clinical setting. We provide post-procedure protocols, and clients need to follow them to ensure proper recovery and results.</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-5xl bg-mist">
            <NeaImage src="2023/12/Fotona4D_Page.jpg" alt="Fotona 4D treatment" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="chapter bg-white">
        <div className="container">
          <SectionHead title="What Fotona treats at NEA." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {laser.map((t) => (
              <Link key={t.slug} href={`/treatments/${t.slug}`} className="group rounded-4xl bg-porcelain p-7">
                <h3 className="text-xl font-semibold tracking-tight group-hover:underline">{t.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">{t.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
