import { Check, Minus } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ShineBorder } from "@/components/ui/shine-border";
import { LeadForm } from "@/components/sections/lead-form";
import { memberships, membershipMatrix } from "@/content/offers";
import { pageMeta } from "@/lib/seo";
import { cn, money } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Membership: Glow, Glow Plus and Glow Elite",
  description: "Monthly skin care with quarterly re-scans, dietitian check-ins and yearly microbiome and DEXA re-tests. Keep the results you worked for.",
  path: "/membership",
});

export default function MembershipPage() {
  return (
    <>
      <PageHero trail={[{ name: "Membership", path: "/membership" }]} title="Keep the results you worked for." lede="Skin changes with seasons, stress and age. A membership keeps you consistent, and quarterly re-scans show that it is working." />
      <section className="pb-20">
        <div className="container grid gap-5 lg:grid-cols-3">
          {memberships.map((m) => {
            const inner = (
              <div className={cn("flex h-full flex-col rounded-[30px] p-8", "popular" in m && m.popular ? "surface-strong text-white" : "surface")}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">{m.name}</h2>
                  {"popular" in m && m.popular && <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">Most chosen</span>}
                </div>
                <p className={cn("mt-2", "popular" in m && m.popular ? "text-white/65" : "text-graphite")}>{m.blurb}</p>
                <p className="mt-8">
                  <span className="font-display text-5xl font-semibold">{money(m.price)}</span>
                  <span className={cn("ml-1", "popular" in m && m.popular ? "text-white/60" : "text-graphite")}>/ month</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-[15px]">
                  {m.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#join" className={cn("mt-10", "popular" in m && m.popular ? "btn-light" : "btn-primary")}>
                  Join {m.name}
                </a>
              </div>
            );
            return "popular" in m && m.popular ? (
              <ShineBorder key={m.id} radius={32} className="p-[2px]">
                {inner}
              </ShineBorder>
            ) : (
              <div key={m.id}>{inner}</div>
            );
          })}
        </div>
        <p className="container mt-6 text-[13px] text-graphite">Founding member pricing shown is indicative and confirmed when you join.</p>
      </section>
      <section className="chapter">
        <div className="container overflow-x-auto">
          <h2 className="mb-10 text-display-md font-semibold">Compare memberships.</h2>
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="pb-4 font-normal text-graphite">Benefit</th>
                {memberships.map((m) => (
                  <th key={m.id} className="pb-4 font-display text-lg font-semibold">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membershipMatrix.map((row) => (
                <tr key={row.label} className="border-b border-ink/[0.06]">
                  <td className="py-4 text-graphite">{row.label}</td>
                  {row.tiers.map((v, i) => (
                    <td key={i} className="py-4">
                      {v === true ? <Check className="h-4 w-4 text-flora" aria-label="Included" /> : v === false ? <Minus className="h-4 w-4 text-ink/25" aria-label="Not included" /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="chapter" id="join">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md font-semibold">Become a founding member.</h2>
            <p className="measure mt-5 text-lede text-graphite">Tell us which membership interests you. We will confirm pricing, answer questions and set up your first visit.</p>
          </div>
          <div className="rounded-5xl surface p-6 md:p-10">
            <LeadForm kind="consultation" source="membership" />
          </div>
        </div>
      </section>
    </>
  );
}
