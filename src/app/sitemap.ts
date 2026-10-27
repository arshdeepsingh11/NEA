import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { programs } from "@/content/programs";
import { treatments } from "@/content/treatments";
import { offers } from "@/content/offers";
import { posts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ["", "/body", "/experiences", "/programs", "/treatments", "/packages", "/tests", "/skin-scan", "/membership", "/about", "/nutrition", "/microbiome", "/fotona", "/men", "/weight-loss", "/faq", "/testimonials", "/gallery", "/magazine", "/blog", "/contact", "/book", "/partners", "/finder", "/ask", "/privacy", "/terms", "/accessibility"];
  return [
    ...statics.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...programs.map((p) => ({ url: `${site.url}/programs/${p.slug}`, lastModified: now, priority: 0.9 })),
    ...treatments.map((t) => ({ url: `${site.url}/treatments/${t.slug}`, lastModified: now, priority: 0.8 })),
    ...offers.filter((o) => o.slug !== "skin-scan").map((o) => ({ url: `${site.url}/experiences/${o.slug}`, lastModified: now, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date ? new Date(p.date) : now, priority: 0.5 })),
  ];
}
