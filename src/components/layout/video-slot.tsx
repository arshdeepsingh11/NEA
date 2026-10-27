"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { cn, nea } from "@/lib/utils";

/**
 * Reserved space for NEA's own videos. Drop an .mp4 into /public/videos
 * with the matching file name and it plays automatically (muted, looping).
 */
export function VideoSlot({ file, poster, label, className, rounded = true }: { file: string; poster?: string; label: string; className?: string; rounded?: boolean }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-abyss", rounded && "rounded-4xl", className)}>
      {!missing && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={`/videos/${file}`}
          poster={poster ? nea(poster) : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setMissing(true)}
          aria-label={label}
        />
      )}
      {missing && (
        <div className="absolute inset-0 grid place-items-center">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nea(poster)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          )}
          <div className="relative flex flex-col items-center gap-3 text-center text-white">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
              <Play className="h-6 w-6 translate-x-0.5" />
            </span>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-white/55">Add /public/videos/{file}</span>
          </div>
        </div>
      )}
    </div>
  );
}
