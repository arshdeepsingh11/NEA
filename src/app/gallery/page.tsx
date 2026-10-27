import { PageHero } from "@/components/sections/page-hero";
import { ScrollSphereGallery } from "@/components/ui/scroll-sphere-gallery";
import { galleryCards } from "@/components/sections/home-chapters";
import { NeaImage } from "@/components/ui/nea-image";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Clinic gallery", description: "Explore recent photos of the NEA Precision Skin clinic space and clients in Calgary NE.", path: "/gallery" });

export default function GalleryPage() {
  return (
    <>
      <PageHero trail={[{ name: "Gallery", path: "/gallery" }]} title="Explore our clinic." lede="Recent photos of the NEA clinic space and our clients. Scroll to turn the sphere, or browse the grid below." />
      <ScrollSphereGallery cards={galleryCards} />
      <section className="chapter">
        <div className="container columns-2 gap-4 md:columns-3 lg:columns-4">
          {galleryCards.map((c, i) => (
            <div key={i} className="relative mb-4 aspect-[3/4] break-inside-avoid overflow-hidden rounded-3xl bg-mist">
              <NeaImage src={c.src} alt={c.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
