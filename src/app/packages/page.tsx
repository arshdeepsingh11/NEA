import Link from "next/link";
import { Check, Download } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { PageHero } from "@/components/sections/page-hero";
import { wellnessPackages } from "@/content/packages";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Beauty & wellness packages: precision in nutrition, skin and health",
  description: "Anti-aging, hair, nutrition, scarring, facial, sports, arthritis, feminine health, heart health, sleep apnea, laser hair reduction, skin rejuvenation and Get Your Glow packages.",
  path: "/packages",
});

export default function PackagesPage() {
  const groups = [
    { id: "beauty", title: "Beauty packages" },
    { id: "wellness", title: "Wellness packages" },
  ] as const;
  return (
    <>
      <PageHero
        trail={[{ name: "Packages", path: "/packages" }]}
        title="Beauty and wellness packages."
        lede="Did you know your skin is a window into your health? Each package combines beauty and the science of nutrition. Every item below is exactly what you receive."
      >
        <div className="flex flex-wrap gap-3">
          <a href={site.downloads.packageCatalog} target="_blank" rel="noreferrer" className="btn-ghost">
            <Download className="h-4 w-4" /> Download the package catalog (PDF)
          </a>
          <Link href="/programs" className="btn text-graphite hover:text-ink">
            Prefer a simpler choice? See the 4 programs
          </Link>
        </div>
      </PageHero>
      {groups.map((g) => (
        <section key={g.id} className="pb-20">
          <div className="container">
            <h2 className="mb-8 text-display-md font-semibold">{g.title}</h2>
            <nav aria-label={`${g.title} index`} className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
              {wellnessPackages
                .filter((p) => p.group === g.id)
                .map((p) => (
                  <a key={p.id} href={`#${p.id}`} className="shrink-0 rounded-full border border-ink/10 bg-white px-4 py-2 text-[14px] hover:border-ink/30">
                    {p.name}
                  </a>
                ))}
            </nav>
            <div className="space-y-6">
              {wellnessPackages
                .filter((p) => p.group === g.id)
                .map((p) => (
                  <article key={p.id} id={p.id} className="scroll-mt-32 overflow-hidden rounded-5xl bg-white lg:grid lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="relative min-h-[260px] bg-mist">
                      <NeaImage src={p.image} alt={p.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                    </div>
                    <div className="p-8 md:p-12">
                      <h3 className="text-3xl font-semibold tracking-tight">{p.name}</h3>
                      <p className="mt-2 text-lg text-ink">{p.question}</p>
                      <p className="mt-2 text-graphite">{p.forWho}</p>
                      <div className={`mt-8 grid gap-8 ${p.tiers.length > 1 ? "md:grid-cols-2" : ""} ${p.tiers.length > 2 ? "xl:grid-cols-3" : ""}`}>
                        {p.tiers.map((t) => (
                          <div key={t.name}>
                            {p.tiers.length > 1 && <h4 className="mb-3 font-display font-semibold">{t.name}</h4>}
                            <ul className="space-y-2.5">
                              {t.items.map((it) => (
                                <li key={it} className="flex gap-3 text-[15px] leading-snug">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                                  {it}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 flex flex-wrap gap-3">
                        <Link href={`/book?topic=${encodeURIComponent(p.name)}`} className="btn-primary">
                          Request a consultation
                        </Link>
                        <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                          Book online
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
