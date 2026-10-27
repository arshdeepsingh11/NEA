"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export type TerminalLine = { kind: "cmd" | "out" | "ok" | "warn" | "dim"; text: string };

const color: Record<TerminalLine["kind"], string> = {
  cmd: "text-white",
  out: "text-white/75",
  ok: "text-emerald-300",
  warn: "text-amber-200",
  dim: "text-white/40",
};

/** macOS-style terminal that types commands and streams output (Magic UI "Terminal"). */
export function Terminal({ lines, title = "nea — skin-report", className, speed = 22 }: { lines: TerminalLine[]; title?: string; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [shown, setShown] = useState<{ line: number; chars: number }>({ line: 0, chars: 0 });

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown({ line: lines.length, chars: 0 });
      return;
    }
    if (shown.line >= lines.length) return;
    const cur = lines[shown.line];
    if (cur.kind === "cmd" && shown.chars < cur.text.length) {
      const t = setTimeout(() => setShown((s) => ({ ...s, chars: s.chars + 1 })), speed + Math.random() * 30);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => ({ line: s.line + 1, chars: 0 })), cur.kind === "cmd" ? 380 : 170);
    return () => clearTimeout(t);
  }, [inView, shown, lines, speed]);

  return (
    <div ref={ref} className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#101718]/95 shadow-2xl shadow-black/40", className)}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-white/45">{title}</span>
      </div>
      <pre className="min-h-[300px] overflow-x-auto p-5 font-mono text-[12.5px] leading-6 sm:text-[13px]" aria-live="polite">
        {lines.slice(0, shown.line + 1).map((l, i) => {
          const isCur = i === shown.line;
          if (isCur && shown.line < lines.length && l.kind !== "cmd") return null;
          const text = l.kind === "cmd" ? (isCur ? l.text.slice(0, shown.chars) : l.text) : l.text;
          return (
            <div key={i} className={color[l.kind]}>
              {l.kind === "cmd" && <span className="mr-2 text-emerald-400">❯</span>}
              {text}
              {isCur && l.kind === "cmd" && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-white/80" />}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
