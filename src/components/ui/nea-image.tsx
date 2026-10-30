"use client";
import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { nea } from "@/lib/utils";

/** Unsplash's CDN resizes on the fly: each screen downloads exactly the width it needs, at high quality. */
const unsplashLoader = ({ src, width, quality }: ImageLoaderProps) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 85}`;

/** next/image wrapper: NEA media-library paths, Unsplash originals (resized by Unsplash) or BioAro product art (direct). */
export function NeaImage({ src, alt, quality, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  if (src.includes("images.unsplash.com")) return <Image loader={unsplashLoader} src={src} alt={alt} quality={quality ?? 85} {...rest} />;
  // BioAro's product art loads straight from bioarolabs.com in the browser. Routing it through the server's image
  // optimizer made the server wait on BioAro (up to 7 s per image) and could freeze the whole site.
  if (src.includes("bioarolabs.com")) return <Image src={src} alt={alt} unoptimized {...rest} />;
  return <Image src={nea(src)} alt={alt} quality={quality ?? 90} {...rest} />;
}
