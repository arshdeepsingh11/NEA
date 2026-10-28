"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AiOverlay } from "./ai-overlay";
import { ChatLauncher } from "./chat-launcher";

type OpenOptions = { query?: string; context?: string };
type Ctx = { open: (o?: OpenOptions) => void; close: () => void; isOpen: boolean };

const AiContext = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const useAi = () => useContext(AiContext);

const isTyping = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
};

/** Makes Nea SI (Skin Intelligence) available everywhere. Press N (when not typing) to open it. */
export function AiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; opts: OpenOptions; nonce: number }>({ open: false, opts: {}, nonce: 0 });

  const open = useCallback((o: OpenOptions = {}) => setState((s) => ({ open: true, opts: o, nonce: s.nonce + 1 })), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        setState((s) => (s.open ? s : { open: true, opts: {}, nonce: s.nonce + 1 }));
      }
      if (e.key === "Escape") close();
    };
    const onOpen = (e: Event) => open((e as CustomEvent<OpenOptions>).detail ?? {});
    window.addEventListener("keydown", onKey);
    window.addEventListener("nea:ai", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nea:ai", onOpen);
    };
  }, [open, close]);

  return (
    <AiContext.Provider value={{ open, close, isOpen: state.open }}>
      {children}
      <ChatLauncher hidden={state.open} onOpen={() => open()} />
      <AiOverlay open={state.open} onClose={close} initialQuery={state.opts.query} context={state.opts.context} nonce={state.nonce} />
    </AiContext.Provider>
  );
}

/** Open the assistant from anywhere, including server-rendered markup via a tiny client button. */
export const openAi = (o: OpenOptions = {}) => window.dispatchEvent(new CustomEvent("nea:ai", { detail: o }));
