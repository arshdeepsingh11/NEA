import { PageHero } from "@/components/sections/page-hero";
import { Accordion } from "@/components/sections/accordion";
import { faqs } from "@/content/faq";
import { JsonLd, faqSchema, pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Frequently asked questions",
  description: "Safety, choosing a treatment, Botox, fillers, peels, downtime, preparation, results, combining treatments, costs, insurance, benefits and testing at NEA Precision Skin.",
  path: "/faq",
});

const TOPICS = [
  { id: "treatments", label: "Treatments" },
  { id: "visit", label: "Your visit" },
  { id: "testing", label: "Testing" },
  { id: "pricing", label: "Pricing & insurance" },
] as const;

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHero
        trail={[{ name: "FAQ", path: "/faq" }]}
        title="Frequently asked questions."
        lede="At NEA, we combine advanced skincare science with the power of nutrition. Here are answers to the questions we hear most."
      />
      <section className="pb-28">
        <div className="container grid gap-16 lg:grid-cols-[0.6fr_1.4fr]">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:h-fit">
            <ul className="space-y-1">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block rounded-full px-4 py-2 text-graphite hover:bg-white hover:text-ink">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/ask" className="btn-primary mt-8">
              Ask your own question
            </Link>
          </nav>
          <div className="space-y-16">
            {TOPICS.map((t) => (
              <div key={t.id} id={t.id} className="scroll-mt-28">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">{t.label}</h2>
                <Accordion
                  items={faqs
                    .map((f, i) => ({ ...f, i }))
                    .filter((f) => f.topic === t.id)
                    .map((f) => ({ id: `q-${f.i}`, title: f.q, content: <p className="measure leading-relaxed text-graphite">{f.a}</p> }))}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
