"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Download, X } from "lucide-react";
import { FlipBook, type FlipBookHandle } from "./flip-book";
import { pageSrc, type Issue } from "@/content/magazine";
import { cn } from "@/lib/utils";

/** The magazine on a dark stage, with "what's inside" beside it and a full-screen reading mode. */
export function MagazineReader({ issue }: { issue: Issue }) {
  const pages = useMemo(() => Array.from({ length: issue.pages }, (_, i) => pageSrc(issue, i + 1)), [issue]);
  const book = useRef<FlipBookHandle>(null);
  const [page, setPage] = useState(1);
  const [full, setFull] = useState(false);
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const f = () => setVh(window.innerHeight);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [full]);
  const onPage = useCallback((_: string, first: number) => setPage(first), []);
  const jump = (p: number) => {
    book.current?.goToPage(p);
    document.getElementById("flip-stage")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const current = [...issue.toc].reverse().find((t) => t.page <= page);

  return (
    <section className="relative overflow-hidden bg-[#1c1614] text-white">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[90%] -translate-x-1/2 rounded-[50%] opacity-50 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(243,217,164,0.35), transparent)" }} />
      <div className="container relative py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12.5px] uppercase tracking-[0.2em] text-white/55">
              {issue.season} · {issue.pages} pages
            </p>
            <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] leading-none">{issue.title}</h2>
          </div>
          <a href={issue.pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-[14px] text-white/85 transition hover:bg-white/10">
            <Download className="h-4 w-4" /> Download PDF
          </a>
        </div>

        <div id="flip-stage" className="mt-8 scroll-mt-24 text-white">
          <FlipBook ref={book} pages={pages} maxHeight={Math.min(860, vh * 0.72)} onPageChange={onPage} onFullscreen={() => setFull(true)} title={`NEA Magazine, ${issue.title}`} />
          <p className="mt-3 text-center text-[12.5px] text-white/45">Drag a corner, swipe, tap a page or use the arrow keys.</p>
        </div>

        {/* what's inside */}
        <div className="mt-12">
          <p className="flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-white/55">
            <BookOpen className="h-4 w-4" /> Inside this issue
          </p>
          <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
            {issue.toc.map((t) => (
              <button key={t.page + t.title} onClick={() => jump(t.page)} className={cn("flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] transition", current === t ? "border-[#f3d9a4] bg-[#f3d9a4] text-ink" : "border-white/15 text-white/80 hover:border-white/40")}>
                <span className="tabular text-[11.5px] opacity-60">{String(t.page).padStart(2, "0")}</span>
                {t.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {current?.treatment && (
              <motion.div key={current.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <Link href={`/treatments/${current.treatment}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14.5px] font-medium text-ink transition hover:bg-white/90">
                  Reading about {current.title.toLowerCase()}? See the treatment <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {full && (
          <motion.div className="fixed inset-0 z-[90] flex flex-col bg-[#120e0c] text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-[14px] text-white/70">{issue.title}</p>
              <button onClick={() => setFull(false)} aria-label="Close full screen" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 items-center px-2 pb-4">
              <FlipBook pages={pages} startPage={page} maxHeight={vh - 150} title={`NEA Magazine, ${issue.title}`} onPageChange={onPage} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
