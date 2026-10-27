"use client";
import { Sparkles } from "lucide-react";
import { useAi } from "./ai-provider";

/** Starter questions that open NEA Intelligence already asking them. */
export function AiQuestionChips({ questions, context }: { questions: string[]; context?: string }) {
  const ai = useAi();
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q) => (
        <button key={q} onClick={() => ai.open({ query: q, context })} className="chip !py-1.5 !text-[13px] transition hover:border-white/25 hover:text-white">
          <Sparkles className="h-3 w-3 text-flora" />
          {q}
        </button>
      ))}
    </div>
  );
}
