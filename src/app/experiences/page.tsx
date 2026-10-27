import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { NeaImage } from "@/components/ui/nea-image";
import { offers } from "@/content/offers";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Ways to start at NEA", description: "Free Skin Health Report, Body Truth Scan, Bring Your Bag audit, Calgary Skin Program, Bridal Glow Countdown and Men’s Skin Check.", path: "/experiences" });

export default function ExperiencesPage() {
  return (
    <>
      <PageHero trail={[{ name: "Ways to start", path: "/experiences" }]} title="Six easy ways to start." lede="Each one shows you something real about your skin or body first. The plan comes after, and only if it helps." />
      <section className="pb-28">
        <div className="container grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <Link key={o.slug} href={o.slug === "skin-scan" ? "/skin-scan" : `/experiences/${o.slug}`} className="group overflow-hidden rounded-4xl bg-white">
              <div className="relative aspect-[16/10] bg-mist">
                <NeaImage src={o.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-spring group-hover:scale-105" />
              </div>
              <div className="p-7">
                <p className="text-[13px] text-flora">{o.kicker}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">{o.name}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">{o.headline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
