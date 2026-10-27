import * as THREE from "three";

/** Read an "R G B" theme channel variable (e.g. --c-accent) as a THREE.Color. */
export function themeColor(name: string, fallback = "#888888"): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const p = v.split(/[\s,]+/).map(Number);
  if (p.length >= 3 && p.every((n) => Number.isFinite(n))) {
    // channel vars are 0–255; the --holo-* vars are already 0–1
    const k = p.some((n) => n > 1) ? 255 : 1;
    return new THREE.Color().setRGB(p[0] / k, p[1] / k, p[2] / k, THREE.SRGBColorSpace);
  }
  if (v.startsWith("#")) return new THREE.Color(v);
  return new THREE.Color(fallback);
}

/** Subscribe to theme switches (fired by ThemeSwitch). Returns an unsubscribe function. */
export function onThemeChange(fn: () => void) {
  window.addEventListener("nea:theme", fn);
  return () => window.removeEventListener("nea:theme", fn);
}
