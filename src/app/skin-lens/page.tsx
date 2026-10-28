import { PageHero } from "@/components/sections/page-hero";
import { SkinLens } from "@/components/lens/skin-lens";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Nea SI Skin Lens: see what your skin shows, in seconds",
  description: "Take a selfie and Nea SI marks the visible signs on your photo, explains them in plain words and lines up the NEA treatments that fit, with prices and booking. Your photo is not stored.",
  path: "/skin-lens",
});

export default function SkinLensPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Skin Lens", path: "/skin-lens" }]}
        title="Your skin, read by Nea SI in five seconds."
        lede="One selfie. Nea SI marks what is visible on your photo, explains it in plain words, and shows which NEA treatments fit, with prices and a Book button. Your photo is never stored."
      />
      <section className="pb-28">
        <div className="container">
          <SkinLens />
        </div>
      </section>
    </>
  );
}
