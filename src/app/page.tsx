import Link from "next/link";
import { HomeHero } from "@/components/sections/home-hero";
import { SkinFinder } from "@/components/sections/skin-finder";
import { ProgramsCarousel } from "@/components/sections/programs-carousel";
import { Method } from "@/components/sections/method";
import { ScanOffer } from "@/components/sections/scan-offer";
import { SectionHead } from "@/components/sections/page-hero";
import {
  FotonaChapter,
  FounderChapter,
  GalleryChapter,
  JournalChapter,
  MapChapter,
  ReviewsChapter,
  TestsChapter,
  TreatmentsChapter,
  VideoChapter,
  VisitChapter,
} from "@/components/sections/home-chapters";
import { FaceMapChapter, SkinReportChapter, SystemsChapter } from "@/components/sections/home-intel";
import { faceZones } from "@/content/body";
import { JsonLd, faqSchema } from "@/lib/seo";
import { faqs } from "@/content/faq";

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs.slice(0, 6))} />
      <HomeHero />
      <SystemsChapter />
      <SkinReportChapter />

      <section className="chapter" id="finder">
        <div className="container">
          <SectionHead title="Two questions. The right place to start." lede="Tell us what is bothering you most. We will point you to one program instead of fifty services." />
          <SkinFinder />
        </div>
      </section>

      <section className="chapter overflow-hidden">
        <div className="container">
          <SectionHead
            title="Four problems we solve, start to finish."
            lede="Each program brings the right tests, treatments and nutrition together around one goal, with a price you can see before you book."
          />
        </div>
        <ProgramsCarousel />
        <div className="container mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-graphite">Starting prices are indicative and confirmed at your consultation.</p>
          <Link href="/programs" className="btn-ghost">
            Compare programs
          </Link>
        </div>
      </section>

      <FaceMapChapter zones={faceZones} />

      <section className="chapter">
        <div className="container">
          <SectionHead title="The NEA Method." lede="Test, treat, track and maintain. The same four steps in every program, so you always know what happens next." />
          <Method />
        </div>
      </section>

      <section className="chapter">
        <div className="container">
          <ScanOffer />
        </div>
      </section>

      <TreatmentsChapter />
      <TestsChapter />
      <GalleryChapter />
      <FotonaChapter />
      <ReviewsChapter />
      <FounderChapter />
      <MapChapter />
      <VideoChapter />
      <JournalChapter />
      <VisitChapter />
    </>
  );
}
