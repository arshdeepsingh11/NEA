import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { NeaImage } from "@/components/ui/nea-image";
import { posts } from "@/content/blog";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const metadata = pageMeta({ title: "Journal: skin, nutrition and longevity", description: "Monthly skincare tips, the truth about Botox, acne scars, the gut microbiome and IBS, gift guides and more from the NEA team.", path: "/blog" });

export default function BlogPage() {
  const [first, ...rest] = posts;
  return (
    <>
      <PageHero trail={[{ name: "Journal", path: "/blog" }]} title="Learn and grow in brilliance." lede="Radiant skin is more than beauty. It is a commitment to the science of self-care. Here we unravel medical skincare and the place where health and beauty meet." />
      <section className="pb-28">
        <div className="container">
          {first && (
            <Link href={`/blog/${first.slug}`} className="group mb-16 grid overflow-hidden rounded-5xl bg-white lg:grid-cols-2">
              <div className="relative min-h-[280px] bg-mist">
                {first.image && <NeaImage src={first.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="text-[13px] text-graphite">{formatDate(first.date)}</p>
                <h2 className="mt-2 text-display-md font-semibold group-hover:underline">{first.title}</h2>
                <p className="mt-4 text-lede text-graphite">{first.description}</p>
              </div>
            </Link>
          )}
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
                  {p.image && <NeaImage src={p.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-spring group-hover:scale-105" />}
                </div>
                <p className="mt-4 text-[13px] text-graphite">{formatDate(p.date)}</p>
                <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight group-hover:underline">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-[15px] text-graphite">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
