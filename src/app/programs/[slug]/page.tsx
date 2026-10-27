import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { ShineBorder } from "@/components/ui/shine-border";
import { SectionHead } from "@/components/sections/page-hero";
import { JsonLd, breadcrumbSchema, pageMeta, procedureSchema } from "@/lib/seo";
import { getProgram, programs } from "@/content/programs";
import { getTest } from "@/content/tests";
import { getTreatment } from "@/content/treatments";
import { site } from "@/lib/site";
import { money, nea } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const p = getProgram((await params).slug);
  if (!p) return {};
  return pageMeta({ title: `${p.name}: ${p.problem} treatment in Calgary`, description: `${p.headline} ${p.summary}`, path: `/programs/${p.slug}`, image: nea(p.image) });
}

export default async function ProgramPage({ params }: Props) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  const tests = p.tests.map(getTest).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const tx = p.treatments.map(getTreatment).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <JsonLd data={[procedureSchema({ name: p.name, description: p.summary, path: `/programs/${p.slug}`, image: nea(p.image) }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Programs", path: "/programs" }, { name: p.name, path: `/programs/${p.slug}` }])]} />
      <section className="chapter-dark relative overflow-hidden">
        <NeaImage src={p.image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/60 to-abyss/20" />
        <div className="container relative flex min-h-[78vh] flex-col justify-end pb-20 pt-40">
          <Link href="/programs" className="mb-6 text-[14px] text-white/60 hover:text-white">
            All programs
          </Link>
          <p className="text-[15px] text-white/70">{p.problem}</p>
          <h1 className="mt-2 max-w-4xl text-display-xl font-semibold">{p.headline}</h1>
          <p className="measure mt-6 text-lede text-white/75">{p.summary}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-light">
              Book this program
            </a>
            <Link href="/skin-scan" className="btn border border-white/25 text-white hover:bg-white/10">
              Start with a free scan
            </Link>
            <span className="text-[15px] text-white/70">
              From <strong className="text-white">{money(p.priceFrom)}</strong> · {p.duration}
            </span>
          </div>
        </div>
      </section>

      <section className="chapter">
        <div className="container grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md font-semibold">Who it is for.</h2>
            <p className="measure mt-5 text-lede text-graphite">{p.forWho}</p>
          </div>
          <div>
            <h2 className="text-display-md font-semibold">What we look for.</h2>
            <ul className="mt-6 space-y-3">
              {p.rootCauses.map((c) => (
                <li key={c} className="flex gap-3 text-[17px]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flora" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="chapter bg-white">
        <div className="container">
          <SectionHead title="How the program runs." lede="The NEA Method, step by step." />
          <ol className="grid gap-4 md:grid-cols-4">
            {p.phases.map((ph, i) => (
              <li key={ph.name} className="rounded-4xl bg-porcelain p-7">
                <span className="font-display text-sm tabular-nums text-flora">{i + 1}</span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{ph.name}</h3>
                <p className="mt-3 leading-relaxed text-graphite">{ph.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="chapter">
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-display-md font-semibold">What is included.</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {p.includes.map((it) => (
                <li key={it} className="flex gap-3 rounded-2xl bg-white p-4 text-[15px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <ShineBorder radius={36} className="h-fit bg-ink p-8 text-white md:p-10">
            <p className="text-white/60">{p.name}</p>
            <p className="mt-2 font-display text-5xl font-semibold">{money(p.priceFrom)}</p>
            <p className="mt-1 text-white/60">starting price · {p.duration}</p>
            <ul className="mt-8 space-y-2 text-[15px] text-white/80">
              <li>Free Skin Health Report before you commit</li>
              <li>Monthly payment plans available</li>
              <li>Registered Dietitian visits may be covered by your benefits</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-light">
                Book online
              </a>
              <Link href="/book" className="btn border border-white/20 hover:bg-white/10">
                Ask a question first
              </Link>
            </div>
            <p className="mt-6 text-[12px] text-white/45">Indicative starting price, confirmed after your assessment. Results vary from person to person.</p>
          </ShineBorder>
        </div>
      </section>

      {tests.length > 0 && (
        <section className="chapter chapter-dark">
          <div className="container">
            <SectionHead dark title="Tests that can be part of your plan." lede="Only the ones your assessment says will change the plan. Fulfilled by BioAro Labs." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tests.map((t) => (
                <Link key={t.slug} href={`/tests#${t.slug}`} className="glass-dark rounded-3xl p-6 transition hover:bg-white/10">
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/65">{t.neaUse}</p>
                  <p className="mt-4 text-[14px] text-white/50">{money(t.price)} list price</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="chapter">
        <div className="container">
          <SectionHead title="Treatments inside this program." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tx.map((t) => (
              <Link key={t.slug} href={`/treatments/${t.slug}`} className="group flex gap-4 rounded-3xl bg-white p-4 transition hover:shadow-[0_20px_50px_-30px_rgba(21,25,28,0.35)]">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  <NeaImage src={t.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-tight group-hover:underline">{t.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-graphite">{t.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
