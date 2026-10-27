"use client";
import { useState } from "react";
import Link from "next/link";
import { EvervaultCard } from "@/components/ui/evervault-card";
import type { LabTest } from "@/content/tests";
import { cn, money } from "@/lib/utils";

export function TestsCatalog({ tests, groups }: { tests: LabTest[]; groups: { id: LabTest["group"]; label: string; blurb: string }[] }) {
  const [g, setG] = useState<LabTest["group"] | "all">("all");
  const list = tests.filter((t) => g === "all" || t.group === g);
  return (
    <div>
      <div className="no-scrollbar mb-10 flex gap-1 overflow-x-auto">
        {[{ id: "all" as const, label: "All tests", blurb: "" }, ...groups].map((x) => (
          <button key={x.id} onClick={() => setG(x.id)} aria-pressed={g === x.id} className={cn("shrink-0 rounded-full px-4 py-2 text-[14px] transition", g === x.id ? "bg-ink text-white" : "text-graphite hover:bg-ink/5")}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((t) =>
          t.featured ? (
            <EvervaultCard key={t.slug} className="text-white">
              <TestBody t={t} dark />
            </EvervaultCard>
          ) : (
            <div key={t.slug} className="rounded-3xl bg-white">
              <TestBody t={t} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TestBody({ t, dark }: { t: LabTest; dark?: boolean }) {
  return (
    <div id={t.slug} className="flex h-full min-h-[260px] scroll-mt-32 flex-col justify-between p-7">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight">{t.name}</h3>
          <span className={cn("shrink-0 font-display text-lg font-semibold", dark ? "text-white" : "text-ink")}>{money(t.price)}</span>
        </div>
        <p className={cn("mt-1 text-[14px]", dark ? "text-white/55" : "text-graphite")}>Best suited for: {t.bestFor}</p>
        <p className={cn("mt-4 text-[15px] leading-relaxed", dark ? "text-white/80" : "text-ink")}>{t.neaUse}</p>
      </div>
      <div className={cn("mt-6 flex items-center justify-between text-[13px]", dark ? "text-white/55" : "text-graphite")}>
        <span>{t.results ? `Results in ${t.results}` : "BioAro Labs"}</span>
        <Link href={`/book?topic=${encodeURIComponent(t.name)}`} className={cn("underline underline-offset-4", dark ? "text-white" : "text-ink")}>
          Ask about this test
        </Link>
      </div>
    </div>
  );
}
