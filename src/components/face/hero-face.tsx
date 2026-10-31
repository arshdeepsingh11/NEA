"use client";
import { Camera } from "lucide-react";
import { ParticleFace } from "./particle-face";
import { openMirror } from "./open-mirror";
import { cn } from "@/lib/utils";

/**
 * Home hero visual: a face made of light inside NEA's arch. It breathes, turns and maps the face zones one by one.
 * "Try it on your face" opens the AR mirror, where the same map appears on the visitor's own face.
 */
export function HeroFace({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="absolute -inset-10 rounded-full opacity-80 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--glow-a), transparent)" }} />
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px]">
        <div className="relative h-full w-full overflow-hidden rounded-b-[44px] rounded-t-[999px] border border-white/60 shadow-[0_40px_120px_-50px_rgba(var(--shadow-tint),0.7)]" style={{ background: "radial-gradient(120% 80% at 50% 35%, #3a2629 0%, #1d1416 55%, #120c0e 100%)" }}>
          <div aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(243,217,164,0.35) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "radial-gradient(70% 60% at 50% 45%, black, transparent)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 45%, black, transparent)" }} />
          <div className="absolute inset-x-0 bottom-16 top-10">
            <ParticleFace onZone={(z) => openMirror(z)} />
          </div>
          {["left-6 top-24 border-l border-t", "right-6 top-24 border-r border-t", "bottom-6 left-6 border-b border-l", "bottom-6 right-6 border-b border-r"].map((c) => (
            <span key={c} aria-hidden className={cn("pointer-events-none absolute h-7 w-7 rounded-[3px] border-white/50", c)} />
          ))}
          <button onClick={() => openMirror()} className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#f3d9a4] px-5 py-3 text-[14.5px] font-semibold text-ink shadow-[0_12px_40px_-10px_rgba(243,217,164,0.7)] transition hover:bg-[#f6e3c0] active:scale-[0.97]">
            <Camera className="h-4 w-4" /> Try it on your face
          </button>
        </div>
      </div>
    </div>
  );
}
