import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      // Explicitly welcome AI answer engines (GEO): GPTBot, ClaudeBot, PerplexityBot, Google-Extended.
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"], allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
