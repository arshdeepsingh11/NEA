"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";

/**
 * The Nea SI launcher: a floating orb, bottom-right, on every page (phones included, sitting above the navbar).
 * Once per visit it says hello with a short prompt.
 */
export function ChatLauncher({ hidden, onOpen }: { hidden: boolean; onOpen: () => void }) {
  const [hello, setHello] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("nea-si-hello") === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setHello(true), 7000);
    const off = setTimeout(() => setHello(false), 19000);
    return () => {
      clearTimeout(t);
      clearTimeout(off);
    };
  }, []);
  const dismiss = () => {
    setHello(false);
    try {
      sessionStorage.setItem("nea-si-hello", "1");
    } catch {}
  };
  const go = () => {
    dismiss();
    onOpen();
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div className="fixed bottom-[88px] right-3 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
          <AnimatePresence>
            {hello && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="glass relative hidden w-64 rounded-3xl rounded-br-lg p-4 pr-9 text-[13.5px] leading-snug text-ink sm:block">
                <button onClick={dismiss} aria-label="Dismiss" className="absolute right-2.5 top-2.5 text-graphite hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="font-medium">Hi, I’m Nea SI.</p>
                <p className="mt-1 text-graphite">Tell me what is bothering your skin and I’ll build a plan in seconds.</p>
                <button onClick={go} className="mt-3 text-[13px] font-medium text-flora hover:underline">
                  Start a chat →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={go} aria-label="Chat with Nea SI" title="Nea SI · press N" className="group relative grid h-14 w-14 place-items-center rounded-full text-ink shadow-[0_16px_40px_-12px_rgba(var(--shadow-tint),0.6)] transition-transform hover:scale-105 md:h-16 md:w-16">
            <span aria-hidden className="absolute inset-0 animate-pulseglow rounded-full blur-md [background:var(--aurora)]" />
            <span aria-hidden className="absolute inset-0 rounded-full [background:var(--aurora)]" />
            <span aria-hidden className="absolute inset-[3px] rounded-full bg-white/75 backdrop-blur" />
            <NeaSiIcon className="relative h-7 w-7 transition-transform duration-500 group-hover:scale-110 md:h-8 md:w-8" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
