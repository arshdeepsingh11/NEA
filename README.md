# NEA Precision Skin — website (Next.js 15 + TypeScript)

The rebuilt NEA site: one clear promise (**“Healthy skin starts inside.”**), four problem-based
programs instead of 50 menu links, visible starting prices, one booking button, and the
growth offers (free Skin Health Report, Body Truth Scan, Bring Your Bag, Calgary Skin,
Bridal Glow, Men’s Skin Check, partner commissions, membership).

All existing content from neaprecisionskin.com is included — every treatment, package,
FAQ, testimonial, blog post, the privacy policy and terms — plus the BioAro Labs tests
that support NEA’s work, with list prices.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

Node 18.18+ (Node 20 or 22 recommended). Deploys as-is to Vercel, Netlify or any Node host.

## Before launch (please confirm)

| Item | Where |
| --- | --- |
| Program starting prices (placeholders: $1,200 / $950 / $2,400 / $3,900) | `src/content/programs.ts` → `priceFrom` |
| Membership prices and benefits (placeholders: $99 / $189 / $349) | `src/content/offers.ts` → `memberships` |
| Skin scan offer wording ($150 value, 20 spots a week) | `src/content/offers.ts` |
| Partner commission terms | `src/app/partners/page.tsx` |
| Add your videos | `public/videos/` (see the README there) |
| Lead delivery: set `LEAD_WEBHOOK_URL` (Zapier/Make/CRM) | `.env.local` (copy `.env.example`) |
| Health-advertising review of claims, testimonials and offers (Alberta rules) | whole site |

Images are served from NEA’s existing WordPress media library (`neaprecisionskin.com/wp-content`).
When the new site replaces WordPress, download that folder into `public/media` and change
`nea()` in `src/lib/utils.ts` to point to `/media/`.

## What is where

```
src/
  app/                    Every route (App Router). Old WordPress URLs redirect in next.config.mjs
    page.tsx              Home
    programs/[slug]       Clear Skin, Even Tone, Hair Regrowth, Healthy Aging
    treatments/[slug]     29 treatments (full original text)
    packages              All 12 beauty & wellness packages, word for word
    tests                 BioAro Labs tests with prices + filters
    skin-scan             Free NEA Skin Health Report + booking form
    experiences/[slug]    Body Truth Scan, Bring Your Bag, Calgary Skin, Bridal Glow, Men's Skin Check
    membership            Glow / Glow Plus / Glow Elite + comparison table
    ask                   "Ask NEA" AI assistant (grounded in NEA content)  → api/ask
    api/lead              Receives every form; forwards to LEAD_WEBHOOK_URL
    about, nutrition, microbiome, fotona, men, weight-loss, faq, testimonials,
    gallery, magazine, blog/[slug], contact, book, partners, finder, privacy, terms
    sitemap.ts, robots.ts SEO + AI crawlers (GEO); public/llms.txt for AI answer engines
  content/                All copy and data. Edit text here, not in components
    generated/*.json      Extracted from the current site (treatments, blog, legal)
  components/
    three/                planet-system, signal-convergence, beam-flow (WebGL), world-map
    ui/                   focused-marquee, scroll-sphere-gallery, coverflow, evervault-card,
                          apple-dock, pill-nav, terminal, animated-list, shine-border,
                          number-ticker, morphing-text, text-3d-flip, circular-progress, marquee
    layout/               header, footer, dock, ⌘K command palette, smooth scroll, video slot
    sections/             page sections (hero, skin finder, method, scan offer, forms…)
  lib/                    site constants, SEO/JSON-LD, search + Ask NEA knowledge engine
```

## Design system

- Colours: porcelain `#F5F6F3`, ink `#15191C`, flora (microbiome green) `#2F7D6D`,
  dermis `#E7C3B5`, lumen (laser violet) `#6E6BF5`, abyss `#0C1214` — `tailwind.config.ts`
- Type: Manrope (display) + Inter (text), loaded with `next/font`
- Motion: Lenis smooth scroll synced to GSAP ScrollTrigger; framer-motion springs.
  Everything respects `prefers-reduced-motion`; 3D scenes pause off-screen and in hidden tabs.

## SEO, AEO and GEO

- JSON-LD on every page: MedicalClinic, MedicalProcedure, FAQPage, BlogPosting, Person, Breadcrumbs
- One canonical name, address and phone everywhere (also fixes the NEA Medical Aesthetics / neaskincare mix)
- `robots.ts` welcomes GPTBot, ClaudeBot, PerplexityBot and Google-Extended; `public/llms.txt` summarizes NEA for AI tools
- Permanent redirects keep the old WordPress URLs' search ranking

## Upgrading "Ask NEA" to an LLM

`src/app/api/ask/route.ts` retrieves the best-matching NEA pages (`src/lib/knowledge.ts`).
Pass those `sources` as context to your model of choice and return its answer. Keep the rule
that answers only use NEA content and never give personal medical advice.
