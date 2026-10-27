import Link from "next/link";
import { NeaImage } from "@/components/ui/nea-image";
import { NumberTicker } from "@/components/ui/number-ticker";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { founder, teamNamedInReviews } from "@/content/team";
import { JsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { nea } from "@/lib/utils";

export const metadata = pageMeta({
  title: "About NEA: beautiful skin powered by gut health",
  description: "A physician-managed clinic in Calgary NE, one of the first centres to offer Fotona laser, founded by Registered Dietitian Raman Kapoor. Our mission and vision.",
  path: "/about",
});

const DIFFERENT = [
  { title: "Customized Skin Health", text: "Harness the power of your microbiome and DNA insights for personalized, tailored skin treatments that not only enhance your natural beauty, but also promote long-term skin vitality.", href: "/treatments?focus=skin" },
  { title: "Health Span & Longevity Focused", text: "Discover personalized strategies to extend your health span, while focusing on your skin health.", href: "/packages" },
  { title: "Holistic Approach", text: "Embrace a comprehensive, inside-out approach to skin health, combining nutrition, wellness, your microbiome and preventive care.", href: "#mission" },
  { title: "Nutrition Consults", text: "Optimize your health with personalized nutrition consults because you truly are what you eat. Expert dietary guidance tailored to your unique needs by our Registered Dietitian, Raman Kapoor.", href: "/nutrition" },
  { title: "Medical Grade Products", text: "Experience the difference with our medical-grade products, designed for superior results and safety. ZO, Vivier, AlumierMD and Glo are all available at NEA.", href: "/treatments/medical-grade-skincare" },
  { title: "Weight Loss Program", text: "Achieve sustainable weight loss with our tailored programs, customized treatments and precision approach, guided by expert advice.", href: "/weight-loss" },
  { title: "Disease Prevention", text: "Tailored skin health plans that incorporate wellness, microbiome and genetic data to prevent skin diseases and improve longevity.", href: "/microbiome" },
  { title: "Experts in Diversity", text: "Our diverse multilingual team of experts ensures inclusive, personalized care for all skin types, ethnicities and health goals.", href: "/treatments" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: founder.name, jobTitle: "Registered Dietitian", worksFor: { "@id": `${site.url}/#clinic` }, image: nea(founder.image), sameAs: [site.social.linkedinFounder], award: founder.award }} />
      <PageHero
        trail={[{ name: "About", path: "/about" }]}
        title="Beautiful skin, powered by gut health."
        lede="NEA Precision Skin is located in the heart of Calgary’s NE. We are a physician-managed clinic with a team of experts, equipped with the latest medical technology, here to promote better health while emphasizing the natural beauty in you."
      />
      <section className="pb-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden rounded-5xl bg-mist">
            <NeaImage src="2023/11/Photo-2023-08-10-11-42-11-AM-scaled-e1719259811314.jpg" alt="The NEA Precision Skin clinic" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="prose-nea">
            <h2 className="!mt-0 !text-display-md">One of the first centres to offer Fotona laser.</h2>
            <p>Clients at NEA Precision Skin will be impressed with the wide range of minimally invasive treatment options available that provide highly effective and safe results with a short downtime afterwards.</p>
            <p>The Fotona Laser’s state of the art technology allows for uniform laser treatments with predictable, safe results and an incredible spectrum of cosmetic laser procedure options and medical treatment modes. Fotona laser procedures are clinically proven to be appropriate for all skin types and colours.</p>
            <p>Our experts consult every patient individually before any treatment, so you feel happy, content and better each and every time you are here. Book a complimentary session and we will perform an in-depth assessment and create a customized solution plan for you.</p>
          </div>
        </div>
      </section>
      <section className="chapter chapter-dark" id="mission">
        <div className="container">
          <h2 className="max-w-4xl text-display-lg font-semibold">Be the CEO of your own health.</h2>
          <p className="measure mt-6 text-lede text-white/70">
            We believe you should be the CEO of your own health. By offering genetic and microbiome testing, we empower individuals with valuable health insights that were previously inaccessible. With a focus on evidence-based guidelines, we provide affordable, personalized healthcare experiences.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="glass-dark rounded-4xl p-8">
              <h3 className="text-2xl font-semibold">Our mission</h3>
              <p className="mt-3 text-lg leading-relaxed text-white/75">To revolutionize personalized healthcare through innovative software solutions, precision health clinics and advanced testing solutions.</p>
            </div>
            <div className="glass-dark rounded-4xl p-8">
              <h3 className="text-2xl font-semibold">Our vision</h3>
              <p className="mt-3 text-lg leading-relaxed text-white/75">To extend human healthspan, integrating innovative approaches for a healthier tomorrow.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="What makes NEA different." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENT.map((d) => (
              <Link key={d.title} href={d.href} className="group rounded-4xl surface p-7 transition hover:shadow-[0_20px_50px_-30px_rgba(21,25,28,0.35)]">
                <h3 className="text-lg font-semibold tracking-tight group-hover:underline">{d.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">{d.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="chapter" id="raman">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-5xl bg-mist lg:sticky lg:top-28 lg:h-fit">
            <NeaImage src={founder.image} alt={founder.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-display-md font-semibold">Meet {founder.name}.</h2>
            <p className="mt-3 text-graphite">{founder.role}</p>
            <div className="prose-nea mt-8">
              {founder.bio.map((b) => (
                <p key={b.slice(0, 20)}>{b}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {founder.facts.map((f) => (
                <div key={f.label}>
                  <p className="font-display text-4xl font-semibold">
                    <NumberTicker value={f.value} suffix={f.suffix} />
                  </p>
                  <p className="mt-1 text-[14px] text-graphite">{f.label}</p>
                </div>
              ))}
            </div>
            <a href={site.social.linkedinFounder} target="_blank" rel="noreferrer" className="btn-ghost mt-10">
              LinkedIn profile
            </a>
            <div className="mt-16 rounded-4xl bg-porcelain p-8">
              <h3 className="font-display text-lg font-semibold">The team clients mention by name</h3>
              <p className="mt-2 text-graphite">Aestheticians and injectors who appear in NEA’s Google reviews.</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {teamNamedInReviews.map((n) => (
                  <li key={n} className="rounded-full surface px-4 py-2 text-[15px]">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
