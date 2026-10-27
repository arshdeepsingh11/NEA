"use client";
import DottedMap from "dotted-map";
import { useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MapPoint = { name: string; lat: number; lng: number; note?: string };

const W = 800;
const H = 400;
const project = (lat: number, lng: number) => ({ x: (lng + 180) * (W / 360), y: (90 - lat) * (H / 180) });

/**
 * Digital world map — a high-density dotted map with animated great-circle
 * style arcs from a hub, hoverable nodes and a travelling pulse on each route.
 */
export function WorldMap({ hub, points, className, dark = true }: { hub: MapPoint; points: MapPoint[]; className?: string; dark?: boolean }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<MapPoint | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { once: true, margin: "-80px" });

  const svg = useMemo(() => {
    const map = new DottedMap({ height: 110, grid: "diagonal" });
    return map.getSVG({ radius: 0.22, color: dark ? "#FFFFFF3A" : "#15191C33", shape: "circle", backgroundColor: "transparent" });
  }, [dark]);

  const h = project(hub.lat, hub.lng);
  const arc = (p: MapPoint) => {
    const e = project(p.lat, p.lng);
    const mx = (h.x + e.x) / 2;
    const my = Math.min(h.y, e.y) - Math.abs(e.x - h.x) * 0.22 - 20;
    return `M ${h.x} ${h.y} Q ${mx} ${my} ${e.x} ${e.y}`;
  };

  return (
    <div ref={wrap} className={cn("relative aspect-[2/1] w-full select-none", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt="" aria-hidden className="pointer-events-none h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`Map of connections from ${hub.name}`}>
        <defs>
          <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7fe0c8" stopOpacity="0" />
            <stop offset="12%" stopColor="#7fe0c8" stopOpacity="1" />
            <stop offset="88%" stopColor="#9d9bff" stopOpacity="1" />
            <stop offset="100%" stopColor="#9d9bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.map((p, i) => {
          const d = arc(p);
          return (
            <g key={p.name}>
              <path
                d={d}
                fill="none"
                stroke="url(#arc-grad)"
                strokeWidth={1.1}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={reduce || inView ? 0 : 1}
                style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(0.65,0,0.35,1) ${0.25 * i}s` }}
              />
              {!reduce && (
                <circle r={2.2} fill="#fff">
                  <animateMotion dur={`${3.2 + i * 0.35}s`} repeatCount="indefinite" path={d} begin={`${0.25 * i + 1.6}s`} />
                </circle>
              )}
            </g>
          );
        })}
        {[hub, ...points].map((p, i) => {
          const { x, y } = project(p.lat, p.lng);
          const isHub = i === 0;
          return (
            <g key={p.name} onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p)} onBlur={() => setHover(null)} tabIndex={0} className="cursor-pointer outline-none">
              <circle cx={x} cy={y} r={isHub ? 4.2 : 2.8} fill={isHub ? "#7fe0c8" : "#fff"} />
              <circle cx={x} cy={y} r={isHub ? 4.2 : 2.8} fill="none" stroke={isHub ? "#7fe0c8" : "#fff"} strokeOpacity={0.6}>
                {!reduce && (
                  <>
                    <animate attributeName="r" from={isHub ? 4 : 2.6} to={isHub ? 16 : 10} dur="2.2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" from="0.6" to="0" dur="2.2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </>
                )}
              </circle>
              <circle cx={x} cy={y} r={12} fill="transparent" />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-xl border border-white/15 bg-abyss/90 px-3 py-2 text-xs text-white shadow-xl backdrop-blur"
          style={{ left: `${(project(hover.lat, hover.lng).x / W) * 100}%`, top: `${(project(hover.lat, hover.lng).y / H) * 100}%` }}
        >
          <div className="font-medium">{hover.name}</div>
          {hover.note && <div className="text-white/60">{hover.note}</div>}
        </div>
      )}
    </div>
  );
}
