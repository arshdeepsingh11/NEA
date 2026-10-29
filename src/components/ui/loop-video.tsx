"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A silent, looping background video: plays only while on screen, and stays on its poster frame
 * for visitors who prefer reduced motion or are saving data.
 */
export function LoopVideo({ src, poster, className, label }: { src: string; poster: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (still) return void v.pause();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.05 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" aria-label={label} aria-hidden={label ? undefined : true} className={cn("object-cover", className)} />;
}
