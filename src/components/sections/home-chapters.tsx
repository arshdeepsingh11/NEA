import Link from "next/link";
import { Directions } from "@/components/map/directions";
import { BookButton } from "@/components/booking/booking";
import {
  Activity,
  Droplet,
  Dumbbell,
  Flower2,
  Footprints,
  Gem,
  HeartPulse,
  Moon,
  ScanFace,
  Scissors,
  Sparkles,
  Sun,
  Syringe,
  Waves,
  Zap,
} from "lucide-react";
import { FocusedMarquee, type MarqueeIcon } from "@/components/ui/focused-marquee";
import { EvervaultCard } from "@/components/ui/evervault-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Text3DFlip } from "@/components/ui/text-3d-flip";
import { ScrollSphereGallery, type SphereCard } from "@/components/ui/scroll-sphere-gallery";
import { NeaImage } from "@/components/ui/nea-image";
import { VideoSlot } from "@/components/layout/video-slot";
import { LazyBeam, LazySignal, LazyWorldMap } from "@/components/three/lazy";
import { ClinicMap } from "@/components/layout/clinic-map";
import { labTests } from "@/content/tests";
import { reviews } from "@/content/reviews";
import { ReviewStage } from "./review-stage";
import { founder } from "@/content/team";
import { posts } from "@/content/blog";
import { site } from "@/lib/site";
import { formatDate, money } from "@/lib/utils";
import { SectionHead } from "./page-hero";

const T = (a: string, b: string) => `linear-gradient(160deg, ${a}, ${b})`;

export const treatmentIcons: MarqueeIcon[] = [
  { label: "Fotona laser", href: "/fotona", icon: <Zap />, tint: T("#7b78ff", "#4b48d6") },
  { label: "Acne treatments", href: "/treatments/active-acne", icon: <ScanFace />, tint: T("#3f9a87", "#1d5a4e") },
  { label: "Pigmentation & melasma", href: "/treatments/hyperpigmentation-melasma", icon: <Sun />, tint: T("#e2a58f", "#b9826f") },
  { label: "Neuromodulators", href: "/treatments/neuromodulators", icon: <Syringe />, tint: T("#5a6268", "#2a3034") },
  { label: "Dermal fillers", href: "/treatments/dermal-fillers", icon: <Droplet />, tint: T("#f0b9c4", "#c97c8d") },
  { label: "Hair restoration", href: "/treatments/hair-restoration", icon: <Scissors />, tint: T("#3b4450", "#15191c") },
  { label: "Facials", href: "/treatments/facials", icon: <Sparkles />, tint: T("#9fd3c1", "#4e9c89") },
  { label: "truSculpt flex", href: "/treatments/muscle-sculpting", icon: <Dumbbell />, tint: T("#6aa7ff", "#2e5fb8") },
  { label: "Body contouring", href: "/treatments/body-contouring", icon: <Waves />, tint: T("#8be0d0", "#2f7d6d") },
  { label: "NightLase for snoring", href: "/treatments/snoring-sleep-apnea", icon: <Moon />, tint: T("#3d3a8f", "#1b1950") },
  { label: "Feminine health", href: "/treatments/feminine-health", icon: <Flower2 />, tint: T("#f4c6b7", "#d58f7a") },
  { label: "Lines & sun damage", href: "/treatments/lines-wrinkles-sun-damage", icon: <Gem />, tint: T("#c9c7ff", "#7d7af0") },
  { label: "Fungal nail laser", href: "/treatments/fungal-nail", icon: <Footprints />, tint: T("#a3b2ad", "#5f6f69") },
  { label: "Migraine treatment", href: "/treatments/migraine-treatment", icon: <HeartPulse />, tint: T("#ff9a8a", "#d2574a") },
  { label: "Weight loss programs", href: "/weight-loss", icon: <Activity />, tint: T("#ffd27a", "#d69a1e") },
];

export function TreatmentsChapter() {
  return (
    <section className="chapter overflow-hidden">
      <div className="container">
        <SectionHead
          center
          title="Every treatment, still here."
          lede="Twenty-nine treatments, from Fotona laser to PRP. Hover to slow the stream and pick one, or browse them all grouped by what they do."
        />
      </div>
      <FocusedMarquee items={treatmentIcons} />
      <div className="mt-10 flex justify-center">
        <Link href="/treatments" className="btn-ghost">
          Browse all treatments
        </Link>
      </div>
    </section>
  );
}

export function TestsChapter() {
  const featured = labTests.filter((t) => t.featured);
  return (
    <section className="chapter chapter-dark relative overflow-hidden">
      <LazySignal className="absolute inset-0 opacity-80" offsetX={3} />
      <div className="container relative">
        <SectionHead
          dark
          title="Many signals. One plan."
          lede="Your skin, gut, hormones and DNA all leave clues. NEA reads them together through BioAro Labs, so the plan fits you instead of an average."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((t) => (
            <EvervaultCard key={t.slug} className="min-h-[300px]">
              <div className="flex h-full min-h-[300px] flex-col justify-between p-7">
                <div>
                  <p className="text-[13px] text-graphite/80">BioAro Labs</p>
                  <h3 className="mt-1 font-display text-3xl font-semibold">{t.name}</h3>
                </div>
                <div>
                  <p className="text-[15px] leading-relaxed text-graphite">{t.neaUse}</p>
                  <p className="mt-4 text-[14px] text-graphite">
                    {money(t.price)} · results to your secure dashboard
                  </p>
                </div>
              </div>
            </EvervaultCard>
          ))}
        </div>
        <div className="mt-12 grid gap-8 border-t border-ink/10 pt-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-5xl font-semibold">
              <NumberTicker value={4} />
            </p>
            <p className="mt-2 text-graphite">microbiomes we test: gut, skin, oral and vaginal</p>
          </div>
          <div>
            <p className="font-display text-5xl font-semibold">
              <NumberTicker value={labTests.length} />
            </p>
            <p className="mt-2 text-graphite">BioAro Labs tests you can buy right here</p>
          </div>
          <div>
            <p className="font-display text-5xl font-semibold">
              <NumberTicker value={1} />
            </p>
            <p className="mt-2 text-graphite">connected report, explained by your NEA team</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/tests" className="btn-light">
            See all tests and prices
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FotonaChapter() {
  const modes = ["SmoothLiftin®", "FRAC3®", "PIANO®", "SupErficial™", "NightLase®", "IntimaLase™", "Incontilase™", "ClearSteps™", "TightSculpting®"];
  return (
    <section className="chapter-dark relative overflow-hidden">
      <div className="absolute inset-0">
        <LazyBeam />
      </div>
      <div className="container relative flex min-h-[90vh] flex-col justify-center py-24">
        <h2 className="max-w-3xl text-display-lg font-semibold">One laser platform. Every skin tone.</h2>
        <p className="measure mt-6 text-lede text-graphite">
          NEA was one of the first centres in Calgary to offer Fotona and all its applications. Two wavelengths, Er:YAG and Nd:YAG, delivered gently enough to tighten collagen and safe for all skin types and colours.
        </p>
        <ul className="mt-10 flex max-w-3xl flex-wrap gap-2">
          {modes.map((m) => (
            <li key={m} className="rounded-full border border-ink/10 bg-white/60 px-4 py-2 text-[14px] text-graphite backdrop-blur">
              {m}
            </li>
          ))}
        </ul>
        <Link href="/fotona" className="mt-12 inline-flex w-fit items-center gap-2 border-b border-ink/20 pb-1 text-xl font-medium text-ink transition hover:border-ink/30">
          <Text3DFlip text="Explore Fotona at NEA" flipClassName="text-flora" />
        </Link>
      </div>
    </section>
  );
}

const galleryCards: SphereCard[] = [
  "elementor/thumbs/Photo-2023-08-10-12-08-42-PM-scaled-qfezl5ezq5urrpgtwb0un5tigjp2ek7c277e4dsji0.jpg",
  "elementor/thumbs/Photo-2023-08-12-10-58-49-AM-scaled-qfezlcxp8u52cl5woe9v73x77mo04516r8f9ylhe48.jpg",
  "elementor/thumbs/Photo-2023-09-13-1-07-41-PM-scaled-qfezlrz4a6pnick28krwb04kpslvjaow5av1n0v3co.jpg",
  "elementor/thumbs/Photo-2023-09-13-12-48-56-PM-scaled-qfezmj8fsdqyv1ggtek2tb8xxyviqip3x1s4k1qoc8.jpg",
  "elementor/thumbs/Photo-2023-09-13-12-43-18-PM-scaled-qfezmbpq9pgoa5re1bb29d596vwl0xv980k8pu1tq0.jpg",
  "elementor/thumbs/Photo-2023-09-13-12-30-15-PM-scaled-qfezm54uxv7o0w0y3qgo9wt116t0j254v3zucwbkxk.jpg",
  "elementor/thumbs/Photo-2023-09-13-11-54-08-AM-scaled-qfezlyjzm0ynrmai65maaggsvhpg16f0i7ffzylc54.jpg",
  "elementor/thumbs/Photo-2023-09-13-1-06-09-PM-scaled-qfezlkgerifcxguzghivr20vypmxtpv1g9n5st68qg.jpg",
  "elementor/thumbs/Photo-2023-08-10-11-42-11-AM-scaled-e1719259811314-qq5annso584wvcuv6z0s0qmstxc7wfwmzyddvccxx4.jpg",
  "elementor/thumbs/Photo-2023-01-25-13-54-48-qfezkqdkota6ly2oc4itj9m4ydr6zejmo4rmfyeu9k.png",
  "elementor/thumbs/Photo-2021-10-27-3-56-40-PM-scaled-qfezkhx0zaylpgeypiv6etqzlwww24m1myw94grdtk.jpg",
  "elementor/thumbs/Photo-2020-11-04-10-58-36-AM-1-scaled-qfezkbc5ngplg6oiry0sfderg7tbk8vxa2burj1514.jpg",
  "elementor/thumbs/Nea-may.edit-15-qfezk4rabmgl6wy2ud6efx2jaipr2d5sx5rgelaw8o.png",
  "elementor/thumbs/Nea-may.edit-14-qfezk0zxkabfwh3jgbjw5y0owz8a7kqvkn5ihhggxk.png",
  "elementor/thumbs/Nea-may.edit-13-qfezjx8ksy6am19029xdvyyujfqtcsby84jkkdm1mg.png",
  "elementor/thumbs/Nea-may.edit-10-qfezjuf28g2fn7d3iqpi6hogra4ppp0r7ql44jq854.png",
  "elementor/thumbs/Nea-may.edit-9-qfezjqnph3xacrik4p2zwimmdqn8uwltv7z67fvsu0.png",
  "elementor/thumbs/Nea-may.edit-5-qfezjnu6wltfdxmnl5v471c8ll157tamuu0prlzzco.png",
  "elementor/thumbs/Nea-may.edit-2-qfezjl0oc3pkf3qr1mn8hk1utff1kpzfug29bs45vc.png",
  "elementor/thumbs/Nea-may.edit-1-qfezjh9bkrkf4nw7nl0q7l00fvxkpxkihxgbeo9qk8.png",
  "elementor/thumbs/NEA-photos-12-qfezjeft09gk5u0b41sui3pmnqbh2u9bhjhuyudx2w.png",
  "elementor/thumbs/nea-medical-19-qfezjbmafrcp704ekikysmf8vkpdfqy4h5jej0i3lk.png",
  "elementor/thumbs/Nea-March-2022-18-qfezj35qq914aigoxwxbo6k3j3v2ih0jfzo17iun5k.jpg",
  "elementor/thumbs/Nea-March-2022-16-qfezizedywvz02m5jvate7i95kdlnolm3h23af07ug.jpg",
].map((src) => ({ src, alt: "Inside NEA Precision Skin" }));

export { galleryCards };

export function GalleryChapter() {
  return (
    <ScrollSphereGallery cards={galleryCards} className="bg-porcelain">
      <h2 className="text-display-md font-semibold">Inside the clinic.</h2>
      <p className="mt-3 text-graphite">Keep scrolling to turn the sphere.</p>
    </ScrollSphereGallery>
  );
}

export function ReviewsChapter() {
  return (
    <section className="chapter overflow-hidden">
      <div className="container">
        <SectionHead title="In their words." lede="Real reviews from NEA clients on Google and our testimonials page, in their own words." />
        <ReviewStage reviews={reviews} />
      </div>
      <div className="container mt-10 flex flex-wrap gap-3">
        <Link href="/testimonials" className="btn-ghost">
          Read all reviews
        </Link>
        <a href={site.social.googleReviews} target="_blank" rel="noreferrer" className="btn text-graphite hover:text-ink">
          See them on Google
        </a>
      </div>
    </section>
  );
}

export function FounderChapter() {
  return (
    <section className="chapter">
      <div className="container grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden rounded-5xl bg-mist">
          <NeaImage src={founder.image} alt={`${founder.name}, Registered Dietitian and founder of NEA`} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
        </div>
        <div>
          <h2 className="text-display-md font-semibold">Meet {founder.name}.</h2>
          <p className="mt-3 text-[15px] text-graphite">{founder.role}</p>
          <p className="measure mt-8 text-lede text-ink">
            “One size does not fit all. Prevention should be customized to each person, based on their lifestyle, genetics and microbiome.”
          </p>
          <p className="measure mt-6 leading-relaxed text-graphite">{founder.bio[1]}</p>
          <dl className="mt-10 grid grid-cols-2 gap-6">
            {founder.facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-4xl font-semibold">
                  <NumberTicker value={f.value} suffix={f.suffix} />
                </dd>
                <p className="mt-1 text-[14px] text-graphite">{f.label}</p>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[14px] text-graphite">{founder.award}</p>
          <div className="mt-8 flex gap-3">
            <Link href="/about" className="btn-primary">
              Our story and mission
            </Link>
            <a href={site.social.linkedinFounder} target="_blank" rel="noreferrer" className="btn-ghost">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MapChapter() {
  return (
    <section className="chapter chapter-dark overflow-hidden">
      <div className="container">
        <SectionHead
          dark
          title="Made in Calgary. Connected everywhere."
          lede="NEA sits inside the BioAro precision-health ecosystem in NE Calgary. Samples can be submitted securely from anywhere, and results come back to one record."
        />
        <LazyWorldMap
          hub={{ name: "NEA Precision Skin, Calgary", lat: 51.08, lng: -114.0, note: "Clinic, testing and care" }}
          points={[
            { name: "Vancouver", lat: 49.28, lng: -123.12, note: "Sample submission" },
            { name: "Toronto", lat: 43.65, lng: -79.38, note: "Sample submission" },
            { name: "London", lat: 51.5, lng: -0.12, note: "Sample submission" },
            { name: "Dubai", lat: 25.2, lng: 55.27, note: "Sample submission" },
            { name: "New Delhi", lat: 28.61, lng: 77.2, note: "Sample submission" },
            { name: "Manila", lat: 14.6, lng: 120.98, note: "Sample submission" },
          ]}
        />
        <p className="mt-4 text-[13px] text-graphite/80">Routes are illustrative of BioAro’s secure global sample submission.</p>
      </div>
    </section>
  );
}

export function VideoChapter() {
  return (
    <section className="chapter">
      <div className="container">
        <SectionHead title="See NEA in motion." lede="A look inside treatments, the clinic and the people who run it." />
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <VideoSlot file="clinic-tour.mp4" label="Clinic tour" poster="elementor/thumbs/Photo-2023-08-12-10-58-49-AM-scaled-qfezlcxp8u52cl5woe9v73x77mo04516r8f9ylhe48.jpg" className="aspect-video md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[520px]" />
          <VideoSlot file="skin-scan.mp4" label="The Skin Health Report" poster="2024/01/clinical-facial-treatments.jpg" className="aspect-video" />
          <VideoSlot file="raman.mp4" label="Raman on gut and skin" poster="2023/11/raman.jpg" className="aspect-video" />
        </div>
      </div>
    </section>
  );
}

export function JournalChapter() {
  const latest = posts.slice(0, 3);
  return (
    <section className="chapter pt-0">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-display-md font-semibold">From the journal.</h2>
          <Link href="/blog" className="btn-ghost">
            All articles
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
                {p.image && <NeaImage src={p.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-spring group-hover:scale-105" />}
              </div>
              <p className="mt-4 text-[13px] text-graphite">{formatDate(p.date)}</p>
              <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight group-hover:underline">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-[15px] text-graphite">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisitChapter() {
  return (
    <section className="chapter">
      <div className="container grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-display-md font-semibold">Ready when you are.</h2>
          <p className="measure mt-5 text-lede text-graphite">
            Book online any time, or start with a free 15-minute consultation. We will tell you honestly what will help and what will not.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book online</BookButton>
            <Link href="/book" className="btn-ghost">
              Request a free consultation
            </Link>
          </div>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-graphite">Visit</dt>
              <dd className="mt-1 text-[16px]">
                {site.address.line1}
                <br />
                {site.address.city}, {site.address.region}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-graphite">Call or text</dt>
              <dd className="mt-1 text-[16px]">
                <a href={site.phoneHref} className="hover:underline">
                  {site.phone}
                </a>
                <br />
                <a href={site.textHref} className="hover:underline">
                  Text {site.text}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-graphite">Hours</dt>
              <dd className="mt-1 text-[16px]">
                Monday to Saturday, 9:00 a.m. – 5:00 p.m.
                <br />
                Sunday closed
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-graphite">Email</dt>
              <dd className="mt-1 text-[16px]">
                <a href={`mailto:${site.email}`} className="hover:underline">
                  {site.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-4">
          <div className="min-h-[440px] lg:min-h-[520px]">
            <ClinicMap query={site.mapsQuery} className="min-h-[440px] lg:min-h-[520px]" />
          </div>
          <Directions />
        </div>
      </div>
    </section>
  );
}
