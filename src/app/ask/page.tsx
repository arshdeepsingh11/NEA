import { Suspense } from "react";
import { AskNea } from "@/components/sections/ask-nea";
import { LazySignal } from "@/components/three/lazy";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Ask NEA", description: "Ask about treatments, tests, prices, hours and your visit. Answers come from NEA Precision Skin’s own information.", path: "/ask" });

export default function AskPage() {
  return (
    <section className="chapter-dark relative min-h-screen overflow-hidden pb-40 pt-[calc(var(--header-h)+64px)]">
      <LazySignal className="pointer-events-none absolute inset-0 opacity-40" lines={90} />
      <div className="container relative">
        <h1 className="mx-auto max-w-3xl text-center text-display-lg font-semibold">Ask NEA anything.</h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-lede text-white/65">Treatments, tests, prices, preparation, hours. Every answer links to the page it came from.</p>
        <div className="mt-14">
          <Suspense>
            <AskNea />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
