"use client";
import { useEffect } from "react";
import { useAi } from "./ai-provider";

/** /ask?q=… (used by search engines, old links and the sitemap's SearchAction) opens the AI with that question. */
export function AskAutoOpen() {
  const ai = useAi();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) ai.open({ query: q.slice(0, 500) });
  }, [ai]);
  return null;
}
