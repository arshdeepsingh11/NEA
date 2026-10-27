"use client";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({ items, defaultOpen = -1, className }: { items: { title: ReactNode; content: ReactNode; id?: string }[]; defaultOpen?: number; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("divide-y divide-ink/[0.08] border-y border-ink/[0.08]", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} id={it.id}>
            <h3>
              <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold tracking-tight">
                {it.title}
                <Plus className={cn("h-5 w-5 shrink-0 transition-transform duration-500 ease-spring", isOpen && "rotate-45")} />
              </button>
            </h3>
            <div className={cn("grid transition-[grid-template-rows] duration-500 ease-spring", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="pb-6">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
