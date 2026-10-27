import { PageHero } from "@/components/sections/page-hero";
import { reviews } from "@/content/reviews";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Client reviews and testimonials",
  description: "What NEA Precision Skin clients say about facials, microneedling, Botox, laser, truSculpt and nutrition programs.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        trail={[{ name: "Reviews", path: "/testimonials" }]}
        title="Learn what our clients are saying."
        lede="From enhanced skin texture to a radiant glow, here is how clients describe their experience at NEA."
      >
        <a href={site.social.googleReviews} target="_blank" rel="noreferrer" className="btn-ghost">
          Read more on Google
        </a>
      </PageHero>
      <section className="pb-28">
        <div className="container columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((r, i) => (
            <figure key={i} className="mb-5 break-inside-avoid rounded-4xl surface p-7">
              <blockquote className="text-[16px] leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-6 flex items-center justify-between text-[14px]">
                <span className="font-medium">{r.name === "Client" ? "NEA client" : r.name}</span>
                <span className="text-graphite">{r.treatment}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
