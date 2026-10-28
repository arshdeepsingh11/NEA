import { CalendarCheck, Phone, ScanFace } from "lucide-react";
import { JaneExplorer } from "@/components/booking/jane-explorer";
import { janeConsult, janeUrl } from "@/content/jane";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/sections/lead-form";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Book or request a free consultation",
  description: "Book online with NEA Precision Skin, or request a free 15-minute consultation and the right team member will call you.",
  path: "/book",
});

export default function BookPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Book", path: "/book" }]}
        title="Thinking about treatment? Start with a conversation."
        lede="Our free consultations are a dialogue, not a sales pitch. Your concerns and goals come first, and the plan follows from them."
      />
      <section className="pb-12">
        <div className="container grid gap-4 md:grid-cols-3">
          <a href={janeUrl(janeConsult)} target="_blank" rel="noreferrer" className="rounded-4xl surface-strong p-8 text-ink transition hover:brightness-110">
            <CalendarCheck className="h-6 w-6" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Book a consultation</h2>
            <p className="mt-2 text-graphite">30 minutes in Jane. We match you to the right plan. Or pick any service below.</p>
          </a>
          <Link href="/skin-scan" className="rounded-4xl surface p-8 transition hover:shadow-[0_20px_50px_-30px_rgb(var(--c-ink) / 0.35)]">
            <ScanFace className="h-6 w-6 text-flora" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Free Skin Health Report</h2>
            <p className="mt-2 text-graphite">Not sure what you need? See your skin first, then decide.</p>
          </Link>
          <a href={site.phoneHref} className="rounded-4xl surface p-8 transition hover:shadow-[0_20px_50px_-30px_rgb(var(--c-ink) / 0.35)]">
            <Phone className="h-6 w-6 text-flora" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Call {site.phone}</h2>
            <p className="mt-2 text-graphite">Monday to Saturday, 9 a.m. to 5 p.m.</p>
          </a>
        </div>
        <div className="container mt-10">
          <p className="eyebrow mb-4">Every service · live in Jane</p>
          <JaneExplorer />
        </div>
      </section>
      <section className="chapter" id="consult">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <h2 className="text-display-md font-semibold">Request a free consultation.</h2>
            <p className="measure mt-5 text-lede text-graphite">We offer free 15-minute consultations to answer any questions you may have. Tell us what it is about and we will connect you with the best person to call you back.</p>
            <ul className="mt-10 space-y-6">
              {[
                ["Personalized guidance", "Insight into your skin’s specific needs, guiding you to the most effective products and treatments."],
                ["Targeted solutions", "Discuss your concerns and goals with an expert and get solutions for your unique skin challenges."],
                ["Education and empowerment", "Learn your skin’s nuances so you can make informed choices for a healthier, more radiant complexion."],
              ].map(([t, d]) => (
                <li key={t}>
                  <h3 className="font-display text-lg font-semibold">{t}</h3>
                  <p className="mt-1 text-graphite">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-fit rounded-5xl surface p-6 md:p-10">
            <LeadForm kind="consultation" source="book-page" />
          </div>
        </div>
      </section>
    </>
  );
}
