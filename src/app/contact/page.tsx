import { PageHero } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/sections/lead-form";
import { ClinicMap } from "@/components/layout/clinic-map";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Contact and directions", description: `Call ${site.phone}, email ${site.email} or visit ${site.address.line1}, Calgary. Open Monday to Saturday 9 a.m. to 5 p.m.`, path: "/contact" });

export default function ContactPage() {
  return (
    <>
      <PageHero trail={[{ name: "Contact", path: "/contact" }]} title="Let your skin’s story unfold." lede="Questions, a consultation or directions. Reach the team however suits you, and we reply within one business day." />
      <section className="pb-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-4xl surface p-8">
              <h2 className="text-xl font-semibold tracking-tight">Call, text or email</h2>
              <ul className="mt-4 space-y-2 text-[17px]">
                <li>
                  <a href={site.phoneHref} className="hover:underline">
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a href={site.textHref} className="hover:underline">
                    Text {site.text}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="hover:underline">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
            <div className="rounded-4xl surface p-8">
              <h2 className="text-xl font-semibold tracking-tight">Location and hours</h2>
              <address className="mt-4 not-italic text-[17px]">
                {site.address.line1}
                <br />
                {site.address.city}, {site.address.region}
              </address>
              <dl className="mt-4 space-y-1 text-[15px] text-graphite">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6">
                    <dt>{h.days}</dt>
                    <dd>{"closed" in h && h.closed ? "Closed" : `${h.open} – ${h.close}`}</dd>
                  </div>
                ))}
              </dl>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`} target="_blank" rel="noreferrer" className="btn-ghost mt-6">
                Get directions
              </a>
            </div>
            <div className="h-[340px] overflow-hidden rounded-4xl bg-mist">
              <ClinicMap query={site.mapsQuery} />
            </div>
          </div>
          <div className="h-fit rounded-5xl surface p-6 md:p-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Send us a message</h2>
            <LeadForm kind="contact" source="contact-page" />
          </div>
        </div>
      </section>
    </>
  );
}
