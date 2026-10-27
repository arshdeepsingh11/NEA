"use client";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ACGT";
const randomString = (n: number) => Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

/** Encrypted-matrix card that decodes around the cursor (Aceternity "Evervault Card"). */
export function EvervaultCard({ children, className }: { children: ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [str, setStr] = useState("");

  useEffect(() => setStr(randomString(1800)), []);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    setStr(randomString(1800));
  };

  const mask = useMotionTemplate`radial-gradient(240px at ${mx}px ${my}px, white, transparent)`;
  const style = { maskImage: mask, WebkitMaskImage: mask };

  return (
    <div onMouseMove={onMove} className={cn("group/ev relative overflow-hidden rounded-3xl border border-white/10 bg-abyss", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 [mask-image:linear-gradient(white,transparent)] group-hover/ev:opacity-50" />
        <motion.div className="absolute inset-0 bg-gradient-to-br from-flora to-lumen opacity-0 transition duration-500 group-hover/ev:opacity-100" style={style} />
        <motion.div className="absolute inset-0 opacity-0 mix-blend-overlay group-hover/ev:opacity-100" style={style}>
          <p className="absolute inset-x-0 h-full whitespace-pre-wrap break-words font-mono text-[11px] font-bold leading-4 text-white">{str}</p>
        </motion.div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
