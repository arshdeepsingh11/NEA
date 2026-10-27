import Link from "next/link";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { LazyPlanet } from "@/components/three/lazy";
import { getTest } from "@/content/tests";
import { pageMeta } from "@/lib/seo";
import { money } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Gut, skin and vaginal microbiome testing in Calgary",
  description: "Your gut and brain are in constant communication. Microbiome testing shows whether diet, antibiotics or lifestyle are disrupting the balance behind acne, eczema, IBS and more.",
  path: "/microbiome",
});

const BIOMES = [
  { name: "Gut microbiome", test: "biogut", text: "Home to trillions of microbes, the gut microbiome influences digestion, immune function, and overall health. It impacts conditions like irritable bowel disease (IBD), irritable bowel syndrome (IBS), heart health, lung health, and skin health." },
  { name: "Skin microbiome", test: "bioskin", text: "A balanced skin microbiome protects against harmful bacteria which can lead to conditions like acne, eczema, and dry skin. It also supports wound healing and skin regeneration." },
  { name: "Vaginal microbiome", test: "biofemme", text: "A healthy vaginal microbiome is essential for women’s health as it is in constant flux. Disturbances from antibiotics and aging can lead to issues like recurrent UTIs and yeast infections. Testing helps address these concerns." },
];

export default function MicrobiomePage() {
  return (
    <>
      <section className="chapter-dark relative overflow-hidden">
        <LazyPlanet type="biome" className="absolute inset-0 opacity-90 md:left-1/3" />
        <div className="relative">
          <PageHero
            dark
            className="!bg-transparent"
            trail={[{ name: "Microbiome testing", path: "/microbiome" }]}
            title="Did you know your gut and brain are strongly connected?"
            lede="Our gut and brain are in constant communication through the vagus nerve, which can influence our mood and other feelings. Microbiome testing shows whether that connection is strong, or whether lifestyle and habits are getting in the way."
          />
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead
            title="Why this testing matters."
            lede="Our microbiome comprises diverse communities of microbes, including bacteria, archaea, viruses, protozoa, and fungi, residing on and within our bodies. Diet, antibiotics and bodily changes can disrupt this balance, leading to dysbiosis."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {BIOMES.map((b) => {
              const t = getTest(b.test);
              return (
                <div key={b.name} className="flex flex-col rounded-4xl bg-white p-8">
                  <h3 className="text-2xl font-semibold tracking-tight">{b.name}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-graphite">{b.text}</p>
                  {t && (
                    <Link href={`/tests#${t.slug}`} className="mt-8 flex items-center justify-between rounded-2xl bg-porcelain px-5 py-4 text-[15px]">
                      <span className="font-medium">{t.name} test</span>
                      <span>{money(t.price)}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-[13px] text-graphite">Tests are processed by BioAro Labs in CLIA-registered laboratories. They are not intended to diagnose, treat, cure or prevent any disease.</p>
        </div>
      </section>
    </>
  );
}
