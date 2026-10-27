"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "nea"; text: string; sources?: { title: string; href: string; kind: string }[] };

const STARTERS = ["What helps with melasma on brown skin?", "How does PRP work for hair thinning?", "Is Fotona safe for darker skin?", "Which microbiome test is for acne?", "Are you open on Saturday?", "Does insurance cover a dietitian?"];

export function AskNea() {
  const params = useSearchParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "nea", text: data.text ?? data.error ?? "Something went wrong. Please call 1-403-230-8812.", sources: data.sources }]);
    } catch {
      setMsgs((m) => [...m, { role: "nea", text: "I could not reach the server. Please call 1-403-230-8812." }]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const initial = params.get("q");
    if (initial && !asked.current) {
      asked.current = true;
      ask(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [msgs, busy]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <div className="min-h-[300px] space-y-5 pb-6" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-left text-[14px] text-white/80 transition hover:bg-white/10">
                {s}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-3xl px-5 py-4 text-[16px] leading-relaxed", m.role === "user" ? "bg-white text-ink" : "glass-dark text-white")}>
                {m.role === "nea" && (
                  <p className="mb-2 flex items-center gap-2 text-[12px] text-white/50">
                    <Sparkles className="h-3.5 w-3.5" /> Ask NEA
                  </p>
                )}
                <p>{m.text}</p>
                {m.sources && m.sources.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {m.sources.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href} className="inline-block rounded-full bg-white/10 px-3 py-1.5 text-[13px] hover:bg-white/20">
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Looking through NEA’s treatments and FAQs…
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={onSubmit} className="sticky bottom-24 flex items-center gap-2 rounded-full border border-white/15 bg-abyss/80 p-2 pl-6 backdrop-blur-xl md:bottom-28">
        <label htmlFor="ask" className="sr-only">
          Your question
        </label>
        <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} maxLength={500} placeholder="Ask about a treatment, test, price or your visit" className="h-12 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/40" />
        <button type="submit" disabled={busy || !q.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition disabled:opacity-40" aria-label="Send">
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-4 text-center text-[12px] text-white/40">Answers come only from NEA’s own information and are not medical advice. For anything personal, book a free consultation.</p>
    </div>
  );
}
