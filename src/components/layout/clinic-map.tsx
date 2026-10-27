import { cn } from "@/lib/utils";

/** A real, working Google map of the clinic (no API key needed). */
export function ClinicMap({ query, className }: { query: string; className?: string }) {
  return (
    <iframe
      title="Map to NEA Precision Skin"
      className={cn("h-full min-h-[380px] w-full border-0", className)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`}
      allowFullScreen
    />
  );
}
