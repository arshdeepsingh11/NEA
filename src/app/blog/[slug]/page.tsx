import Link from "next/link";
import { notFound } from "next/navigation";
import { NeaImage } from "@/components/ui/nea-image";
import { Blocks } from "@/components/sections/blocks";
import { getPost, posts } from "@/content/blog";
import { JsonLd, articleSchema, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.description, path: `/blog/${p.slug}`, image: p.image });
}

export default async function PostPage({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const idx = posts.findIndex((x) => x.slug === p.slug);
  const next = posts[idx + 1] ?? posts[0];
  return (
    <>
      <JsonLd data={[articleSchema({ title: p.title, description: p.description, path: `/blog/${p.slug}`, image: p.image, date: p.date }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Journal", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }])]} />
      <article className="pb-24 pt-[calc(var(--header-h)+56px)]">
        <header className="container max-w-3xl">
          <Link href="/blog" className="text-[14px] text-graphite hover:text-ink">
            Journal
          </Link>
          <h1 className="mt-4 text-display-lg font-semibold">{p.title}</h1>
          <p className="mt-5 text-lede text-graphite">{p.description}</p>
          <p className="mt-5 text-[14px] text-graphite">
            {formatDate(p.date)} · {site.name}
          </p>
        </header>
        {p.image && (
          <div className="container mt-12 max-w-5xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-5xl bg-mist">
              <NeaImage src={p.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container mt-14 max-w-3xl text-[17px]">
          <Blocks blocks={p.blocks} />
          <div className="mt-16 rounded-4xl surface p-8">
            <p className="font-display text-xl font-semibold">Questions about your skin?</p>
            <p className="mt-2 text-graphite">Book a complimentary 15-minute consultation or a free Skin Health Report.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/skin-scan" className="btn-primary">
                Get my free scan
              </Link>
              <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                Book online
              </a>
            </div>
          </div>
          {next && next.slug !== p.slug && (
            <Link href={`/blog/${next.slug}`} className="group mt-12 block border-t border-ink/10 pt-8">
              <p className="text-[13px] text-graphite">Next article</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight group-hover:underline">{next.title}</p>
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
