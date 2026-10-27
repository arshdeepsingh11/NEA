"use client";
import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nea, cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export type SphereCard = { src: string; alt: string; caption?: string };

/**
 * Scroll Rotate Gallery — cards sit on the surface of a 3D sphere.
 * As you scroll, the cards fan out from the core to the sphere surface
 * and the whole sphere rotates in full 3D space.
 */
export function ScrollSphereGallery({ cards, className, children }: { cards: SphereCard[]; className?: string; children?: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const sphere = useRef<HTMLDivElement>(null);

  // Even distribution on a sphere (Fibonacci lattice) → longitude/latitude per card.
  const points = useMemo(() => {
    const n = cards.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return cards.map((_, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const lat = Math.asin(Math.max(-1, Math.min(1, y * 0.86))) * (180 / Math.PI);
      const lon = ((i * golden) * (180 / Math.PI)) % 360;
      return { lat, lon };
    });
  }, [cards]);

  useEffect(() => {
    const el = section.current;
    const sp = sphere.current;
    if (!el || !sp) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      sp.style.setProperty("--r", "1");
      return;
    }
    const ctx = gsap.context(() => {
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 1.1 },
        onUpdate: () => {
          const p = state.p;
          const spread = Math.min(1, p / 0.28);
          const eased = 1 - Math.pow(1 - spread, 3);
          sp.style.setProperty("--r", String(0.12 + eased * 0.88));
          sp.style.transform = `translateZ(-200px) rotateX(${-12 + p * 24}deg) rotateY(${p * 300}deg)`;
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className={cn("relative h-[340vh]", className)}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {children && <div className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 text-center">{children}</div>}
        <div className="relative h-full w-full [perspective:1400px]">
          <div
            ref={sphere}
            className="absolute left-1/2 top-[58%] h-0 w-0 preserve-3d will-change-transform"
            style={{ "--r": "0.12", "--R": "min(30vw, 330px)" } as CSSProperties}
          >
            {cards.map((c, i) => {
              const { lat, lon } = points[i];
              return (
                <figure
                  key={i}
                  className="absolute -left-[78px] -top-[100px] h-[200px] w-[156px] overflow-hidden rounded-2xl bg-mist shadow-[0_20px_40px_-18px_rgba(0,0,0,0.5)] backface-hidden sm:-left-[92px] sm:-top-[118px] sm:h-[236px] sm:w-[184px]"
                  style={{ transform: `rotateY(${lon}deg) rotateX(${lat}deg) translateZ(calc(var(--R) * var(--r)))` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nea(c.src)} alt={c.alt} loading="lazy" className="h-full w-full object-cover" />
                  {c.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-[12px] font-medium text-white">{c.caption}</figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
