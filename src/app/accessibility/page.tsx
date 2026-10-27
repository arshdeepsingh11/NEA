import { PageHero } from "@/components/sections/page-hero";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Accessibility", description: "Our commitment to an accessible website and clinic.", path: "/accessibility" });

export default function AccessibilityPage() {
  return (
    <>
      <PageHero trail={[{ name: "Accessibility", path: "/accessibility" }]} title="Accessibility" lede="We want everyone to be able to use this website and visit our clinic." />
      <section className="pb-28">
        <div className="container prose-nea max-w-3xl">
          <p>This site is built with WCAG 2.2 AA guidelines in mind: it works with a keyboard, supports screen readers, respects your reduced-motion setting by turning off animation and 3D movement, and keeps text contrast high.</p>
          <p>If something does not work for you, or you need information in another format, call {site.phone} or email {site.email} and we will help.</p>
        </div>
      </section>
    </>
  );
}
