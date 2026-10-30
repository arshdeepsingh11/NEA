import { Check } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ScanOffer } from "@/components/sections/scan-offer";
import { ScanImager } from "@/components/sections/scan-imager";
import { LeadForm } from "@/components/sections/lead-form";
import { ShineBorder } from "@/components/ui/shine-border";
import { Accordion } from "@/components/sections/accordion";
import { getOffer } from "@/content/offers";
import { JsonLd, faqSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Free NEA Skin Health Report — advanced skin scan in Calgary",
  description: "A free AI skin scan in Calgary: 8 kinds of light and a 36MP camera show hidden sun damage, pigment, pores, wrinkles, redness and hydration in 15 seconds, graded on 14+ measures. 20 spots each week.",
  path: "/skin-scan",
});

const QA = [
  { q: "Is the scan really free?", a: "Yes. The NEA Skin Health Report is complimentary. There is no obligation to buy anything." },
  { q: "What if my skin is healthy?", a: "Then we will tell you, and suggest a simple routine to keep it that way. Recommendations always match what the scan shows." },
  { q: "How long does it take?", a: "Plan for about 20 minutes: a short questionnaire, a 15-second contact-free scan, and time to walk through your images and report." },
  { q: "Should I wear makeup?", a: "Come with a clean face if you can. If not, we will give you a gentle cleanser before the scan." },
  { q: "What machine do you use?", a: "An AI skin imager from Bitmoji-tek. It photographs your face in 8 kinds of light (including UV, polarized and Wood’s light) with a 36-megapixel camera, and its AI grades 14+ things about your skin, from pores and wrinkles to hidden sun damage and redness." },
  { q: "Is the light safe?", a: "Yes. The flashes are brief and gentle, nothing touches your skin and nothing heats it. If flashing light bothers you, tell us before the scan." },
  { q: "Do I get a copy?", a: "Yes. Scan the QR code and your report is on your phone, and we text or email your two or three priorities, and you can come back for a free re-scan in 90 days if you start products or treatment." },
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
      <ScanImager />
      <section className="pb-20">
        <div className="container">
          <div className="rounded-4xl bg-flora-soft p-8">
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
          <ShineBorder radius={36} className="h-fit surface p-6 md:p-10">
            <LeadForm kind="skin-scan" source="skin-scan-page" />
          </ShineBorder>
        </div>
      </section>
    </>
  );
}
