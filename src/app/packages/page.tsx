import Link from "next/link";
import { Download } from "lucide-react";
import { PackageExplorer } from "@/components/sections/package-explorer";
import { PageHero } from "@/components/sections/page-hero";
import { wellnessPackages } from "@/content/packages";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Beauty & wellness packages: precision in nutrition, skin and health",
  description: "Anti-aging, hair, nutrition, scarring, facial, sports, arthritis, feminine health, heart health, sleep apnea, laser hair reduction, skin rejuvenation and Get Your Glow packages.",
  path: "/packages",
});

export default function PackagesPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Packages", path: "/packages" }]}
        title="Pick a goal. See exactly what each package is made of."
        lede="Did you know your skin is a window into your health? Each package combines beauty and the science of nutrition. Every item below is exactly what you receive."
      >
        <div className="flex flex-wrap gap-3">
          <a href={site.downloads.packageCatalog} target="_blank" rel="noreferrer" className="btn-ghost">
            <Download className="h-4 w-4" /> Download the package catalog (PDF)
          </a>
          <Link href="/programs" className="btn text-graphite hover:text-ink">
            Prefer a simpler choice? See the 4 programs
          </Link>
        </div>
      </PageHero>
      <section className="pb-28">
        <div className="container">
          <PackageExplorer packages={wellnessPackages} />
        </div>
      </section>
    </>
  );
}
