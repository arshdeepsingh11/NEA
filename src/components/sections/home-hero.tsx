import Link from "next/link";
import { LazyPlanet } from "@/components/three/lazy";
import { MorphingText } from "@/components/ui/morphing-text";
import { site } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="chapter-dark relative isolate min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(47,125,109,0.28),transparent_55%),radial-gradient(ellipse_at_20%_90%,rgba(110,107,245,0.18),transparent_50%)]" />
      <LazyPlanet className="absolute inset-x-0 top-[var(--header-h)] h-[34%] md:inset-y-0 md:left-[36%] md:right-0 md:top-0 md:h-full" />
      <div className="container relative z-10 flex min-h-[100svh] flex-col justify-end pb-20 pt-[calc(var(--header-h)+40px)] md:justify-center md:pb-24">
        <div className="max-w-[40rem]">
          <h1 className="text-display-xl font-semibold">
            Healthy skin
            <br />
            starts inside.
          </h1>
          <div className="mt-6 h-[1.2em] text-[clamp(1.5rem,3vw,2.25rem)] font-display font-medium tracking-tight text-[#9fd3c1]">
            <MorphingText className="text-left" texts={["Clear skin.", "Even tone.", "Fuller hair.", "Ageless glow.", "Real results."]} />
          </div>
          <p className="mt-8 max-w-[34rem] text-lede text-white/70">
            We find the root cause with advanced skin scans and gut, skin and hormone testing, treat it with Fotona laser and medical-grade care, and show you the results in data.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/skin-scan" className="btn-light">
              Get your free Skin Health Report
            </Link>
            <Link href="/finder" className="btn border border-white/20 text-white hover:bg-white/10">
              Find my program
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-white/45">
            Open Monday to Saturday, 9 to 5, at {site.address.line1}, Calgary.
          </p>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-abyss/60" />
    </section>
  );
}
