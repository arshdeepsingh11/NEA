"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CalendarCheck, FlaskConical, Grid2x2, Home, Layers, PersonStanding, ScanFace, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { AppleDock, type DockItem } from "@/components/ui/apple-dock";
import { useAi } from "@/components/ai/ai-provider";
import { footerNav } from "@/content/nav";
import { site } from "@/lib/site";

/**
 * The only navigation on the site: a floating glass dock.
 * Seven destinations people actually come for, the AI in the middle, and "More" for everything else.
 */
export function Dock() {
  const pathname = usePathname();
  const ai = useAi();
  const [more, setMore] = useState(false);
  const is = (p: string) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/"));

  const items: DockItem[] = [
    { label: "Home", href: "/", icon: <Home />, active: is("/") },
    { label: "Body", href: "/body", icon: <PersonStanding />, active: is("/body"), hint: "3D body explorer" },
    { label: "Programs", href: "/programs", icon: <Layers />, active: is("/programs") },
    { label: "Treatments", href: "/treatments", icon: <Activity />, active: is("/treatments") },
    { label: "Ask AI", icon: <Sparkles />, featured: true, onClick: () => ai.open(), hint: "Press N" },
    { label: "Testing", href: "/tests", icon: <FlaskConical />, active: is("/tests") || is("/microbiome") },
    { label: "Free scan", href: "/skin-scan", icon: <ScanFace />, active: is("/skin-scan") },
    { label: "Book", href: site.bookingUrl, icon: <CalendarCheck />, external: true },
    { label: "More", icon: <Grid2x2 />, onClick: () => setMore(true) },
  ];

  // Phones get the five most important, still with the AI in the centre.
  const mobile = [items[0], items[1], items[4], items[2], items[8]];

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-50 hidden justify-center md:flex">
        <AppleDock items={items} />
      </div>
      <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 md:hidden">
        <AppleDock items={mobile} className="w-full max-w-sm justify-between" />
      </div>
      <MoreSheet open={more} onClose={() => setMore(false)} />
    </>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#03050a]/60 backdrop-blur-md sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="All pages"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="surface max-h-[86dvh] w-full max-w-4xl overflow-y-auto rounded-t-[32px] p-6 sm:rounded-[32px] sm:p-10"
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="font-display text-2xl font-semibold tracking-tight">Everything at NEA</p>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5" aria-label="Close">
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
                        <Link href={l.href} onClick={onClose} className="text-[15px] text-ink/90 hover:text-white">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-[14px] text-graphite">
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
