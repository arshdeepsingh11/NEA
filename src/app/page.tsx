import { HomeHero } from "@/components/sections/home-hero";
import { ConcernsMarquee, MethodStory, BodyIntelChapter, ProgramsRail } from "@/components/sections/home-story";
import { FaceMapChapter, SkinReportChapter, SystemsChapter } from "@/components/sections/home-intel";
import { SkinFinder } from "@/components/sections/skin-finder";
import { ScanOffer } from "@/components/sections/scan-offer";
import { SectionHead } from "@/components/sections/page-hero";
import { FotonaChapter, FounderChapter, ReviewsChapter, VisitChapter } from "@/components/sections/home-chapters";
import { ReelsStrip } from "@/components/reels/reels-strip";
import { bodyRegions, faceZones } from "@/content/body";
import { programs } from "@/content/programs";
import { labTests } from "@/content/tests";
import { faqs } from "@/content/faq";
import { JsonLd, faqSchema } from "@/lib/seo";

/**
 * Home, v4. One story, told in order:
 * a real face being scanned → what we treat → why skin is an output → how the method works →
 * the 3D body → the four programs → a sample report → the face map → proof → the founder → visit.
 */
export default function HomePage() {
  const testName = Object.fromEntries(labTests.map((t) => [t.slug, t.name]));
  const scan = bodyRegions.map((r) => ({ id: r.id, name: r.name, system: r.system, headline: r.headline, color: r.color, tests: r.tests.map((s) => testName[s]).filter(Boolean) as string[], tracks: r.tracks }));
  const rail = programs.map((p) => ({ slug: p.slug, name: p.name, problem: p.problem, headline: p.headline, priceFrom: p.priceFrom, duration: p.duration, image: p.image }));

  return (
    <>
      <JsonLd data={faqSchema(faqs.slice(0, 6))} />
      <HomeHero />
      <ConcernsMarquee />
      <SystemsChapter />
      <MethodStory />
      <BodyIntelChapter regions={scan} />
      <ProgramsRail programs={rail} />
      <SkinReportChapter />
      <FaceMapChapter zones={faceZones} />

      <section className="chapter" id="finder">
        <div className="container">
          <SectionHead title={<>Seven questions. <em className="aurora-text">One</em> plan from Nea SI.</>} lede="Answer like you would at a consultation. Nea SI explains what is most likely going on, which program, tests and first treatments fit you, what it costs against your budget, and books it for you." />
          <SkinFinder />
        </div>
      </section>

      <section className="chapter">
        <div className="container">
          <ScanOffer />
        </div>
      </section>

      <ReviewsChapter />
      <ReelsStrip />
      <FounderChapter />
      <FotonaChapter />
      <VisitChapter />
    </>
  );
}
