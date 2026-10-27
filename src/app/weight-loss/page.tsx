import Link from "next/link";
import { Check } from "lucide-react";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { nutritionPrograms } from "@/content/packages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Weight loss and nutrition programs with a Registered Dietitian",
  description: "Nutrition Start Up, the 6 Visit Program and the 1 Year Subscription: full body analysis, customized meal plans and follow-ups that feed your skin as well as your health.",
  path: "/weight-loss",
});

export default function WeightLossPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Weight loss & nutrition", path: "/weight-loss" }]}
        title="You are what you eat, and so is your skin."
        lede="With skin being the largest organ in the body, nourishment starts from within. Eating the right balance of foods, combined with the recommended skin treatments, feeds your health and your skin."
      />
      <section className="pb-12">
        <div className="container prose-nea measure">
          <p>Combining the right products with the right foods can help give your skin the vital nutrients it needs to stay soft, supple, youthful and blemish-free. Nutrition protocols prepared by Registered Dietitians help you see which dietary changes, combined with your personalized skin protocol, may reduce signs of aging and improve some skin conditions.</p>
          <p>Many of our packages include nutrition consultations with a Registered Dietitian. Talk to our medical aestheticians to see which ones, or whether a session with the dietitian would help you.</p>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="Explore our programs." />
          <div className="grid gap-5 lg:grid-cols-3">
            {nutritionPrograms.map((p) => (
              <div key={p.name} className="flex flex-col rounded-4xl surface p-8">
                <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-3 text-[15px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                      {it}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[14px] leading-relaxed text-graphite">{p.addons}</p>
                <Link href={`/book?topic=${encodeURIComponent(p.name)}`} className="btn-primary mt-8">
                  Request consultation
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-4xl bg-flora-soft p-8">
            <h3 className="font-display text-xl font-semibold">On a GLP-1 medication?</h3>
            <p className="mt-2 max-w-3xl leading-relaxed text-graphite">
              NEA can support your doctor’s care with DEXA scans to track muscle, a protein-first nutrition plan, truSculpt flex to protect muscle, and skin tightening for loose skin. We do not prescribe weight-loss medication.
            </p>
            <Link href="/experiences/body-truth-scan" className="btn-ghost mt-6">
              Start with a Body Truth Scan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
