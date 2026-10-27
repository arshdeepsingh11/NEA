"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, Loader2, Mic, ScanFace, Sparkles, X } from "lucide-react";
import { answer as localAnswer, type DocMeta, type Plan } from "@/lib/knowledge";
import { site } from "@/lib/site";
import { cn, money } from "@/lib/utils";

type Source = { title: string; href: string; kind: string; meta?: DocMeta };
type Reply = { text: string; sources: Source[]; plan?: Plan; steps: string[]; model?: string };
type Msg = { role: "user"; text: string } | { role: "nea"; reply: Reply };

const STARTERS = [
  "My acne keeps coming back. What is behind it?",
  "I have dark spots and melasma on brown skin",
  "Build me a plan for thinning hair, budget $2,500",
  "Which microbiome test fits my skin?",
  "What does the free skin scan show?",
  "Are you open on Saturday?",
];

async function ask(question: string, context?: string): Promise<Reply> {
  try {
    const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, context }) });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Reply;
  } catch {
    // Offline or static preview: answer with the same grounded engine in the browser.
    const a = localAnswer(context ? `${context} ${question}` : question);
    return { text: a.text, plan: a.plan, steps: a.steps, sources: a.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind, meta: s.meta })), model: "nea-local" };
  }
}

type SpeechRec = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null };

export function AiOverlay({ open, onClose, initialQuery, context, nonce }: { open: boolean; onClose: () => void; initialQuery?: string; context?: string; nonce: number }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const rec = useRef<SpeechRec | null>(null);
  const handled = useRef(0);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setQ("");
    setBusy(true);
    const reply = await ask(t, context);
    setMsgs((m) => [...m, { role: "nea", reply }]);
    setBusy(false);
  };

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 60);
    if (initialQuery && handled.current !== nonce) {
      handled.current = nonce;
      send(initialQuery);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nonce]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const toggleMic = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new Ctor();
    r.lang = "en-CA";
    r.interimResults = false;
    r.onresult = (e) => setQ((prev) => `${prev} ${e.results[0][0].transcript}`.trim());
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(q);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/20 p-0 backdrop-blur-xl sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="NEA Intelligence"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="aurora-border relative flex h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[32px] border border-ink/10 bg-white/80 shadow-[0_60px_160px_-40px_rgba(var(--shadow-tint),0.35)] backdrop-blur-2xl sm:h-[82vh] sm:rounded-[32px]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <Orb active={busy} />
                <div>
                  <p className="font-display text-[17px] font-semibold tracking-tight">NEA Intelligence</p>
                  <p className="text-[12px] text-graphite">Grounded in NEA’s programs, treatments, tests and FAQs{context ? ` · focus: ${context}` : ""}</p>
                </div>
              </div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white/60 text-graphite hover:text-ink" aria-label="Close (Esc)">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scroller} className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7" aria-live="polite">
              {msgs.length === 0 && (
                <div className="pt-6">
                  <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Ask anything about <span className="aurora-text">your skin and body.</span>
                  </h2>
                  <p className="mt-3 max-w-lg text-graphite">I can explain the cause behind a concern, match you to a program, price a plan, compare tests, or tell you how to book.</p>
                  <div className="mt-8 grid gap-2 sm:grid-cols-2">
                    {STARTERS.map((s) => (
                      <button key={s} onClick={() => send(s)} className="glass rounded-2xl px-4 py-3.5 text-left text-[14px] text-ink/90 transition hover:border-ink/20 hover:bg-white/90">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-white/60 px-5 py-3 text-[15px]">{m.text}</p>
                  </div>
                ) : (
                  <AssistantReply key={i} reply={m.reply} onClose={onClose} />
                )
              )}
              {busy && (
                <div className="flex items-center gap-3 text-[14px] text-graphite">
                  <Loader2 className="h-4 w-4 animate-spin text-flora" /> Thinking through NEA’s data…
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-ink/10 p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-3xl border border-ink/10 bg-white/60 p-2 pl-4 focus-within:border-flora/50">
                <label htmlFor="nea-ai-input" className="sr-only">
                  Ask NEA
                </label>
                <textarea
                  id="nea-ai-input"
                  ref={input}
                  rows={1}
                  value={q}
                  maxLength={500}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(q);
                    }
                  }}
                  placeholder="Describe a concern, a goal or a budget…"
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[16px] text-ink outline-none placeholder:text-graphite/80"
                />
                <button type="button" onClick={toggleMic} className={cn("grid h-11 w-11 place-items-center rounded-full transition", listening ? "bg-orchid/30 text-ink" : "text-graphite hover:text-ink")} aria-label={listening ? "Stop voice input" : "Speak your question"}>
                  <Mic className="h-5 w-5" />
                </button>
                <button type="submit" disabled={busy || !q.trim()} className="btn-primary !h-11 !w-11 !p-0 disabled:opacity-40" aria-label="Send">
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[11px] text-graphite/80">Not medical advice. For anything personal, book a free 15-minute consultation. Press Esc to close.</p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Orb({ active }: { active?: boolean }) {
  return (
    <span className="relative grid h-10 w-10 place-items-center">
      <span className={cn("absolute inset-0 rounded-full blur-md [background:var(--aurora)]", active ? "animate-pulseglow" : "opacity-60")} />
      <span className="relative grid h-9 w-9 place-items-center rounded-full text-ink [background:var(--aurora)]">
        <Sparkles className="h-4 w-4" />
      </span>
    </span>
  );
}

function AssistantReply({ reply, onClose }: { reply: Reply; onClose: () => void }) {
  const [stepCount, setStepCount] = useState(0);
  const [chars, setChars] = useState(0);
  const doneSteps = stepCount >= reply.steps.length;
  const doneText = chars >= reply.text.length;

  useEffect(() => {
    if (!doneSteps) {
      const t = setTimeout(() => setStepCount((c) => c + 1), 260);
      return () => clearTimeout(t);
    }
    if (!doneText) {
      const t = setTimeout(() => setChars((c) => Math.min(reply.text.length, c + 3)), 12);
      return () => clearTimeout(t);
    }
  }, [doneSteps, doneText, reply.text.length, stepCount, chars]);

  return (
    <div className="space-y-4">
      <ul className="space-y-1.5">
        {reply.steps.slice(0, Math.max(1, stepCount)).map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-[12.5px] text-graphite">
            {i < stepCount ? <Check className="h-3.5 w-3.5 text-flora" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {s}
          </li>
        ))}
      </ul>
      {doneSteps && (
        <p className="text-[16px] leading-relaxed text-ink">
          {reply.text.slice(0, chars)}
          {!doneText && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-flora" />}
        </p>
      )}
      {doneText && reply.plan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface-strong rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold">Your starting plan</p>
            <p className="text-[13px] text-graphite">
              Total from <span className="font-semibold text-ink">{money(reply.plan.total)}</span>
              {reply.plan.budget ? ` · budget ${money(reply.plan.budget)}` : ""}
            </p>
          </div>
          <ol className="mt-4 space-y-2">
            {reply.plan.items.map((it, i) => (
              <li key={it.href}>
                <Link href={it.href} onClick={onClose} className="flex items-center justify-between gap-4 rounded-2xl bg-white/60 px-4 py-3 hover:bg-white/90">
                  <span className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/60 text-[12px] tabular">{i + 1}</span>
                    <span>
                      <span className="block text-[15px] font-medium">{it.title}</span>
                      <span className="block text-[12.5px] text-graphite">{it.why}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[13px]">
                    <span className="block font-semibold">{money(it.price)}</span>
                    <span className="block text-graphite">{it.duration}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {reply.plan.budget !== undefined && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/60">
                <div className="h-full rounded-full [background:var(--aurora)]" style={{ width: `${Math.min(100, (reply.plan.total / reply.plan.budget) * 100)}%` }} />
              </div>
            </div>
          )}
          <p className="mt-4 text-[13px] leading-relaxed text-graphite">{reply.plan.note}</p>
        </motion.div>
      )}
      {doneText && reply.sources.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2 sm:grid-cols-2">
          {reply.sources.map((s) => (
            <Link key={s.href} href={s.href} onClick={onClose} className="glass group rounded-2xl p-4 transition hover:border-ink/20">
              <span className="chip !py-0.5">{s.kind}</span>
              <span className="mt-2 block font-medium leading-snug group-hover:underline">{s.title}</span>
              {s.meta?.summary && <span className="mt-1 line-clamp-2 block text-[13px] text-graphite">{s.meta.summary}</span>}
              {s.meta?.price !== undefined && (
                <span className="mt-2 block text-[13px] text-flora">
                  {s.kind === "Program" ? "From " : ""}
                  {money(s.meta.price)}
                  {s.meta.duration ? ` · ${s.meta.duration}` : ""}
                </span>
              )}
            </Link>
          ))}
        </motion.div>
      )}
      {doneText && (
        <div className="flex flex-wrap gap-2">
          <Link href="/skin-scan" onClick={onClose} className="btn-ghost !px-4 !py-2 !text-[13px]">
            <ScanFace className="h-4 w-4" /> Free Skin Health Report
          </Link>
          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-ghost !px-4 !py-2 !text-[13px]">
            Book online
          </a>
          {reply.model === "claude" && <span className="chip">Answered with Claude, grounded in NEA data</span>}
        </div>
      )}
    </div>
  );
}
