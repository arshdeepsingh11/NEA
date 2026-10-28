"use client";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Phone } from "lucide-react";
import { useState } from "react";
import { NeaLogo } from "@/components/brand/nea-logo";
import { site } from "@/lib/site";

/**
 * Not a navbar: just the brand, top-left, so every page carries the NEA logo.
 * It tucks away while you scroll down and returns when you scroll up.
 */
export function BrandCorner() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > prev);
    setCompact(y > 40);
  });
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-40"
      initial={false}
      animate={{ y: hidden ? -90 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container flex items-center justify-between pt-4">
        <Link
          href="/"
          aria-label="NEA Precision Skin home"
          className={`pointer-events-auto rounded-2xl text-ink transition-all duration-500 ${compact ? "glass px-3.5 py-2" : "px-0 py-0"}`}
        >
          <NeaLogo className={`w-auto transition-all duration-500 ${compact ? "h-8" : "h-11"}`} />
        </Link>
        <a href={site.phoneHref} className={`pointer-events-auto hidden items-center gap-2 rounded-full px-4 py-2 text-[13px] text-ink/80 transition hover:text-ink md:flex ${compact ? "glass" : ""}`}>
          <Phone className="h-3.5 w-3.5" /> {site.phone}
        </a>
      </div>
    </motion.div>
  );
}
