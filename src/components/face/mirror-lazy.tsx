"use client";
import dynamic from "next/dynamic";

/** Loads the AR mirror only in the browser, after the page is ready, so it never slows the first paint. */
export const MirrorLazy = dynamic(() => import("./mirror").then((m) => m.MirrorHost), { ssr: false });
