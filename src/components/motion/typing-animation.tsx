"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Typing Animation: types each phrase, pauses, deletes, and moves to the next.
 * Screen readers get the full list once; the animation itself is hidden from them.
 */
export function TypingAnimation({
  words,
  className,
  speed = 55,
  deleteSpeed = 28,
  pause = 1600,
  loop = true,
  caretClassName,
}: {
  words: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
  loop?: boolean;
  caretClassName?: string;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    started.current = true;
    const word = words[i % words.length];
    let t: ReturnType<typeof setTimeout>;
    if (!del && text === word) {
      if (!loop && i === words.length - 1) return;
      t = setTimeout(() => setDel(true), pause);
    } else if (del && text === "") {
      setDel(false);
      setI((v) => v + 1);
    } else {
      t = setTimeout(() => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)), del ? deleteSpeed : speed + Math.random() * 40);
    }
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, deleteSpeed, pause, loop, visible]);

  return (
    <span ref={ref} className={cn("relative", className)}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>
        {text}
        <span className={cn("ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] animate-blink bg-current", caretClassName)} />
      </span>
    </span>
  );
}
