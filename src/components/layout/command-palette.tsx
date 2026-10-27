"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, Sparkles } from "lucide-react";
import { search, type Doc } from "@/lib/knowledge";

const SUGGESTED: { label: string; href: string }[] = [
  { label: "Book a free Skin Health Report", href: "/skin-scan" },
  { label: "Find my program (2 questions)", href: "/finder" },
  { label: "Acne treatment", href: "/programs/clear-skin" },
  { label: "Pigmentation and melasma", href: "/programs/even-tone" },
  { label: "Hair thinning", href: "/programs/hair-regrowth" },
  { label: "Microbiome tests", href: "/tests" },
];

/** Spotlight-style search across every treatment, program, test and FAQ (⌘K). */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const results: { label: string; href: string; kind?: string }[] = useMemo(() => {
    if (!q.trim()) return SUGGESTED;
    const hits: Doc[] = search(q, 8);
    return [...hits.map((h) => ({ label: h.title, href: h.href, kind: h.kind })), { label: `Ask NEA: “${q}”`, href: `/ask?q=${encodeURIComponent(q)}`, kind: "AI" }];
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("nea:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nea:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/30 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search NEA"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -12, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_40px_120px_-30px_rgba(21,25,28,0.55)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-ink/[0.07] px-5">
              <Search className="h-5 w-5 text-graphite" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setI(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setI((x) => Math.min(results.length - 1, x + 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setI((x) => Math.max(0, x - 1));
                  }
                  if (e.key === "Enter" && results[i]) go(results[i].href);
                }}
                placeholder="Search acne, Fotona, BioSkin, hours…"
                className="h-16 flex-1 bg-transparent text-[17px] outline-none placeholder:text-graphite/60"
                aria-label="Search"
              />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {!q && <li className="px-3 pb-1 pt-2 text-xs text-graphite">Suggested</li>}
              {results.map((r, idx) => (
                <li key={r.href + idx} role="option" aria-selected={idx === i}>
                  <button
                    onMouseEnter={() => setI(idx)}
                    onClick={() => go(r.href)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition ${idx === i ? "bg-ink/[0.06]" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      {r.kind === "AI" && <Sparkles className="h-4 w-4 text-lumen" />}
                      <span className="text-[15px]">{r.label}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-graphite">
                      {r.kind && r.kind !== "AI" && <span>{r.kind}</span>}
                      {idx === i && <CornerDownLeft className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
