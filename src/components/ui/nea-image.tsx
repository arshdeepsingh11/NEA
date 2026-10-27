import Image, { type ImageProps } from "next/image";
import { nea } from "@/lib/utils";

/** next/image wrapper that resolves paths from NEA's media library. */
export function NeaImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={nea(src)} alt={alt} {...rest} />;
}
