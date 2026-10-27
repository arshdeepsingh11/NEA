"use client";
import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadKind = "skin-scan" | "consultation" | "contact" | "partner" | "magazine" | "experience";

type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "select" | "textarea" | "number"; required?: boolean; options?: string[]; placeholder?: string; half?: boolean };

const PRESETS: Record<LeadKind, { fields: Field[]; submit: string; done: string }> = {
  "skin-scan": {
    submit: "Request my scan",
    done: "Request received. We will text or call within one business day to confirm your scan time.",
    fields: [
      { name: "firstName", label: "First name", required: true, half: true },
      { name: "lastName", label: "Last name", required: true, half: true },
      { name: "phone", label: "Mobile", type: "tel", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "age", label: "Age range", type: "select", required: true, half: true, options: ["18–24", "25–34", "35–44", "45–54", "55+"] },
      { name: "concern", label: "Main skin concern", type: "select", required: true, half: true, options: ["Acne or breakouts", "Pigmentation or dark spots", "Lines and firmness", "Redness or rosacea", "Pores and texture", "Hair thinning", "Just curious"] },
      { name: "time", label: "Best time", type: "select", half: false, options: ["Weekday morning", "Weekday afternoon", "Saturday"] },
    ],
  },
  consultation: {
    submit: "Request consultation",
    done: "Thank you. The right member of our team will call you to answer your questions.",
    fields: [
      { name: "firstName", label: "First name", required: true, half: true },
      { name: "lastName", label: "Last name", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone number", type: "tel", required: true, half: true },
      {
        name: "topic",
        label: "What is your consultation in regards to?",
        type: "select",
        required: true,
        options: ["Skin (acne, pigmentation, aging)", "Injectables", "Fotona laser", "Hair restoration", "Body & muscle", "Nutrition & weight loss", "Microbiome testing", "Feminine health", "Something else"],
      },
      { name: "message", label: "Anything we should know?", type: "textarea" },
    ],
  },
  contact: {
    submit: "Send message",
    done: "Message sent. We reply within one business day.",
    fields: [
      { name: "name", label: "Name", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone number", type: "tel" },
      { name: "message", label: "Comment or message", type: "textarea", required: true },
    ],
  },
  partner: {
    submit: "Apply to partner",
    done: "Thanks. We will be in touch to set up your referral link and materials.",
    fields: [
      { name: "business", label: "Business name", required: true, half: true },
      { name: "type", label: "Business type", type: "select", required: true, half: true, options: ["Gym or fitness studio", "Yoga or pilates studio", "Barbershop or salon", "Wedding planner or vendor", "Clinic or health practitioner", "Employer (corporate wellness)", "Other"] },
      { name: "name", label: "Your name", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone", type: "tel", half: true },
      { name: "members", label: "Members or clients (approx.)", type: "number", half: true },
    ],
  },
  magazine: {
    submit: "Send me the magazine",
    done: "Your download is ready below.",
    fields: [
      { name: "name", label: "Name", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true, half: true },
    ],
  },
  experience: {
    submit: "Reserve my spot",
    done: "Request received. We will confirm your time within one business day.",
    fields: [
      { name: "name", label: "Name", required: true, half: true },
      { name: "phone", label: "Mobile", type: "tel", required: true, half: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
  },
};

export function LeadForm({ kind, source, dark, className, after }: { kind: LeadKind; source?: string; dark?: boolean; className?: string; after?: React.ReactNode }) {
  const preset = PRESETS[kind];
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, source, ...data }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Could not send");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send");
    }
  };

  const input = cn(
    "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition focus:ring-2",
    dark ? "border-ink/10 bg-white/60 text-ink placeholder:text-graphite/80 focus:border-ink/20 focus:ring-white/10" : "border-ink/10 bg-white/60 text-ink placeholder:text-graphite/80 focus:border-flora focus:ring-flora/15"
  );

  if (state === "done")
    return (
      <div className={cn("rounded-3xl p-8", dark ? "bg-white/60" : "bg-flora-soft", className)} role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-flora text-ink">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-4 text-lg font-medium">{preset.done}</p>
        {after}
      </div>
    );

  return (
    <form onSubmit={onSubmit} className={cn("grid grid-cols-2 gap-3", className)} noValidate={false}>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {preset.fields.map((f) => (
        <label key={f.name} className={cn("flex flex-col gap-1.5", f.half ? "col-span-2 sm:col-span-1" : "col-span-2")}>
          <span className={cn("text-[13px]", dark ? "text-graphite" : "text-graphite")}>
            {f.label}
            {f.required && <span aria-hidden> *</span>}
          </span>
          {f.type === "select" ? (
            <select name={f.name} required={f.required} defaultValue="" className={input}>
              <option value="" disabled>
                Choose one
              </option>
              {f.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea name={f.name} required={f.required} rows={4} className={input} placeholder={f.placeholder} />
          ) : (
            <input name={f.name} type={f.type ?? "text"} required={f.required} className={input} placeholder={f.placeholder} autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined} />
          )}
        </label>
      ))}
      <div className="col-span-2 mt-2 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className={cn(dark ? "btn-light" : "btn-primary", "min-w-[200px]")}>
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : preset.submit}
        </button>
        <p className={cn("text-[12px]", dark ? "text-graphite/80" : "text-graphite")}>We only use your details to contact you about this request.</p>
      </div>
      {state === "error" && (
        <p role="alert" className="col-span-2 text-sm text-red-600">
          {error}. Please call {"1-403-230-8812"} instead.
        </p>
      )}
    </form>
  );
}
