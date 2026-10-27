"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { NeaImage } from "@/components/ui/nea-image";
import type { TreatmentCategory } from "@/content/treatments";
import { cn } from "@/lib/utils";

type Item = { slug: string; title: string; summary: string; image: string; category: TreatmentCategory; concerns: string[] };

const FOCUS_MAP: Record<string, TreatmentCategory | "all"> = { skin: "skin", wellness: "wellness", body: "body", injectables: "injectables", laser: "laser", hair: "hair", feminine: "feminine" };

export function TreatmentsBrowser({ items, categories }: { items: Item[]; categories: { id: TreatmentCategory; label: string; blurb: string }[] }) {
  const params = useSearchParams();
  const initial = FOCUS_MAP[params.get("focus") ?? ""] ?? "all";
  const [cat, setCat] = useState<TreatmentCategory | "all">(initial);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((t) => (cat === "all" || t.category === cat) && (!s || `${t.title} ${t.summary} ${t.concerns.join(" ")}`.toLowerCase().includes(s)));
  }, [items, cat, q]);

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-30 -mx-5 mb-10 border-b border-ink/[0.06] bg-porcelain/85 px-5 py-4 backdrop-blur-xl md:mx-0 md:rounded-full md:border md:px-3 md:py-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {[{ id: "all" as const, label: "All" }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={cn("shrink-0 rounded-full px-4 py-2 text-[14px] transition", cat === c.id ? "surface-strong text-white" : "text-graphite hover:bg-ink/5 hover:text-ink")}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="relative md:ml-auto md:w-72">
            <span className="sr-only">Search treatments</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a concern, e.g. melasma" className="w-full rounded-full border border-ink/10 surface py-2.5 pl-10 pr-4 text-[14px] outline-none focus:border-flora" />
          </label>
        </div>
      </div>
      {cat !== "all" && <p className="mb-8 text-lede text-graphite">{categories.find((c) => c.id === cat)?.blurb}</p>}
      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((t) => (
            <motion.div key={t.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <Link href={`/treatments/${t.slug}`} className="group block overflow-hidden rounded-4xl surface">
                <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                  <NeaImage src={t.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-spring group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-[13px] text-graphite">{categories.find((c) => c.id === t.category)?.label}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">{t.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-graphite">{t.summary}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <div className="rounded-4xl border border-dashed border-ink/15 p-12 text-center">
          <p className="text-lg">No treatment matches “{q}”.</p>
          <p className="mt-2 text-graphite">Try a simpler word, or ask the team directly.</p>
          <Link href={`/ask?q=${encodeURIComponent(q)}`} className="btn-primary mt-6">
            Ask NEA
          </Link>
        </div>
      )}
    </div>
  );
}
