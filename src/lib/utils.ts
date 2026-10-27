import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Full URL for an image hosted in NEA's existing WordPress media library. */
export function nea(path: string) {
  if (path.startsWith("http")) return path;
  return `https://neaprecisionskin.com/wp-content/uploads/${path}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function money(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}
