import Link from "next/link";
import { Check } from "lucide-react";
import { PageHero, SectionHead } from "@/components/sections/page-hero";
import { ProgramCard } from "@/components/sections/program-card";
import { SkinFinder } from "@/components/sections/skin-finder";
import { programs } from "@/content/programs";
import { pageMeta } from "@/lib/seo";
import { money } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Programs: Clear Skin, Even Tone, Hair Regrowth, Healthy Aging",
  description: "Four NEA programs built around one problem each, with tests, treatments, nutrition and progress scans included, and starting prices shown.",
  path: "/programs",
});

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Programs", path: "/programs" }]}
        title="Pick the problem. We bring everything else."
        lede="Customers do not buy PRP or an oxygen facial. They want clear skin, even tone, fuller hair or to age well. Every NEA treatment now sits inside one of these four programs."
      />
      <section className="pb-24">
        <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="Side by side." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-[15px]">
              <thead>
                <tr>
                  <th className="w-48 border-b border-ink/10 pb-4 font-normal text-graphite">&nbsp;</th>
                  {programs.map((p) => (
                    <th key={p.slug} className="border-b border-ink/10 pb-4 font-display text-lg font-semibold">
                      {p.name.replace(" Program", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "For", get: (p: (typeof programs)[number]) => p.problem },
                  { label: "Duration", get: (p: (typeof programs)[number]) => p.duration },
                  { label: "Starts from", get: (p: (typeof programs)[number]) => money(p.priceFrom) },
                  { label: "Key tests", get: (p: (typeof programs)[number]) => `${p.tests.length} included options` },
                  { label: "Progress scans", get: () => <Check className="h-4 w-4 text-flora" /> },
                  { label: "Dietitian plan", get: () => <Check className="h-4 w-4 text-flora" /> },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="border-b border-ink/[0.06] py-4 text-graphite">{row.label}</td>
                    {programs.map((p) => (
                      <td key={p.slug} className="border-b border-ink/[0.06] py-4">
                        {row.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[13px] text-graphite">Starting prices are indicative and confirmed at your consultation. Payment plans available.</p>
        </div>
      </section>
      <section className="chapter">
        <div className="container">
          <SectionHead title="Not sure which one?" />
          <SkinFinder />
          <p className="mt-12 text-graphite">
            Looking for the original wellness packages?{" "}
            <Link href="/packages" className="text-ink underline underline-offset-4">
              See all beauty and wellness packages
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
