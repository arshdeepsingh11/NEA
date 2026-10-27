import { PageHero } from "@/components/sections/page-hero";
import { Blocks } from "@/components/sections/blocks";
import { privacyBlocks } from "@/content/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How NEA Precision Skin collects, uses and protects your personal information.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <>
      <PageHero trail={[{ name: "Privacy Policy", path: "/privacy" }]} title="Privacy Policy" />
      <section className="pb-28">
        <div className="container max-w-3xl">
          <Blocks blocks={privacyBlocks} />
        </div>
      </section>
    </>
  );
}
