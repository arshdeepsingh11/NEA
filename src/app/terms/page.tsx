import { PageHero } from "@/components/sections/page-hero";
import { Blocks } from "@/components/sections/blocks";
import { termsBlocks } from "@/content/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Terms of Service", description: "Terms for using the NEA Precision Skin website.", path: "/terms" });

export default function TermsPage() {
  return (
    <>
      <PageHero trail={[{ name: "Terms of Service", path: "/terms" }]} title="Terms of Service" />
      <section className="pb-28">
        <div className="container max-w-3xl">
          <Blocks blocks={termsBlocks} />
        </div>
      </section>
    </>
  );
}
