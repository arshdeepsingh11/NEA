import Link from "next/link";
import { BookButton } from "@/components/booking/booking";
import { Film } from "@/components/ui/film";
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
      <section className="relative overflow-hidden bg-[#141011] text-white md:min-h-[92vh]">
        {/* the film: tall on phones, wide behind the words on larger screens */}
        <div className="relative aspect-[4/5] w-full md:absolute md:inset-0 md:aspect-auto">
          <Film
            className="absolute inset-0"
            pauseAt="bottom"
            label="A Fotona laser treatment at NEA"
            sources={[
              { src: "/media/nea-fotona-16x9.mp4", poster: "/media/nea-fotona-16x9.jpg", media: "(min-width: 768px)" },
              { src: "/media/nea-fotona-4x5.mp4", poster: "/media/nea-fotona-4x5.jpg" },
            ]}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141011] via-[#141011]/10 to-transparent md:bg-[linear-gradient(90deg,rgba(20,16,17,0.92)_0%,rgba(20,16,17,0.6)_38%,rgba(20,16,17,0)_68%)]" />
        </div>
        <div className="container relative -mt-28 pb-16 md:mt-0 md:flex md:min-h-[92vh] md:flex-col md:justify-end md:pb-20 md:pt-40">
          <p className="text-[13px] uppercase tracking-[0.2em] text-white/60">One of Calgary’s first Fotona centres</p>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.95]">Fotona laser.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80 md:text-[19px]">
            Widely acclaimed for its versatility. NEA is one of the first centres to offer Fotona and all its applications, with predictable, safe results and short downtime, clinically proven for all skin types and colours.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <BookButton slug="fotona-laser" title="Fotona" variant="light" className="!bg-white !text-ink hover:!bg-white/90">Book a session</BookButton>
            <Link href="/treatments" className="btn border border-white/30 text-white hover:bg-white/10">
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
      <section className="chapter">
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
