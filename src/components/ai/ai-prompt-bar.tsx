"use client";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAi } from "./ai-provider";
import { cn } from "@/lib/utils";

/** Inline entry point to NEA SI (Skin Intelligence). Typing here and pressing Enter opens NEA SI with the question. */
export function AiPromptBar({
  placeholder = "Ask anything about your skin, hair or body…",
  suggestions = [],
  className,
  context,
}: {
  placeholder?: string;
  suggestions?: string[];
  className?: string;
  context?: string;
}) {
  const ai = useAi();
  const [q, setQ] = useState("");
  const send = (text: string) => {
    if (!text.trim()) return ai.open({ context });
    ai.open({ query: text.trim(), context });
    setQ("");
  };
  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(q);
        }}
        className="aurora-border glass relative flex items-center gap-3 rounded-full py-2 pl-5 pr-2"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-flora" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Ask NEA SI"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-graphite/80 focus:outline-none"
        />
        <kbd className="hidden rounded-md border border-ink/10 bg-white/60 px-1.5 py-0.5 font-sans text-[11px] text-graphite sm:block" title="Press N anywhere to open NEA SI">
          N
        </kbd>
        <button type="submit" aria-label="Ask" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink" style={{ background: "var(--aurora)" }}>
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className={cn("chip transition hover:border-ink/20 hover:text-ink")}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
