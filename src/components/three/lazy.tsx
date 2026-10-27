"use client";
import dynamic from "next/dynamic";

const fallback = () => <div className="h-full w-full" />;

export const LazyPlanet = dynamic(() => import("./planet-system").then((m) => m.PlanetSystem), { ssr: false, loading: fallback });
export const LazySignal = dynamic(() => import("./signal-convergence").then((m) => m.SignalConvergence), { ssr: false, loading: fallback });
export const LazyBeam = dynamic(() => import("./beam-flow").then((m) => m.BeamFlow), { ssr: false, loading: fallback });
export const LazyWorldMap = dynamic(() => import("./world-map").then((m) => m.WorldMap), { ssr: false, loading: fallback });
export const LazyAnatomy = dynamic(() => import("./anatomy-viewer").then((m) => m.AnatomyViewer), { ssr: false, loading: fallback });
