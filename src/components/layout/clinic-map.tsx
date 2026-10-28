import { HoloMap } from "@/components/map/holo-map";
import { cn } from "@/lib/utils";

/** The clinic map: NEA's own interactive Holo Map (touch, pinch, 3D), no Google embed. */
export function ClinicMap({ className }: { query?: string; className?: string }) {
  return <HoloMap className={cn("h-full min-h-[520px] w-full", className)} />;
}
