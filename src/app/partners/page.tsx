import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/sections/lead-form";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Partner with NEA: gyms, studios, barbershops, planners and employers",
  description: "Refer your members to a Skin Health Report or Body Truth Scan and earn a commission on every program or membership they start.",
  path: "/partners",
});

const WHO = [
  { t: "Gyms and fitness studios", d: "Your members already care about results. Offer them a Body Truth Scan (DEXA) and truSculpt flex." },
  { t: "Yoga and pilates studios", d: "Gut, skin and stress are connected. Host a talk or skin-check day for your community." },
  { t: "Barbershops and salons", d: "Men’s skin check days in your chair, with a referral card to NEA." },
  { t: "Wedding planners and vendors", d: "The Bridal Glow Countdown for couples and families, booked 6–12 months ahead." },
  { t: "Clinics and practitioners", d: "Refer clients for microbiome testing or dietitian care; we send progress updates back." },
  { t: "Employers", d: "Skin and gut health days for your team, with dietitian visits that benefits often cover." },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Partners", path: "/partners" }]}
        title="Send us people who care about their health. Earn on every program."
        lede="NEA partners refer members to a free Skin Health Report or a Body Truth Scan. When a referral starts a program or membership, you earn a commission."
      />
      <section className="pb-12">
        <div className="container">
          <SectionHead title="Who we partner with." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WHO.map((w) => (
              <div key={w.t} className="rounded-4xl bg-white p-7">
                <h3 className="text-lg font-semibold tracking-tight">{w.t}</h3>
                <p className="mt-2 leading-relaxed text-graphite">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md font-semibold">How it works.</h2>
            <ol className="mt-8 space-y-5">
              {["Apply below. We set up your unique referral link and printed cards.", "Your members book a free scan with your link.", "When a referral starts a program or membership, your commission is tracked automatically.", "You get a monthly statement and payout."].map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="font-display text-sm text-flora">{i + 1}</span>
                  <p className="text-[17px]">{s}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-5xl bg-white p-6 md:p-10">
            <LeadForm kind="partner" source="partners-page" />
          </div>
        </div>
      </section>
    </>
  );
}
