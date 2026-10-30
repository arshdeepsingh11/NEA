"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CalendarHeart, Mic, Play, RotateCcw, ScanFace, Sparkles, X } from "lucide-react";
import { NeaSiIcon } from "@/components/brand/nea-si-icon";
import { useBooking } from "@/components/booking/booking";
import { answer as localAnswer, type DocMeta, type Plan } from "@/lib/knowledge";
import { cn, money } from "@/lib/utils";

type Source = { title: string; href: string; kind: string; meta?: DocMeta };
type Reply = { text: string; sources: Source[]; plan?: Plan; steps: string[]; model?: string; fellBack?: boolean; done?: boolean };
type Engine = "xevyo" | "gemini";
const ENGINES: { id: Engine; label: string }[] = [
  { id: "xevyo", label: "Xevyo" },
  { id: "gemini", label: "Gemini" },
];
type Msg = { role: "user"; text: string } | { role: "nea"; reply: Reply };

const STARTERS = [
  "My acne keeps coming back. What is behind it?",
  "I have dark spots and melasma on brown skin",
  "Build me a plan for thinning hair, budget $2,500",
  "Which microbiome test fits my skin?",
  "What does the free skin scan show?",
  "Are you open on Saturday?",
];

type History = { role: "user" | "assistant"; text: string }[];

const localReply = (question: string, context?: string): Reply => {
  const a = localAnswer(context ? `${context} ${question}` : question);
  return { text: a.text, plan: a.plan, steps: a.steps, sources: a.sources.map((s) => ({ title: s.title, href: s.href, kind: s.kind, meta: s.meta })), model: "nea-local", done: true };
};

/** Streams the answer: cards and steps arrive first, then the text word by word. */
async function ask(question: string, context: string | undefined, engine: Engine, history: History, onUpdate: (r: Reply) => void): Promise<Reply> {
  let reply: Reply = { text: "", sources: [], steps: [], done: false };
  try {
    const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, context, engine, history }) });
    if (!res.ok || !res.body) throw new Error(String(res.status));
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        const ev = JSON.parse(line) as { t: string; v?: string; sources?: Source[]; plan?: Plan; steps?: string[]; model?: string; fellBack?: boolean };
        if (ev.t === "meta") reply = { ...reply, sources: ev.sources ?? [], plan: ev.plan, steps: ev.steps ?? [] };
        else if (ev.t === "d") reply = { ...reply, text: reply.text + (ev.v ?? "") };
        else if (ev.t === "done") reply = { ...reply, model: ev.model, fellBack: ev.fellBack, done: true };
        onUpdate(reply);
      }
    }
    if (!reply.text) throw new Error("empty");
    return { ...reply, done: true };
  } catch {
    // Offline or static preview: answer with the same grounded engine in the browser.
    return localReply(question, context);
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
  const [engine, setEngine] = useState<Engine>("xevyo");
  const [ready, setReady] = useState<Record<Engine, boolean>>({ xevyo: true, gemini: true });
  const [hint, setHint] = useState<string | null>(null);

  // which engines are connected, and the visitor's last choice
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("nea-si-engine");
    } catch {}
    if (saved === "xevyo" || saved === "gemini") setEngine(saved);
    fetch("/api/ask")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { default: Engine; engines: Record<Engine, boolean>; hint?: string | null } | null) => {
        if (!d) return;
        setReady(d.engines);
        setHint(d.hint ?? null);
        if (saved !== "xevyo" && saved !== "gemini") setEngine(d.default);
      })
      .catch(() => {});
  }, []);
  const pick = (e: Engine) => {
    setEngine(e);
    try {
      localStorage.setItem("nea-si-engine", e);
    } catch {}
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const history = msgs.slice(-8).map((m) => (m.role === "user" ? { role: "user" as const, text: m.text } : { role: "assistant" as const, text: m.reply.text }));
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setQ("");
    setBusy(true);
    let placed = false;
    const put = (r: Reply) =>
      setMsgs((m) => {
        if (!placed) {
          placed = true;
          return [...m, { role: "nea", reply: r }];
        }
        const copy = m.slice();
        copy[copy.length - 1] = { role: "nea", reply: r };
        return copy;
      });
    const reply = await ask(t, context, engine, history, put);
    put(reply);
    setBusy(false);
  };

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 60);
    if (initialQuery && handled.current !== nonce) {
      handled.current = nonce;
      send(initialQuery);
    }
    // lock page scroll only when the chat covers the screen (phones)
    if (!window.matchMedia("(max-width: 639px)").matches) return;
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
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/15 p-0 backdrop-blur-[2px] sm:items-end sm:justify-end sm:bg-transparent sm:p-6 sm:pb-28 sm:backdrop-blur-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Nea SI chat"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            data-lenis-prevent
            className="aurora-border relative flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border border-ink/10 bg-white shadow-[0_60px_160px_-40px_rgba(var(--shadow-tint),0.45)] sm:h-[min(720px,calc(100dvh-150px))] sm:w-[440px] sm:rounded-[28px]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <Orb active={busy} />
                <div>
                  <p className="font-display text-[20px] leading-none tracking-tight">Nea SI</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-graphite">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--viz-good))]" /> Skin Intelligence · online{context ? ` · ${context}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {msgs.length > 0 && (
                  <button onClick={() => setMsgs([])} className="grid h-9 w-9 place-items-center rounded-full text-graphite hover:bg-white hover:text-ink" aria-label="New chat" title="New chat">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white/60 text-graphite hover:text-ink" aria-label="Close (Esc)">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-2.5 sm:px-7">
              <span className="text-[12px] text-graphite">Answer with</span>
              <div role="radiogroup" aria-label="Choose the Nea SI engine" className="relative flex rounded-full bg-ink/[0.06] p-1">
                {ENGINES.map((x) => (
                  <button key={x.id} role="radio" aria-checked={engine === x.id} onClick={() => pick(x.id)} title={ready[x.id] ? `Answers written by ${x.label}` : `${x.label} is not connected yet; Nea SI will use the other engine`} className={cn("relative rounded-full px-3.5 py-1 text-[12.5px] transition", engine === x.id ? "text-white" : "text-ink/70 hover:text-ink")}>
                    {engine === x.id && <motion.span layoutId="si-engine" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                    <span className="relative flex items-center gap-1.5">
                      {x.label}
                      {!ready[x.id] && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {!ready[engine] && (
              <p role="status" className="border-b border-ink/10 bg-porcelain px-5 py-2 text-[12px] text-graphite sm:px-7">
                {ENGINES.find((x) => x.id === engine)?.label} isn’t connected yet, so {ENGINES.find((x) => x.id !== engine)?.label} is answering for now.
              </p>
            )}
            {hint && (
              <div role="status" className="border-b border-amber-300/50 bg-amber-50 px-5 py-2.5 text-[12.5px] leading-snug text-amber-900 sm:px-7">
                <strong className="font-semibold">Setup (only you see this in development):</strong> {hint}
              </div>
            )}
            <div ref={scroller} className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7" aria-live="polite">
              {msgs.length === 0 && (
                <div className="pt-2">
                  <div className="max-w-[90%] rounded-3xl rounded-tl-lg bg-porcelain px-5 py-4 text-[15px] leading-relaxed text-ink shadow-sm">
                    Hi, I’m <strong className="font-semibold">Nea SI</strong>, NEA’s Skin Intelligence. I can explain what is behind a concern, match you to a program, price a plan within your budget, compare tests, and book you in.
                  </div>
                  <p className="mt-6 text-[12.5px] text-graphite">Try one of these</p>
                  <div className="mt-2 grid gap-2">
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
                    <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-ink px-5 py-3 text-[15px] text-white">{m.text}</p>
                  </div>
                ) : (
                  <AssistantReply key={i} reply={m.reply} onClose={onClose} onFollow={send} last={i === msgs.length - 1} />
                )
              )}
              {busy && msgs[msgs.length - 1]?.role === "user" && (
                <div className="flex items-center gap-3 text-[14px] text-graphite">
                  <NeaSiIcon className="h-4 w-4 text-flora" thinking /> Nea SI is reading NEA’s data with {ENGINES.find((x) => x.id === engine)?.label}…
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-ink/10 p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-3xl border border-ink/10 bg-porcelain/70 p-2 pl-4 focus-within:border-flora/50">
                <label htmlFor="nea-ai-input" className="sr-only">
                  Ask Nea SI
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
                  placeholder="Message Nea SI…"
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[16px] text-ink outline-none placeholder:text-graphite/80"
                />
                <button type="button" onClick={toggleMic} className={cn("grid h-11 w-11 place-items-center rounded-full transition", listening ? "bg-orchid/30 text-ink" : "text-graphite hover:text-ink")} aria-label={listening ? "Stop voice input" : "Speak your question"}>
                  <Mic className="h-5 w-5" />
                </button>
                <button type="submit" disabled={busy || !q.trim()} className="btn-primary !h-11 !w-11 !p-0 disabled:opacity-40" aria-label="Send">
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[11px] text-graphite/80">Nea SI gives general information, not medical advice. Press N anywhere to open, Esc to close.</p>
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
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/70 text-ink">
        <NeaSiIcon className="h-6 w-6" thinking={active} />
      </span>
    </span>
  );
}

function AssistantReply({ reply, onClose, onFollow, last }: { reply: Reply; onClose: () => void; onFollow: (q: string) => void; last: boolean }) {
  const book = useBooking();
  const firstSlug = (reply.plan?.items[0]?.href ?? reply.sources.find((x) => /\/(treatments|programs)\//.test(x.href))?.href ?? "").split("/").pop() || undefined;
  const follow = followUps(reply);
  const doneText = reply.done !== false;

  return (
    <div className="space-y-4">
      {reply.text ? <RichText text={reply.text} onClose={onClose} typing={!doneText} /> : !doneText && <Thinking />}
      {doneText && reply.fellBack && (
        <p className="text-[11.5px] text-graphite/80">
          {reply.model === "gemini" ? "Answered by Gemini because Xevyo isn’t available right now." : reply.model === "xevyo" ? "Answered by Xevyo because Gemini isn’t available right now." : "Answered from NEA’s own knowledge because the AI engines are busy right now."}
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2">
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
          <button onClick={() => book.open(firstSlug)} className="btn-light !px-4 !py-2 !text-[13px]">
            <CalendarHeart className="h-4 w-4" /> Book
          </button>
        </div>
      )}
      {doneText && last && follow.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {follow.map((f) => (
            <button key={f} onClick={() => onFollow(f)} className="chip !py-1.5 !text-[12.5px] hover:border-ink/20 hover:text-ink">
              <Sparkles className="h-3 w-3 text-flora" /> {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Smart follow-up questions based on what the answer was about. */
function followUps(r: Reply): string[] {
  const kinds = new Set(r.sources.map((s) => s.kind));
  const top = r.sources[0]?.title;
  const out: string[] = [];
  if (r.plan) out.push("Can I spread this over monthly payments?", "What happens at the first visit?");
  if (kinds.has("Treatment") && top) out.push(`How many sessions of ${top} will I need?`, `What is the downtime for ${top}?`);
  if (kinds.has("Program") && top) out.push(`What results can I expect from the ${top}?`);
  if (kinds.has("Test")) out.push("How is the sample collected?", "How long until I get results?");
  if (kinds.has("Body")) out.push("Which test measures this?");
  if (!out.length) out.push("What does the free skin scan show?", "Build me a plan under $1,500");
  return out.slice(0, 3);
}

type Part = { t: string; href?: string; b?: boolean };
type Line = { bullet: boolean; parts: Part[] };

/** Tiny, safe markdown: paragraphs, "- " bullets, **bold** and [links](/path). Everything else stays plain text. */
function rich(text: string): Line[] {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((raw) => raw.trimEnd())
    .filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim()))
    .map((raw) => {
      const bullet = /^\s*([-*•]|\d+\.)\s+/.test(raw);
      const line = raw.replace(/^\s*([-*•]|\d+\.)\s+/, "").replace(/^#+\s*/, "");
      const parts: Part[] = [];
      const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
      let at = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        if (m.index > at) parts.push({ t: line.slice(at, m.index) });
        if (m[1]) parts.push({ t: m[1], href: m[2] });
        else parts.push({ t: m[3], b: true });
        at = m.index + m[0].length;
      }
      if (at < line.length) parts.push({ t: line.slice(at) });
      return { bullet, parts };
    });
}

const safeHref = (h: string) => (h.startsWith("/") && !h.startsWith("//") ? h : /^https:\/\/(neamedicalaesthetic\.janeapp\.com|neaprecisionskin\.com)/.test(h) ? h : null);

function RichText({ text, onClose, typing }: { text: string; onClose: () => void; typing: boolean }) {
  const lines = useMemo(() => rich(text), [text]);
  let left = Infinity;
  return (
    <div className="space-y-2 text-[16px] leading-relaxed text-ink">
      {lines.map((l, i) => {
        if (left <= 0) return null;
        const shown = l.parts.map((p, j) => {
          if (left <= 0) return null;
          const t = p.t.slice(0, left);
          left -= p.t.length;
          const reel = p.href?.match(/^#reel-(\d+)$/);
          if (reel) {
            return (
              <button key={j} onClick={() => window.dispatchEvent(new CustomEvent("nea:reels", { detail: { index: Number(reel[1]) } }))} className="inline-flex items-center gap-1 rounded-full bg-flora/10 px-2 py-0.5 align-baseline text-[0.92em] text-flora hover:bg-flora/20">
                <Play className="h-3 w-3" /> {t}
              </button>
            );
          }
          const href = p.href ? safeHref(p.href) : null;
          if (href) {
            const ext = href.startsWith("http");
            return ext ? (
              <a key={j} href={href} target="_blank" rel="noreferrer" className="text-flora underline underline-offset-4">
                {t}
              </a>
            ) : (
              <Link key={j} href={href} onClick={onClose} className="text-flora underline underline-offset-4">
                {t}
              </Link>
            );
          }
          return p.b ? (
            <strong key={j} className="font-semibold">
              {t}
            </strong>
          ) : (
            <span key={j}>{t}</span>
          );
        });
        const empty = !l.parts.length;
        return empty ? (
          <div key={i} className="h-1" />
        ) : l.bullet ? (
          <div key={i} className="flex gap-2.5">
            <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-flora" />
            <p>{shown}</p>
          </div>
        ) : (
          <p key={i}>{shown}</p>
        );
      })}
      {typing && <span className="inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-flora" />}
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Nea SI is writing">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-2 w-2 rounded-full bg-flora/70" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}
