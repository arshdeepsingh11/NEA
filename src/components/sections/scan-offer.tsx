import Link from "next/link";
import { Droplets, Eye, Flame, Grid3x3, Sun, Waves } from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";
import { ShineBorder } from "@/components/ui/shine-border";
import { getOffer } from "@/content/offers";

const LAYERS = [
  { icon: <Sun className="h-4 w-4" />, title: "UV damage", detail: "Sun damage below the surface, years before it shows" },
  { icon: <Eye className="h-4 w-4" />, title: "Hidden pigmentation", detail: "Spots and melasma forming under the skin" },
  { icon: <Grid3x3 className="h-4 w-4" />, title: "Pores & texture", detail: "Size, depth and smoothness, mapped across the face" },
  { icon: <Flame className="h-4 w-4" />, title: "Redness", detail: "Sensitivity, rosacea and visible capillaries" },
  { icon: <Droplets className="h-4 w-4" />, title: "Hydration", detail: "How well your barrier holds moisture in dry Calgary air" },
  { icon: <Waves className="h-4 w-4" />, title: "Lines & firmness", detail: "Fine lines and early laxity" },
];

export function ScanOffer() {
  const offer = getOffer("skin-scan")!;
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div>
        <h2 className="text-display-md font-semibold">{offer.headline}</h2>
        <p className="measure mt-5 text-lede text-graphite">{offer.summary}</p>
        <dl className="mt-8 grid max-w-md grid-cols-2 gap-6">
          <div>
            <dt className="text-[13px] text-graphite">Value</dt>
            <dd className="mt-1 font-display text-2xl font-semibold">$150, free</dd>
          </div>
          <div>
            <dt className="text-[13px] text-graphite">Availability</dt>
            <dd className="mt-1 font-display text-2xl font-semibold">20 a week</dd>
          </div>
        </dl>
        <p className="measure mt-6 text-[15px] leading-relaxed text-graphite">
          If your skin is healthy, we will tell you, and give you a simple routine to keep it that way. If you start products or treatment, your 90-day re-scan is free.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/skin-scan" className="btn-primary">
            Book my Skin Health Report
          </Link>
          <Link href="/experiences/bring-your-bag" className="btn-ghost">
            Bring your products too
          </Link>
        </div>
      </div>
      <ShineBorder radius={36} className="surface p-3 shadow-[0_40px_90px_-50px_rgba(21,25,28,0.5)]">
        <div className="rounded-[28px] bg-porcelain p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-display text-lg font-semibold">What the scan maps</p>
            <span className="rounded-full bg-flora-soft px-3 py-1 text-[12px] text-flora">Live preview</span>
          </div>
          <AnimatedList className="h-[392px] overflow-hidden" delay={1100}>
            {LAYERS.map((l) => (
              <div key={l.title} className="flex items-center gap-4 rounded-2xl border border-ink/[0.06] surface p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl surface-strong text-white">{l.icon}</span>
                <div>
                  <p className="text-[15px] font-medium">{l.title}</p>
                  <p className="text-[13px] text-graphite">{l.detail}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
        </div>
      </ShineBorder>
    </div>
  );
}
