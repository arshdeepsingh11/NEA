import Link from "next/link";
import { NeaImage } from "@/components/ui/nea-image";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "BioGut nutrition clinic: radiant skin begins with your gut",
  description: "Personalized nutrition from a Registered Dietitian using your genetics, microbiome and lifestyle: trigger foods, nutrient absorption, customized diets and gut microbiome support.",
  path: "/nutrition",
});

const HELP = [
  { title: "Identification of trigger foods", text: "Customized nutrition considers an individual’s specific food intolerances and sensitivities. Through careful analysis, certain trigger foods that may exacerbate symptoms can be identified." },
  { title: "Nutrition absorption", text: "Individuals may experience challenges in nutrient absorption. Tailoring the diet to include easily digestible and absorbable nutrients can help address nutrient deficiencies." },
  { title: "Customized diets", text: "Customized nutrition assists in creating an individualized dietary plan that aligns with a person’s lifestyle and preferences, with the goal of minimizing triggers." },
  { title: "Gut microbiome support", text: "Considering the individual’s gut microbiome composition, tailoring nutrition can involve implementing strategies to support a healthy gut microbiome." },
];

export default function NutritionPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "BioGut nutrition", path: "/nutrition" }]}
        title="Radiant skin begins with your gut."
        lede="We are health and nutrition experts of the gut. Our wellness and skincare packages are designed to address skin issues at their root cause: nutrition."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/book?topic=Nutrition" className="btn-primary">
            Book a nutrition consult
          </Link>
          <a href={site.ecosystem.biogut} target="_blank" rel="noreferrer" className="btn-ghost">
            Visit BioGut Clinic
          </a>
        </div>
      </PageHero>
      <section className="pb-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="prose-nea">
            <p className="!text-lg !text-ink">Personalized nutrition is a cutting-edge dietary approach that leverages individual genetic makeup, lifestyle factors, and health goals to create tailor-made nutrition plans.</p>
            <p>By analyzing unique genetic profiles, microbiomes, and personal preferences, personalized nutrition optimizes dietary choices to enhance your health span. Many NEA packages include nutrition consultations with a Registered Dietitian, and many extended health plans cover dietitian visits.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-5xl bg-mist">
            <NeaImage src="2024/06/calgary-weight-loss-program.jpg" alt="Food and nutrition planning" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="We understand the challenges, and we are here to support you." />
          <div className="grid gap-4 md:grid-cols-2">
            {HELP.map((h) => (
              <div key={h.title} className="rounded-4xl bg-porcelain p-8">
                <h3 className="text-xl font-semibold tracking-tight">{h.title}</h3>
                <p className="mt-3 leading-relaxed text-graphite">{h.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/weight-loss" className="btn-primary">
              Nutrition and weight-loss programs
            </Link>
            <Link href="/tests#biogut" className="btn-ghost">
              BioGut microbiome test
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
