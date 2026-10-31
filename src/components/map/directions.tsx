"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, Car, Footprints, Loader2, LocateFixed, MapPin, Navigation, Search, TrainFront, X } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Spot = { label: string; sub?: string; lat?: number; lng?: number };
type Mode = "driving" | "transit" | "walking" | "bicycling";
const MODES: { id: Mode; label: string; icon: typeof Car; kmh: number; factor: number }[] = [
  { id: "driving", label: "Drive", icon: Car, kmh: 38, factor: 1.3 },
  { id: "transit", label: "Transit", icon: TrainFront, kmh: 20, factor: 1.4 },
  { id: "walking", label: "Walk", icon: Footprints, kmh: 4.8, factor: 1.25 },
  { id: "bicycling", label: "Bike", icon: Bike, kmh: 15, factor: 1.3 },
];
const NEA = { lat: site.address.lat, lng: site.address.lng };
const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Directions to NEA: type your address (suggestions as you type), or use your location,
 * pick how you're travelling, and open the route in Google Maps, Apple Maps or Waze.
 * Address suggestions come from OpenStreetMap; nothing is stored by NEA.
 */
export function Directions({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Spot[]>([]);
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState<Spot | null>(null);
  const [mode, setMode] = useState<Mode>("driving");
  const [locErr, setLocErr] = useState<string | null>(null);
  const timer = useRef<number>(0);
  const abort = useRef<AbortController | null>(null);

  // suggestions, at most one request a second (OpenStreetMap's fair-use rule), Calgary first
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (from || q.trim().length < 4) return setList([]);
    timer.current = window.setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      setBusy(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&limit=5&countrycodes=ca&viewbox=-114.35,51.25,-113.8,50.84&q=${encodeURIComponent(q)}`;
        const r = (await fetch(url, { signal: abort.current.signal, headers: { "Accept-Language": "en" } }).then((x) => x.json())) as { display_name: string; lat: string; lon: string; name?: string }[];
        setList(r.map((x) => ({ label: x.name || x.display_name.split(",")[0], sub: x.display_name.split(",").slice(1, 4).join(","), lat: +x.lat, lng: +x.lon })));
      } catch {
        /* offline or busy: the typed address still works */
      } finally {
        setBusy(false);
      }
    }, 900);
  }, [q, from]);

  const locate = () => {
    setLocErr(null);
    if (!navigator.geolocation) return setLocErr("Your browser can’t share location.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false);
        setFrom({ label: "My location", lat: p.coords.latitude, lng: p.coords.longitude });
        setQ("My location");
      },
      () => {
        setBusy(false);
        setLocErr("Location wasn’t shared. Type your address instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const origin = from?.lat !== undefined ? `${from.lat},${from.lng}` : (from?.label ?? q).trim();
  const ready = origin.length > 0;
  const m = MODES.find((x) => x.id === mode)!;
  const km = from?.lat !== undefined ? dist({ lat: from.lat, lng: from.lng! }, NEA) : null;
  const mins = km !== null ? Math.max(2, Math.round(((km * m.factor) / m.kmh) * 60)) : null;
  const dest = encodeURIComponent(site.mapsQuery);
  const open = (app: "google" | "apple" | "waze") => {
    const o = encodeURIComponent(origin);
    const url =
      app === "google"
        ? `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${dest}&travelmode=${mode}`
        : app === "apple"
          ? `https://maps.apple.com/?saddr=${o}&daddr=${dest}&dirflg=${{ driving: "d", transit: "r", walking: "w", bicycling: "d" }[mode]}`
          : `https://waze.com/ul?ll=${NEA.lat},${NEA.lng}&navigate=yes`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className={cn("rounded-[28px] border border-ink/[0.08] bg-white p-4 shadow-[0_30px_80px_-50px_rgba(var(--shadow-tint),0.7)] sm:p-5", className)}>
      <p className="flex items-center gap-2 font-display text-[1.25rem] text-ink">
        <Navigation className="h-4 w-4 text-flora" /> Get directions
      </p>

      {/* from */}
      <div className="relative mt-3">
        <label className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-porcelain/70 px-3.5 py-3 focus-within:border-ink/30">
          <Search className="h-4 w-4 shrink-0 text-graphite" />
          <input
            value={q}
            onChange={(e) => (setQ(e.target.value), setFrom(null))}
            placeholder="Your address or postal code"
            aria-label="Your address or postal code"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-graphite/70"
          />
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-graphite" /> : q && <button onClick={() => (setQ(""), setFrom(null))} aria-label="Clear"><X className="h-4 w-4 text-graphite" /></button>}
        </label>
        <AnimatePresence>
          {list.length > 0 && !from && (
            <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
              {list.map((s) => (
                <li key={`${s.lat},${s.lng}`}>
                  <button onClick={() => (setFrom(s), setQ(s.label), setList([]))} className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-porcelain">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flora" />
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] text-ink">{s.label}</span>
                      {s.sub && <span className="block truncate text-[12px] text-graphite">{s.sub}</span>}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-ink/[0.06] px-3.5 py-1.5 text-[10.5px] text-graphite">Suggestions © OpenStreetMap contributors</li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <button onClick={locate} className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-flora hover:underline">
        <LocateFixed className="h-4 w-4" /> Use my location
      </button>
      {locErr && <p className="mt-1 text-[12.5px] text-graphite">{locErr}</p>}

      {/* how */}
      <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl bg-ink/[0.04] p-1">
        {MODES.map((x) => (
          <button key={x.id} onClick={() => setMode(x.id)} aria-pressed={mode === x.id} className={cn("flex flex-col items-center gap-1 rounded-xl py-2 text-[12px] transition", mode === x.id ? "bg-white text-ink shadow-sm" : "text-graphite hover:text-ink")}>
            <x.icon className="h-4 w-4" />
            {x.label}
          </button>
        ))}
      </div>

      {km !== null && (
        <p className="mt-3 text-[13.5px] text-ink">
          About <span className="font-semibold">{km.toFixed(1)} km</span> away, roughly <span className="font-semibold">{mins} min</span> by {m.label.toLowerCase()}.{" "}
          <span className="text-graphite">Your map app shows the exact route.</span>
        </p>
      )}

      {/* go */}
      <button onClick={() => open("google")} disabled={!ready} className="btn-light mt-4 w-full !py-3.5 disabled:opacity-40">
        <Navigation className="h-4 w-4" /> Open in Google Maps
      </button>
      <div className="mt-2 flex justify-center gap-4 text-[13px]">
        <button onClick={() => open("apple")} disabled={!ready} className="text-graphite hover:text-ink disabled:opacity-40">
          Apple Maps
        </button>
        <span className="text-ink/20">·</span>
        <button onClick={() => open("waze")} className="text-graphite hover:text-ink">
          Waze
        </button>
      </div>
      <p className="mt-3 text-center text-[12px] text-graphite">
        {site.address.line1}, {site.address.city}
      </p>
    </div>
  );
}
