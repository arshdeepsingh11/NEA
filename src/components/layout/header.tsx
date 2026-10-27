"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "./logo";
import { PillNav } from "@/components/ui/pill-nav";
import { primaryNav, footerNav } from "@/content/nav";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const openSearch = () => window.dispatchEvent(new Event("nea:search"));

/** Pages whose first chapter is dark get a light header until you scroll. */
const DARK_TOP = ["/", "/fotona", "/tests", "/microbiome", "/ask"];
const isDarkTop = (p: string) => DARK_TOP.includes(p) || p.startsWith("/programs/");

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const darkTop = isDarkTop(pathname) && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open ? "border-b border-ink/[0.06] bg-porcelain/75 backdrop-blur-2xl backdrop-saturate-150" : "border-b border-transparent"
        )}
      >
        <div className="container flex h-[var(--header-h)] items-center justify-between gap-4">
          <Logo light={darkTop} />
          <nav aria-label="Primary" className="hidden lg:block">
            <PillNav items={primaryNav} className={cn(darkTop && "[&_a]:text-white/70 [&_a:hover]:text-white [&_a[aria-current]]:text-white [&_li:first-child]:bg-white/10")} />
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={openSearch}
              className={cn("hidden h-10 items-center gap-2 rounded-full px-3 text-[13px] transition sm:flex", darkTop ? "text-white/70 hover:bg-white/10" : "text-graphite hover:bg-ink/5")}
              aria-label="Search NEA (Command K)"
            >
              <Search className="h-4 w-4" />
              <kbd className="hidden rounded border border-current px-1.5 text-[11px] opacity-70 md:inline">⌘K</kbd>
            </button>
            <Link href="/skin-scan" className={cn("hidden md:inline-flex", darkTop ? "btn-light !py-2.5 !text-[14px]" : "btn-ghost !py-2.5 !text-[14px]")}>
              Free skin scan
            </Link>
            <a href={site.bookingUrl} target="_blank" rel="noreferrer" className={cn("!py-2.5 !text-[14px]", darkTop ? "btn-flora" : "btn-primary")}>
              Book
            </a>
            <button onClick={() => setOpen((o) => !o)} className={cn("grid h-10 w-10 place-items-center rounded-full lg:hidden", darkTop ? "text-white" : "text-ink")} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="h-[calc(100dvh-var(--header-h))] overflow-y-auto bg-porcelain/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container py-8">
              <ul className="space-y-1">
                {primaryNav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block rounded-2xl px-2 py-3">
                      <span className="font-display text-3xl font-semibold tracking-tight">{n.label}</span>
                      <span className="mt-1 block text-sm text-graphite">{n.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8">
                {footerNav.slice(0, 2).map((g) => (
                  <div key={g.title}>
                    <p className="mb-3 text-sm text-graphite">{g.title}</p>
                    <ul className="space-y-2">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-[15px]">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button onClick={openSearch} className="btn-ghost mt-8 w-full">
                <Search className="h-4 w-4" /> Search treatments, tests and questions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
