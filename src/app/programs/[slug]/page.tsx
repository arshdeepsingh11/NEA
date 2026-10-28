import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import Link from "next/link";
import { BookButton } from "@/components/booking/booking";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, PersonStanding, ScanFace } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import { ShineBorder } from "@/components/ui/shine-border";
import { SectionHead } from "@/components/sections/page-hero";
import { AiPromptBar } from "@/components/ai/ai-prompt-bar";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { Radar } from "@/components/viz/radar";
import { ProgramJourney } from "@/components/sim/program-journey";
import { WeightBars } from "@/components/viz/weight-bars";
import { JsonLd, breadcrumbSchema, pageMeta, procedureSchema } from "@/lib/seo";
import { getProgram, programs } from "@/content/programs";
import { programInsights } from "@/content/program-insights";
import { getTest, testGroups } from "@/content/tests";
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
  const ins = programInsights[p.slug];
  const tests = p.tests.map(getTest).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const tx = p.treatments.map(getTreatment).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const groupLabel = Object.fromEntries(testGroups.map((g) => [g.id, g.label]));
  const first = ins?.metric.values[0];
  const last = ins?.metric.values[ins.metric.values.length - 1];

  return (
    <>
      <JsonLd data={[procedureSchema({ name: p.name, description: p.summary, path: `/programs/${p.slug}`, image: nea(p.image) }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Programs", path: "/programs" }, { name: p.name, path: `/programs/${p.slug}` }])]} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-10 pb-16 pt-28 md:pt-32 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
          <div>
            <Link href="/programs" className="chip transition hover:text-ink">
              ← All programs
            </Link>
            <p className="mt-6 text-[15px] text-flora">{p.problem}</p>
            <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.6rem,5vw,4.4rem)] font-semibold leading-[1] tracking-[-0.03em] text-ink">{p.headline}</h1>
            <p className="measure mt-6 text-lede text-graphite">{p.summary}</p>

            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["From", money(p.priceFrom)],
                ["Duration", p.duration],
                ["Tests", String(tests.length)],
              ].map(([k, v]) => (
                <div key={k} className="surface rounded-2xl px-4 py-3">
                  <dt className="stat-label">{k}</dt>
                  <dd className="tabular mt-1 font-display text-xl font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <AiPromptBar className="mt-8 max-w-xl" context={p.name} placeholder={`Ask about the ${p.name}…`} />

            <div className="mt-6 flex flex-wrap gap-3">
              <BookButton slug={p.slug} title={p.name}>Book this program</BookButton>
              <Link href="/skin-scan" className="btn-ghost">
                <ScanFace className="h-4 w-4" /> Start with a free scan
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="surface relative aspect-[4/5] overflow-hidden rounded-[36px]">
              <NeaImage src={p.image} alt={p.name} fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 grid gap-2">
                {p.rootCauses.slice(0, 3).map((c, i) => (
                  <div key={c} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/85 px-4 py-2.5 text-[13px] text-ink backdrop-blur-xl">
                    <span className="tabular text-flora">{String(i + 1).padStart(2, "0")}</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
            {ins && first !== undefined && last !== undefined && (
              <div className="absolute -left-4 top-8 hidden rounded-3xl border border-ink/10 bg-white/85 p-4 shadow-2xl backdrop-blur-xl md:block">
                <p className="stat-label">{ins.metric.name}</p>
                <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">
                  {first} <span className="text-graphite">→</span> <span className="aurora-text">{last}</span>
                </p>
                <p className="text-[11px] text-graphite">Illustrative goal over {p.duration}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What drives it */}
      {ins && (
        <section className="chapter">
          <div className="container">
            <SectionHead title="What is usually driving it." lede="Skin concerns rarely have one cause. These are the systems we check first, weighted by how often they matter for this concern." />
            <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
              <div className="surface rounded-[32px] p-7 md:p-9">
                <div className="mb-6 flex items-center justify-between">
                  <p className="font-display text-lg font-semibold text-ink">Contributing systems</p>
                  <Link href="/body" className="flex items-center gap-1.5 text-[13px] text-graphite hover:text-ink">
                    <PersonStanding className="h-4 w-4" /> See on 3D body
                  </Link>
                </div>
                <WeightBars items={ins.systems} />
                <p className="mt-6 text-[12px] text-graphite/80">Illustrative weighting. Your assessment decides what applies to you.</p>
              </div>
              <div className="surface rounded-[32px] p-7 md:p-9">
                <p className="font-display text-lg font-semibold text-ink">What your scan measures</p>
                <p className="mt-1 text-[13px] text-graphite">A typical starting profile and the goal we plan towards.</p>
                <Radar className="mx-auto mt-4 max-w-[380px]" axes={ins.radar.map((a) => ({ label: a.label, value: a.value, target: a.target }))} />
                <p className="mt-2 text-center text-[12px] text-graphite/80">Illustrative example, not a personal result.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trajectory + method */}
      <section className="chapter">
        <div className="container">
          <SectionHead title="How the program runs, and what we track." lede="The NEA Method: test, treat, track, maintain. Every checkpoint is a re-scan, so progress is measured, not guessed." />
          {ins ? (
            <ProgramJourney phases={p.phases} insight={ins} />
          ) : (
            <ol className="grid gap-4 md:grid-cols-4">
              {p.phases.map((ph, i) => (
                <li key={ph.name} className="surface rounded-[28px] p-7">
                  <span className="tabular font-display text-sm text-graphite">0{i + 1}</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{ph.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-graphite">{ph.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Who + included + price */}
      <section className="chapter">
        <div className="container grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="surface rounded-[32px] p-7 md:p-9">
            <p className="stat-label">Who it is for</p>
            <p className="mt-2 text-[18px] leading-relaxed text-ink">{p.forWho}</p>
            <p className="stat-label mt-8">What is included</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {p.includes.map((it) => (
                <li key={it} className="flex gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3.5 text-[14.5px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <ShineBorder radius={32} className="surface-strong h-fit p-8 text-ink md:p-10">
            <p className="text-graphite">{p.name}</p>
            <p className="tabular mt-2 font-display text-5xl font-semibold">{money(p.priceFrom)}</p>
            <p className="mt-1 text-graphite">starting price · {p.duration}</p>
            <ul className="mt-8 space-y-2.5 text-[15px] text-graphite">
              {["Free Skin Health Report before you commit", "Monthly payment plans available", "Registered Dietitian visits may be covered by your benefits"].map((x) => (
                <li key={x} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <BookButton slug={p.slug} title={p.name}>Book online</BookButton>
              <Link href="/book" className="btn-ghost">
                Ask a question first
              </Link>
            </div>
            <p className="mt-6 text-[12px] text-graphite/80">Indicative starting price, confirmed after your assessment. Results vary from person to person.</p>
          </ShineBorder>
        </div>
      </section>

      {/* Tests */}
      {tests.length > 0 && (
        <section className="chapter">
          <div className="container">
            <SectionHead title="Tests that can be part of your plan." lede="Only the ones your assessment says will change the plan. Fulfilled by BioAro Labs in CLIA-registered laboratories." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tests.map((t) => (
                <Link key={t.slug} href={`/tests#${t.slug}`} className="surface group flex flex-col rounded-[28px] p-6 transition hover:border-ink/20">
                  <div className="flex items-center justify-between">
                    <span className="chip !text-[11px]">{groupLabel[t.group]}</span>
                    <ArrowUpRight className="h-4 w-4 text-graphite transition group-hover:text-ink" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">{t.name}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-graphite">{t.neaUse}</p>
                  <div className="mt-6 flex items-baseline justify-between border-t border-ink/10 pt-4">
                    <span className="stat-label">List price</span>
                    <span className="tabular font-display text-lg font-semibold text-ink">{money(t.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Treatments */}
      <section className="chapter">
        <div className="container">
          <SectionHead title="Treatments inside this program." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tx.map((t) => (
              <Link key={t.slug} href={`/treatments/${t.slug}`} className="surface group flex gap-4 rounded-[28px] p-4 transition hover:border-ink/20">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  <NeaImage src={t.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight text-ink group-hover:underline">{t.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-graphite">{t.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      {ins && (
        <section className="pb-32 pt-4">
          <div className="container">
            <div className="aurora-border surface relative rounded-[32px] p-7 md:p-10">
              <p className="flex items-center gap-2 text-[13px] text-flora">
                <NeaSiIcon className="h-4 w-4" /> Nea SI · Skin Intelligence
              </p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">Questions people ask about the {p.name}</p>
              <div className="mt-6">
                <AiQuestionChips questions={ins.questions} context={p.name} />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
