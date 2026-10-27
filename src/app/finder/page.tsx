import { PageHero } from "@/components/sections/page-hero";
import { SkinFinder } from "@/components/sections/skin-finder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Skin Finder: two questions, the right program", description: "Tell us your main concern and your age, and we suggest where to start at NEA.", path: "/finder" });

export default function FinderPage() {
  return (
    <>
      <PageHero trail={[{ name: "Skin Finder", path: "/finder" }]} title="Two questions. The right place to start." />
      <section className="pb-28">
        <div className="container">
          <SkinFinder />
        </div>
      </section>
    </>
  );
}
