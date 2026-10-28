"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Clapperboard, House, LayoutGrid, Microscope, Route, ScanFace, Sparkles, Syringe, X } from "lucide-react";
import Link from "next/link";
import { SparkleNavbar, type SparkleItem } from "@/components/ui/sparkle-navbar";
import { useAi } from "@/components/ai/ai-provider";
import { useBooking } from "@/components/booking/booking";
import { useReels } from "@/components/reels/reels";
import { NeaLogo } from "@/components/brand/nea-logo";
import { footerNav } from "@/content/nav";
import { site } from "@/lib/site";
import { ThemePicker } from "@/components/theme/theme";

/**
 * The only navigation: a Sparkle Navbar fixed at the bottom.
 * Six destinations people actually come for, SI in the centre, and "More" for everything else.
 */
export function Dock() {
  const pathname = usePathname();
  const ai = useAi();
  const book = useBooking();
  const reels = useReels();
  const [more, setMore] = useState(false);
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const is = (p: string) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/"));

  const all: (SparkleItem & { match?: boolean })[] = [
    { label: "Home", href: "/", icon: <House />, match: is("/") },
    { label: "Programs", href: "/programs", icon: <Route />, match: is("/programs") },
    { label: "Treatments", href: "/treatments", icon: <Syringe />, match: is("/treatments") || is("/fotona") },
    { label: "Reels", icon: <Clapperboard />, onClick: () => reels.open(), hint: "Watch NEA videos" },
    { label: "Ask SI", icon: <Sparkles />, featured: true, onClick: () => ai.open(), hint: "Skin Intelligence · press N" },
    { label: "Testing", href: "/tests", icon: <Microscope />, match: is("/tests") || is("/microbiome") },
    { label: "Free scan", href: "/skin-scan", icon: <ScanFace />, match: is("/skin-scan") },
    { label: "Book", icon: <CalendarHeart />, onClick: () => book.open(), hint: "Book in Jane" },
    { label: "More", icon: <LayoutGrid />, onClick: () => setMore(true), match: more },
  ];
  const items = small ? [all[0], all[1], all[4], all[3], all[8]] : all;
  const active = items.findIndex((i) => i.match);

  return (
    <>
      <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 md:bottom-4">
        <SparkleNavbar items={items} active={active} compact={false} className={small ? "w-full max-w-sm justify-between" : undefined} />
      </div>
      <MoreSheet open={more} onClose={() => setMore(false)} />
    </>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/20 backdrop-blur-md sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="All pages"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            data-lenis-prevent
            className="surface max-h-[86dvh] w-full max-w-4xl overflow-y-auto rounded-t-[32px] p-6 sm:rounded-[32px] sm:p-10"
          >
            <div className="mb-8 flex items-center justify-between">
              <NeaLogo className="h-10 w-auto text-ink" animate={false} />
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white/60" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {footerNav.map((g) => (
                <nav key={g.title} aria-label={g.title}>
                  <p className="mb-3 text-[13px] text-graphite">{g.title}</p>
                  <ul className="space-y-2">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={onClose} className="text-[15px] text-ink/90 hover:text-ink">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="mt-10 border-t border-ink/10 pt-6">
              <p className="mb-3 text-[13px] text-graphite">Colour theme</p>
              <ThemePicker />
            </div>
            <div className="mt-8 flex flex-wrap gap-3 border-t border-ink/10 pt-6 text-[14px] text-graphite">
              <a href={site.phoneHref} className="chip !text-[13px]">
                {site.phone}
              </a>
              <span className="chip !text-[13px]">Mon–Sat 9–5</span>
              <span className="chip !text-[13px]">{site.address.line1}, Calgary</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
