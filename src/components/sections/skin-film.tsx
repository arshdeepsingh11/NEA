import Link from "next/link";
import { ArrowRight, ScanFace } from "lucide-react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { LoopVideo } from "@/components/ui/loop-video";

/** Home: the NEA skin film in a tall frame, beside what the scan actually measures. */
export function SkinFilmChapter() {
  const points = [
    ["Layer by layer", "Pores, pigment, redness, texture and lines, each measured, not guessed."],
    ["Inside and out", "Your gut, hormones and nutrition read alongside your skin."],
    ["Proof in numbers", "Re-scan and see the change, not just feel it."],
  ];
  return (
    <section className="chapter overflow-hidden">
      <div className="container grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-xl">
          <p className="eyebrow flex items-center gap-2">
            <ScanFace className="h-3.5 w-3.5 text-flora" /> Precision skin analysis
          </p>
          <h2 className="mt-5 font-display text-display-lg text-ink">
            See your skin the way <em className="aurora-text italic">we</em> do.
          </h2>
          <p className="measure mt-5 text-lede text-graphite">A 15-minute scan reads what the mirror can’t, then your NEA team turns it into a plan you can measure.</p>
          <ol className="mt-8 space-y-5">
            {points.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="tabular mt-0.5 font-display text-[1.4rem] leading-none text-ink/30">0{i + 1}</span>
                <span>
                  <span className="block text-[17px] font-medium text-ink">{t}</span>
                  <span className="block text-[15px] text-graphite">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/skin-scan" className="btn-light">
              Get my free Skin Health Report <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/skin-lens" className="btn-ghost">
              <NeaSiIcon className="h-4 w-4" /> Try Skin Lens on a selfie
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-[min(78vw,360px)] lg:w-[380px]">
          <div aria-hidden className="absolute -inset-10 -z-10 rounded-full opacity-60 blur-3xl" style={{ background: "var(--aurora)" }} />
          <div className="relative aspect-[9/16] overflow-hidden rounded-[44px] bg-ink shadow-[0_50px_120px_-50px_rgba(var(--shadow-tint),0.8)] ring-1 ring-ink/10">
            <LoopVideo src="/media/nea-hero.mp4" poster="/media/nea-hero.jpg" label="A face scanned by NEA's skin analysis" className="absolute inset-0 h-full w-full" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[11.5px] text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f3d9a4]" /> Scanning
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
