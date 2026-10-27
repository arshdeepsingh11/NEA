"use client";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ThemeName = "pearl" | "sand";
export const THEMES: { id: ThemeName; name: string; note: string; swatch: [string, string, string] }[] = [
  { id: "pearl", name: "Pearl & blush", note: "Clinical pearl, soft blush and lilac", swatch: ["#FDFBFC", "#F6CAD8", "#D6CDF7"] },
  { id: "sand", name: "Sand & gold", note: "Warm ivory, sand and champagne gold", swatch: ["#FBF8F3", "#EAD8B6", "#8A6424"] },
];
const KEY = "nea-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("pearl");
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "sand" || t === "pearl") setThemeState(t);
    const on = () => setThemeState((document.documentElement.dataset.theme as ThemeName) ?? "pearl");
    window.addEventListener("nea:theme", on);
    return () => window.removeEventListener("nea:theme", on);
  }, []);
  const setTheme = useCallback((t: ThemeName) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(KEY, t);
    } catch {}
    window.dispatchEvent(new Event("nea:theme"));
  }, []);
  return { theme, setTheme, toggle: () => setTheme(theme === "pearl" ? "sand" : "pearl") };
}

/** Two-tone dot used as the dock icon: shows the theme you would switch to. */
export function ThemeDot({ theme }: { theme: ThemeName }) {
  const next = THEMES.find((t) => t.id !== theme)!;
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill={next.swatch[1]} stroke="currentColor" strokeOpacity="0.25" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill={next.swatch[2]} />
    </svg>
  );
}

/** Large swatch picker (More sheet). */
export function ThemePicker({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-checked={theme === t.id}
          onClick={() => setTheme(t.id)}
          className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition", theme === t.id ? "border-ink bg-white" : "border-ink/10 bg-white/50 hover:bg-white")}
        >
          <span className="flex -space-x-2">
            {t.swatch.map((c) => (
              <span key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
            ))}
          </span>
          <span>
            <span className="block text-[15px] text-ink">{t.name}</span>
            <span className="block text-[12.5px] text-graphite">{t.note}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
