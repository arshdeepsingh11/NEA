import { Check } from "lucide-react";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { ScanOffer } from "@/components/sections/scan-offer";
import { LeadForm } from "@/components/sections/lead-form";
import { ShineBorder } from "@/components/ui/shine-border";
import { Accordion } from "@/components/sections/accordion";
import { getOffer } from "@/content/offers";
import { JsonLd, faqSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Free NEA Skin Health Report — advanced skin scan in Calgary",
  description: "A complimentary advanced facial analysis showing hidden pigmentation, UV damage, pores, texture, redness and hydration. 20 spots each week.",
  path: "/skin-scan",
});

const QA = [
  { q: "Is the scan really free?", a: "Yes. The NEA Skin Health Report is complimentary. There is no obligation to buy anything." },
  { q: "What if my skin is healthy?", a: "Then we will tell you, and suggest a simple routine to keep it that way. Recommendations always match what the scan shows." },
  { q: "How long does it take?", a: "Plan for about 20 minutes: a short questionnaire, a five-minute contact-free scan, and time to walk through your images and report." },
  { q: "Should I wear makeup?", a: "Come with a clean face if you can. If not, we will give you a gentle cleanser before the scan." },
  { q: "Do I get a copy?", a: "Yes. We text or email your report with your two or three priorities, and you can come back for a free re-scan in 90 days if you start products or treatment." },
];

export default function SkinScanPage() {
  const offer = getOffer("skin-scan")!;
  return (
    <>
      <JsonLd data={faqSchema(QA)} />
      <PageHero trail={[{ name: "Free Skin Health Report", path: "/skin-scan" }]} title="The NEA Skin Health Report." lede={`${offer.value}, complimentary this month. ${offer.spots}.`} />
      <section className="pb-24">
        <div className="container">
          <ScanOffer />
        </div>
      </section>
      <section className="chapter bg-white">
        <div className="container">
          <SectionHead title="What happens at your scan." />
          <ol className="grid gap-4 md:grid-cols-5">
            {offer.steps.map((s, i) => (
              <li key={s.title} className="rounded-4xl bg-porcelain p-6">
                <span className="font-display text-sm text-flora">{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">{s.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 rounded-4xl bg-flora-soft p-8">
            <p className="font-display text-lg font-semibold">Your report gives you a three-level plan</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {offer.leadsTo.map((l) => (
                <li key={l} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-flora" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="chapter" id="book">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-display-md font-semibold">Reserve your spot.</h2>
            <p className="measure mt-5 text-lede text-graphite">Tell us a little about you so the right aesthetician prepares for your scan. We confirm within one business day.</p>
            <Accordion className="mt-10" items={QA.map((x) => ({ title: x.q, content: <p className="leading-relaxed text-graphite">{x.a}</p> }))} />
          </div>
          <ShineBorder radius={36} className="h-fit bg-white p-6 md:p-10">
            <LeadForm kind="skin-scan" source="skin-scan-page" />
          </ShineBorder>
        </div>
      </section>
    </>
  );
}
