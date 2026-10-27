import { Coverflow } from "@/components/ui/coverflow";
import { programs } from "@/content/programs";
import { ProgramCard } from "./program-card";

export function ProgramsCarousel() {
  return (
    <Coverflow label="NEA programs" cardWidth={380}>
      {programs.map((p) => (
        <ProgramCard key={p.slug} p={p} />
      ))}
    </Coverflow>
  );
}
