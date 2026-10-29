"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarHeart, Clock3, Search, UserRound, Video, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { JANE, janeConsult, janeDisciplines, janeFor, janeItems, janeStaff, janeStaffUrl, janeUrl, janeVirtual } from "@/content/jane";
import { cn, money } from "@/lib/utils";

type Ctx = { open: (key?: string, title?: string) => void };
const BookingCtx = createContext<Ctx>({ open: () => {} });
export const useBooking = () => useContext(BookingCtx);

/**
 * Booking that lands on the right service in Jane (the booking software; never named in the UI).
 * Every "Book" opens this sheet with the Jane services that match the page you are on,
 * each one deep-linked to its own Jane calendar.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; page?: string; title?: string }>({ open: false });
  const open = useCallback((page?: string, title?: string) => setState({ open: true, page, title }), []);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ key?: string; title?: string }>).detail ?? {};
      open(d.key, d.title);
    };
    window.addEventListener("nea:book", on);
    return () => window.removeEventListener("nea:book", on);
  }, [open]);
  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <BookingSheet open={state.open} pageKey={state.page} title={state.title} onClose={() => setState((s) => ({ ...s, open: false }))} />
    </BookingCtx.Provider>
  );
}

/** Button that opens the booking sheet for a page. Safe to drop into server components. */
export function BookButton({ slug, title, className, children, variant = "primary" }: { slug?: string; title?: string; className?: string; children?: ReactNode; variant?: "primary" | "ghost" | "light" }) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={() => open(slug, title)} className={cn(variant === "primary" ? "btn-primary" : variant === "light" ? "btn-light" : "btn-ghost", className)}>
      {children ?? (
        <>
          <CalendarHeart className="h-4 w-4" /> Book{title ? ` ${title}` : ""}
        </>
      )}
    </button>
  );
}

function BookingSheet({ open, pageKey, title, onClose }: { open: boolean; pageKey?: string; title?: string; onClose: () => void }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!open) return;
    setQ("");
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const matched = useMemo(() => (pageKey ? janeFor(pageKey).filter((i) => !(i.d === janeConsult.d && i.id === janeConsult.id)) : janeFor("popular")), [pageKey]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return janeItems
      .filter((i) => `${i.name} ${janeDisciplines[i.d].name}`.toLowerCase().includes(t))
      .slice(0, 12)
      .map((i) => ({ ...i, url: janeUrl(i), discipline: janeDisciplines[i.d].name, by: janeDisciplines[i.d].by }));
  }, [q]);
  const list = q.trim() ? results : matched;
  const heading = q.trim() ? "Matching services" : pageKey ? "For this page" : "Most booked";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/25 backdrop-blur-md sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book at NEA"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            data-lenis-prevent
            className="surface max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] p-6 sm:rounded-[32px] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Book online</p>
                <h2 className="mt-2 font-display text-[2.2rem] leading-none text-ink">{title ? <>Book {title}</> : <>Book at NEA</>}</h2>
                <p className="mt-2 text-[14px] text-graphite">Pick a service and its calendar opens directly. Times update live.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/70 text-graphite hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
              <Search className="h-4 w-4 text-graphite" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all 94 NEA services, e.g. Botox, peel, DEXA" className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-graphite/70 focus:outline-none" />
            </label>

            {list.length > 0 && <p className="mt-5 text-[12.5px] text-graphite">{heading}</p>}
            {list.length > 0 && (
              <ul className="mt-2 space-y-2">
                {list.map((i) => (
                  <li key={`${i.d}-${i.id}`}>
                    <a href={i.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/[0.07] bg-white/70 px-4 py-3.5 transition hover:border-ink/20 hover:bg-white">
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-ink">{i.name}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-graphite">
                          <span>{i.discipline}</span>
                          {i.min && (
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3 w-3" /> {i.min} min
                            </span>
                          )}
                          <span className="hidden sm:inline">with {i.by}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {i.price ? <span className="tabular font-display text-[19px] text-ink">{money(i.price)}</span> : null}
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition group-hover:scale-110">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {q.trim() && results.length === 0 && <p className="mt-5 text-[14px] text-graphite">No service matches that. Book a free consultation and we will guide you.</p>}

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a href={janeUrl(janeConsult)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-gradient-to-br from-[var(--glow-a)] to-[var(--glow-b)] px-4 py-3.5 transition hover:brightness-105">
                <CalendarHeart className="h-5 w-5 text-flora" />
                <span>
                  <span className="block text-[14.5px] font-medium text-ink">Not sure? Consultation</span>
                  <span className="block text-[12px] text-graphite">30 min · we match you to the right plan</span>
                </span>
              </a>
              <a href={janeUrl(janeVirtual)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/70 px-4 py-3.5 transition hover:bg-white">
                <Video className="h-5 w-5 text-flora" />
                <span>
                  <span className="block text-[14.5px] font-medium text-ink">Virtual consultation</span>
                  <span className="block text-[12px] text-graphite">From home, on video</span>
                </span>
              </a>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-[12.5px] text-graphite">Or book with a practitioner</p>
              <div className="flex flex-wrap gap-2">
                {janeStaff.map((s) => (
                  <a key={s.id} href={janeStaffUrl(s.id)} target="_blank" rel="noreferrer" className="chip !py-1.5 !text-[13px] hover:text-ink">
                    <UserRound className="h-3.5 w-3.5" /> {s.name}
                  </a>
                ))}
              </div>
            </div>
            <a href={JANE} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1 text-[13px] text-graphite underline-offset-4 hover:text-ink hover:underline">
              See every service <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
