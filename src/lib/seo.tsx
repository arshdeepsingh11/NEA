import type { Metadata } from "next";
import { site } from "./site";
import { founder } from "@/content/team";
import { reviews } from "@/content/reviews";

/** Structured data for search engines and AI answer engines (SEO / AEO / GEO). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function clinicSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "HealthAndBeautyBusiness"],
    "@id": `${site.url}/#clinic`,
    name: site.name,
    alternateName: ["NEA", "NEA Medical Aesthetics"],
    description: site.description,
    slogan: site.tagline,
    url: site.url,
    telephone: "+1-403-230-8812",
    email: site.email,
    image: "https://neaprecisionskin.com/wp-content/uploads/2023/11/Asset-18.png",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      addressRegion: site.address.regionCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
    openingHours: site.hours.filter((h) => "schema" in h).map((h) => ("schema" in h ? h.schema : "")),
    medicalSpecialty: ["Dermatology", "Nutrition"],
    availableService: [
      "Fotona laser",
      "Acne treatment",
      "Hyperpigmentation and melasma treatment",
      "PRP hair restoration",
      "Neuromodulators",
      "Dermal fillers",
      "Laser hair removal",
      "Microbiome testing",
      "Registered Dietitian nutrition consultation",
      "DEXA body composition",
    ].map((name) => ({ "@type": "MedicalProcedure", name })),
    founder: { "@type": "Person", name: founder.name, jobTitle: "Registered Dietitian", sameAs: [site.social.linkedinFounder] },
    sameAs: [site.social.instagram, site.social.facebook],
    knowsLanguage: ["en"],
    review: reviews
      .filter((r) => r.source === "Google")
      .slice(0, 5)
      .map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.name }, reviewBody: r.text, publisher: { "@type": "Organization", name: "Google" } })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${site.url}${t.path}` })),
  };
}

export function procedureSchema(p: { name: string; description: string; path: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: p.name,
    description: p.description,
    url: `${site.url}${p.path}`,
    image: p.image,
    provider: { "@id": `${site.url}/#clinic` },
  };
}

export function articleSchema(a: { title: string; description: string; path: string; image: string; date: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    image: a.image,
    datePublished: a.date,
    url: `${site.url}${a.path}`,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": `${site.url}/#clinic` },
  };
}

export function pageMeta({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: image ? [{ url: image }] : undefined },
  };
}
