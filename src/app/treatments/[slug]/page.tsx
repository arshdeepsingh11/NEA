import Link from "next/link";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { bodyRegions, faceZones } from "@/content/body";
import { notFound } from "next/navigation";
import { NeaImage } from "@/components/ui/nea-image";
import { Blocks } from "@/components/sections/blocks";
import { PageHero } from "@/components/sections/page-hero";
import { Accordion } from "@/components/sections/accordion";
import { JsonLd, pageMeta, procedureSchema } from "@/lib/seo";
import { categories, getTreatment, treatments } from "@/content/treatments";
import { getProgram } from "@/content/programs";
import { site } from "@/lib/site";
import { nea } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return treatments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const t = getTreatment((await params).slug);
  if (!t) return {};
  return pageMeta({ title: `${t.title} in Calgary`, description: t.summary + " " + (t.intro[0]?.slice(0, 120) ?? ""), path: `/treatments/${t.slug}`, image: nea(t.image) });
}

export default async function TreatmentPage({ params }: Props) {
  const t = getTreatment((await params).slug);
  if (!t) notFound();
  const cat = categories.find((c) => c.id === t.category);
  const program = t.program ? getProgram(t.program) : undefined;
  const related = treatments.filter((x) => x.category === t.category && x.slug !== t.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={procedureSchema({ name: t.title, description: t.summary, path: `/treatments/${t.slug}`, image: nea(t.image) })} />
      <PageHero
        trail={[
          { name: "Treatments", path: "/treatments" },
          { name: t.title, path: `/treatments/${t.slug}` },
        ]}
        title={t.title}
        lede={t.summary}
      >
        <div className="flex flex-wrap gap-3">
          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Book {t.title.split(" (")[0]}
          </a>
          <Link href="/skin-scan" className="btn-ghost">
            Not sure? Get a free scan
          </Link>
        </div>
        <div className="mt-6">
          <AiQuestionChips context={t.title} questions={[`Is ${t.title.split(" (")[0]} right for me?`, "How many sessions will I need?", "What is the downtime?"]} />
        </div>
        {(() => {
          const where = [...bodyRegions.map((r) => ({ r, face: false })), ...faceZones.map((r) => ({ r, face: true }))].filter(({ r }) => r.treatments.includes(t.slug));
          return where.length ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-graphite">
              Works on:
              {where.map(({ r, face }) => (
                <Link key={r.id} href={`/body?${face ? "mode=face&" : ""}focus=${r.id}`} className="chip hover:text-ink">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />
                  {r.name}
                </Link>
              ))}
            </div>
          ) : null;
        })()}
      </PageHero>
      <section className="pb-24">
        <div className="container grid gap-14 lg:grid-cols-[1.3fr_0.7fr]">
          <article>
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-4xl bg-mist">
              <NeaImage src={t.image} alt={t.title} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
            </div>
            <div className="prose-nea measure">
              {t.intro.map((p, i) => (
                <p key={i} className={i === 0 ? "!text-lg !text-ink" : undefined}>
                  {p}
                </p>
              ))}
              {t.list.length > 0 && (
                <ul>
                  {t.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
              {t.more.map((m, i) => (
                <Blocks key={i} blocks={m} />
              ))}
            </div>
            {t.subs.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-6 text-2xl font-semibold tracking-tight">Options at NEA</h2>
                <Accordion items={t.subs.map((s) => ({ title: s.title, content: <Blocks blocks={s.body} /> }))} defaultOpen={0} />
              </div>
            )}
            <p className="mt-12 text-[13px] leading-relaxed text-graphite">
              Every treatment starts with a consultation. Your practitioner confirms it is right for you and gives pre- and post-care instructions. Results vary from person to person.
            </p>
          </article>
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:h-fit">
            {program && (
              <Link href={`/programs/${program.slug}`} className="block rounded-4xl surface-strong p-7 text-ink">
                <p className="text-[13px] text-graphite">Part of</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{program.name}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-graphite">{program.headline}</p>
                <span className="mt-5 inline-block text-[14px] underline underline-offset-4">See the full program</span>
              </Link>
            )}
            <div className="rounded-4xl surface p-7">
              <p className="font-semibold">Good to know</p>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div>
                  <dt className="text-graphite">Category</dt>
                  <dd>{cat?.label}</dd>
                </div>
                <div>
                  <dt className="text-graphite">Helps with</dt>
                  <dd className="capitalize">{t.concerns.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-graphite">First step</dt>
                  <dd>Free 15-minute consultation</dd>
                </div>
              </dl>
              <a href={site.phoneHref} className="btn-ghost mt-6 w-full">
                Call {site.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="chapter">
          <div className="container">
            <h2 className="mb-10 text-display-md font-semibold">Related treatments.</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/treatments/${r.slug}`} className="group rounded-4xl bg-porcelain p-7">
                  <h3 className="text-xl font-semibold tracking-tight group-hover:underline">{r.title}</h3>
                  <p className="mt-2 text-[15px] text-graphite">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
