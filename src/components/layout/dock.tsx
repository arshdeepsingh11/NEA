"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Home, Layers, MessageCircle, Phone, ScanFace } from "lucide-react";
import { AppleDock } from "@/components/ui/apple-dock";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Floating dock with the six things people come to NEA for. Appears after the hero. */
export function Dock() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { label: "Home", href: "/", icon: <Home />, active: pathname === "/" },
    { label: "Free skin scan", href: "/skin-scan", icon: <ScanFace />, active: pathname === "/skin-scan" },
    { label: "Programs", href: "/programs", icon: <Layers />, active: pathname.startsWith("/programs") },
    { label: "Ask NEA", href: "/ask", icon: <MessageCircle />, active: pathname === "/ask" },
    { label: "Call 403-230-8812", href: site.phoneHref, icon: <Phone />, external: false },
    { label: "Book online", href: site.bookingUrl, icon: <CalendarCheck />, external: true },
  ];

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-5 z-40 hidden justify-center transition-all duration-700 ease-spring md:flex",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
      )}
    >
      <AppleDock items={items} />
    </div>
  );
}

/** Mobile: a compact action bar instead of a dock. */
export function MobileBar() {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-full border border-white/60 bg-white/80 p-1.5 shadow-[0_12px_40px_-12px_rgba(21,25,28,0.4)] backdrop-blur-2xl md:hidden">
      <a href={site.phoneHref} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist" aria-label="Call NEA">
        <Phone className="h-4 w-4" />
      </a>
      <a href="/skin-scan" className="btn-ghost flex-1 !px-3 !py-2.5 !text-[14px]">
        Free scan
      </a>
      <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 !px-3 !py-2.5 !text-[14px]">
        Book
      </a>
    </div>
  );
}
