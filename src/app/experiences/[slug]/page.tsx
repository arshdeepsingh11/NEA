import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { LeadForm } from "@/components/sections/lead-form";
import { getOffer, offers } from "@/content/offers";
import { pageMeta } from "@/lib/seo";
import { nea } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return offers.filter((o) => o.slug !== "skin-scan").map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props) {
  const o = getOffer((await params).slug);
  if (!o) return {};
  return pageMeta({ title: `${o.name} at NEA Precision Skin`, description: `${o.headline} ${o.summary}`, path: `/experiences/${o.slug}`, image: nea(o.image) });
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  if (slug === "skin-scan") redirect("/skin-scan");
  const o = getOffer(slug);
  if (!o) notFound();
  const others = offers.filter((x) => x.slug !== o.slug).slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+48px)]">
        <div className="container grid items-end gap-12 pb-20 lg:grid-cols-2">
          <div>
            <p className="text-[15px] text-flora">{o.kicker}</p>
            <h1 className="mt-3 text-display-lg font-semibold">{o.name}</h1>
            <p className="mt-5 font-display text-2xl font-medium leading-snug tracking-tight">{o.headline}</p>
            <p className="measure mt-5 text-lede text-graphite">{o.summary}</p>
            <p className="mt-6 text-[14px] text-graphite">Best for: {o.audience}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-5xl bg-mist">
            <NeaImage src={o.image} alt={o.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-display-md font-semibold">How it works.</h2>
            <ol className="mt-8 space-y-4">
              {o.steps.map((s, i) => (
                <li key={s.title} className="flex gap-5 rounded-3xl bg-porcelain p-6">
                  <span className="font-display text-sm tabular-nums text-flora">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1 leading-relaxed text-graphite">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <h3 className="mt-12 font-display text-lg font-semibold">Where it can lead</h3>
            <ul className="mt-4 space-y-2">
              {o.leadsTo.map((l) => (
                <li key={l} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-flora" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-fit rounded-5xl bg-porcelain p-6 md:p-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">{o.slug === "mens-skin-check" ? "Bring a skin check day to your barbershop" : "Reserve your spot"}</h2>
            <LeadForm kind={o.slug === "mens-skin-check" ? "partner" : "experience"} source={o.slug} />
          </div>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <h2 className="mb-10 text-display-md font-semibold">More ways to start.</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {others.map((x) => (
              <Link key={x.slug} href={x.slug === "skin-scan" ? "/skin-scan" : `/experiences/${x.slug}`} className="group rounded-4xl surface p-7">
                <p className="text-[13px] text-flora">{x.kicker}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight group-hover:underline">{x.name}</h3>
                <p className="mt-2 text-[15px] text-graphite">{x.headline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
