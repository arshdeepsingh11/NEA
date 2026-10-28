"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * The SI chatbot launcher: a floating orb, bottom-right, on every page.
 * Once per visit it says hello with a short prompt; it never covers content on phones.
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

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div className="fixed bottom-24 right-4 z-[60] hidden flex-col items-end gap-3 sm:flex md:bottom-6 md:right-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
          <AnimatePresence>
            {hello && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="glass relative w-64 rounded-3xl rounded-br-lg p-4 pr-9 text-[13.5px] leading-snug text-ink">
                <button onClick={dismiss} aria-label="Dismiss" className="absolute right-2.5 top-2.5 text-graphite hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="font-medium">Hi, I’m NEA SI.</p>
                <p className="mt-1 text-graphite">Tell me what is bothering your skin and I’ll build a plan in seconds.</p>
                <button
                  onClick={() => {
                    dismiss();
                    onOpen();
                  }}
                  className="mt-3 text-[13px] font-medium text-flora hover:underline"
                >
                  Start a chat →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              dismiss();
              onOpen();
            }}
            aria-label="Chat with NEA SI"
            className="group relative grid h-14 w-14 place-items-center rounded-full text-ink shadow-[0_16px_40px_-12px_rgba(var(--shadow-tint),0.6)]"
          >
            <span aria-hidden className="absolute inset-0 animate-pulseglow rounded-full blur-md [background:var(--aurora)]" />
            <span aria-hidden className="absolute inset-0 rounded-full [background:var(--aurora)]" />
            <span aria-hidden className="absolute inset-[3px] rounded-full bg-white/40 backdrop-blur" />
            <span className="relative flex items-center gap-0.5 font-display text-[19px] leading-none">
              SI
              <Sparkles className="h-3.5 w-3.5 -translate-y-1.5" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
