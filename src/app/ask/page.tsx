import { Calculator, FlaskConical, PersonStanding, Sparkles, WandSparkles } from "lucide-react";
import { AiPromptBar } from "@/components/ai/ai-prompt-bar";
import { AiQuestionChips } from "@/components/ai/ai-question-chips";
import { AskAutoOpen } from "@/components/ai/ask-auto-open";
import { LazySignal } from "@/components/three/lazy";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Ask NEA AI",
  description: "NEA Intelligence answers questions about treatments, tests, prices, hours and your visit, builds a plan within your budget, and links every answer to its source.",
  path: "/ask",
});

const CAN = [
  { icon: WandSparkles, title: "Builds a plan", text: "Describe your concern and budget; it groups the right program, tests and treatments with a total." },
  { icon: FlaskConical, title: "Finds the right test", text: "Explains BioSkin, BioGut, hormone and vitamin tests with list prices." },
  { icon: PersonStanding, title: "Knows the body", text: "Connects gut, hormones and nutrition to what you see in the mirror." },
  { icon: Calculator, title: "Shows the numbers", text: "Prices, durations and what is included, always linked to the page it came from." },
];

export default function AskPage() {
  return (
    <section className="relative min-h-screen overflow-hidden pb-40 pt-16 md:pt-24">
      <LazySignal className="pointer-events-none absolute inset-0 opacity-30" lines={90} />
      <AskAutoOpen />
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="chip">
            <Sparkles className="h-3.5 w-3.5 text-flora" /> NEA Intelligence
          </p>
          <h1 className="mt-6 text-display-lg font-semibold text-white">
            Ask <span className="aurora-text">anything.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lede text-graphite">Treatments, tests, prices, preparation, hours. Press N on any page to open it.</p>
          <AiPromptBar className="mx-auto mt-10 max-w-2xl text-left" placeholder="e.g. I have melasma and a $1,500 budget" />
          <div className="mt-5 flex justify-center">
            <AiQuestionChips questions={["Why do I keep breaking out?", "Is Fotona safe for brown skin?", "What does the free scan show?", "Hair thinning plan under $2,500", "What are your hours?"]} />
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAN.map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface rounded-[28px] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-flora">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-graphite">{text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-[12px] text-graphite/80">Answers come from NEA’s own programs, treatments, tests and FAQs. It is not medical advice; your practitioner confirms every plan.</p>
      </div>
    </section>
  );
}
