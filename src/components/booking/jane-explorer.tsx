"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { janeDisciplines, janeItems, janeUrl } from "@/content/jane";
import { cn, money } from "@/lib/utils";

/** Every NEA service in Jane, by category, each one opening its own Jane calendar. */
export function JaneExplorer({ className }: { className?: string }) {
  const ids = useMemo(() => Object.keys(janeDisciplines).map(Number).sort((a, b) => (a === 24 ? -1 : b === 24 ? 1 : janeDisciplines[a].name.localeCompare(janeDisciplines[b].name))), []);
  const [d, setD] = useState(24);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return janeItems.filter((i) => (t ? `${i.name} ${janeDisciplines[i.d].name}`.toLowerCase().includes(t) : i.d === d));
  }, [d, q]);

  return (
    <div className={cn("surface overflow-hidden rounded-[32px]", className)}>
      <div className="grid lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-ink/[0.06] p-4 lg:border-b-0 lg:border-r">
          <label className="mb-3 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/70 px-3 py-2.5">
            <Search className="h-4 w-4 text-graphite" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services" className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" />
          </label>
          <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
            {ids.map((id) => {
              const n = janeItems.filter((i) => i.d === id).length;
              const on = !q && d === id;
              return (
                <button key={id} onClick={() => (setQ(""), setD(id))} className={cn("flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition", on ? "bg-ink text-white" : "text-ink/80 hover:bg-white")}>
                  {janeDisciplines[id].name}
                  <span className={cn("tabular text-[12px]", on ? "text-white/70" : "text-graphite")}>{n}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <div className="p-4 sm:p-6">
          <p className="mb-3 text-[12.5px] text-graphite">
            {q ? `${list.length} results` : `${janeDisciplines[d].name} · with ${janeDisciplines[d].by}`}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.ul key={q || d} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="divide-y divide-ink/[0.06]">
              {list.map((i) => (
                <li key={`${i.d}-${i.id}`}>
                  <a href={janeUrl(i)} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-3.5">
                    <span>
                      <span className="block text-[15px] text-ink group-hover:underline">{i.name}</span>
                      <span className="flex items-center gap-2 text-[12.5px] text-graphite">
                        {q && <span>{janeDisciplines[i.d].name}</span>}
                        {i.min && (
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" /> {i.min} min
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {i.price ? <span className="tabular font-display text-[18px]">{money(i.price)}</span> : <span className="text-[12px] text-graphite">Price in Jane</span>}
                      <ArrowUpRight className="h-4 w-4 text-graphite transition group-hover:text-ink" />
                    </span>
                  </a>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
