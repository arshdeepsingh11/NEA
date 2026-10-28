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
    page.tsx              Home (3D "Body Intelligence" hero, systems network, sample report, face map)
    body                  3D Body Explorer: realistic / hologram body + face map, click any region
    programs/[slug]       Clear Skin, Even Tone, Hair Regrowth, Healthy Aging
    treatments/[slug]     29 treatments (full original text)
    packages              All 12 beauty & wellness packages, word for word
    tests                 BioAro Labs tests with prices + filters
    skin-scan             Free NEA Skin Health Report + booking form
    experiences/[slug]    Body Truth Scan, Bring Your Bag, Calgary Skin, Bridal Glow, Men's Skin Check
    membership            Glow / Glow Plus / Glow Elite + comparison table
    ask                   NEA Intelligence landing (/ask?q=… opens the AI)  → api/ask
    api/lead              Receives every form; forwards to LEAD_WEBHOOK_URL
    about, nutrition, microbiome, fotona, men, weight-loss, faq, testimonials,
    gallery, magazine, blog/[slug], contact, book, partners, finder, privacy, terms
    sitemap.ts, robots.ts SEO + AI crawlers (GEO); public/llms.txt for AI answer engines
  content/                All copy and data. Edit text here, not in components
    body.ts               What each body region / face zone is made of, disruptors, NEA treatments + tests
    program-insights.ts   Chart data for program pages (ILLUSTRATIVE, replace with NEA averages)
    generated/*.json      Extracted from the current site (treatments, blog, legal)
  components/
    three/                anatomy-viewer (3D body + face), signal-convergence, beam-flow, world-map
    ai/                   ai-provider (press N anywhere), ai-overlay, ai-prompt-bar, question chips
    viz/                  trend-chart, radar, range-bars, weight-bars, sparkline, systems-network
    body/                 body-explorer (the /body page UI)
    ui/                   focused-marquee, scroll-sphere-gallery, coverflow, evervault-card,
                          apple-dock, terminal, animated-list, shine-border,
                          number-ticker, morphing-text, text-3d-flip, circular-progress, marquee
    layout/               footer, dock (the only navigation), smooth scroll, video slot
    sections/             page sections (hero, skin finder, method, scan offer, forms…)
  lib/                    site constants, SEO/JSON-LD, search + Ask NEA knowledge engine
```

## Design system

- Two switchable themes (dock button, or More → Colour theme; saved per visitor, no flash on load):
  **Pearl & blush** (default) and **Sand & gold**. Every colour is a CSS variable in `globals.css`
  under `[data-theme="pearl"]` / `[data-theme="sand"]`; Tailwind colours, charts and the 3D scenes all read them.
- Type: Instrument Serif for headlines (italic accents via `*word*` in `SplitReveal` or `<em>`), Inter for text
- Charts use a separate colour-blind-safe set in `components/viz/palette.ts` (validated on white)
- Motion: Lenis smooth scroll synced to GSAP ScrollTrigger; framer-motion springs.
  Everything respects `prefers-reduced-motion`; 3D scenes pause off-screen and in hidden tabs.

## SEO, AEO and GEO

- JSON-LD on every page: MedicalClinic, MedicalProcedure, FAQPage, BlogPosting, Person, Breadcrumbs
- One canonical name, address and phone everywhere (also fixes the NEA Medical Aesthetics / neaskincare mix)
- `robots.ts` welcomes GPTBot, ClaudeBot, PerplexityBot and Google-Extended; `public/llms.txt` summarizes NEA for AI tools
- Permanent redirects keep the old WordPress URLs' search ranking

## NEA SI (Skin Intelligence): Xevyo and Gemini

Press **N** on any page, tap the SI orb, or any "Ask SI" button. Everything goes through `src/app/api/ask/route.ts`:

1. **NEA's knowledge, always.** `src/lib/knowledge.ts` finds the matching programs, treatments, tests, packages, body regions and FAQs, and prices a plan when a budget is mentioned. These show as cards under each answer.
2. **The engine writes the answer.** Visitors choose **Xevyo** (NEA's in-house AI) or **Gemini** with the switch at the top of the chat; the choice is remembered. Both get the same education from `src/lib/si/brain.ts`: SI's rules (no diagnosing, no invented prices, link NEA pages, book through Jane), clinic facts and hours, and a catalogue of every program, treatment, Jane service, test, package, membership and FAQ, built from the content files. Edit the content and SI knows it on the next restart.
3. **It never breaks.** If the chosen engine fails, the other answers; if both fail, the built-in engine answers. Gemini tries each model in `GEMINI_MODELS` in turn, skipping busy ones.

Settings (server only, in `.env.local` and your host's environment variables, never `NEXT_PUBLIC_`):

| Variable | What it is |
| --- | --- |
| `XEVYO_API_KEY` | Xevyo key |
| `XEVYO_API_URL` | Full Xevyo chat endpoint. Called OpenAI-style: `POST {model, messages:[{role, content}]}` with `Authorization: Bearer <key>`; reads `choices[0].message.content` (also `text`, `output_text`, `response`). Until set, the Xevyo option shows an amber dot and Gemini answers. |
| `XEVYO_MODEL` | Optional model name for Xevyo |
| `GEMINI_API_KEY` | Google AI Studio key (aistudio.google.com/apikey) |
| `GEMINI_MODELS` | Models to try in order (default `gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest`) |
| `SI_DEFAULT_ENGINE` | `xevyo` or `gemini`: which one new visitors start with |

`api/ask` allows up to 60 seconds per answer (`maxDuration`). On Vercel's Hobby plan that is the maximum; Gemini usually answers in 3–15 seconds, longer when Google is busy.

## Reels (Instagram and other channels)

NEA's videos play on this site through each platform's official embedded player. Nothing is downloaded or stored, and no database is needed.

- **Reels** in the navbar opens a full-screen viewer: one video at a time, arrows or swipe for the next, plus Book (the matching Jane services), Ask SI and a Follow button.
- The home page shows the latest videos in a "Straight from the clinic floor" strip. They play right in the page.

**To add a video**, paste its link at the top of `socialVideos` in `src/content/reels.ts` (a short caption is optional and helps pick the right Book button). Instagram Reels and posts, YouTube Shorts and videos, and TikTok videos all work. Add NEA's YouTube or TikTok channel link in `src/lib/site.ts` (`social.youtube`, `social.tiktok`) to show a Follow or Subscribe button for those videos.

**Optional: new Instagram Reels appear automatically.** Set `INSTAGRAM_ACCESS_TOKEN` (free official API) and the newest Reels are added within an hour, with no links to paste. One-time setup, about 20 minutes, by someone who can log in to @neaprecisionskin:

1. Make sure the Instagram account is a Professional account (Business or Creator): Instagram → Settings → Account type and tools.
2. Go to developers.facebook.com → My Apps → Create app. Choose the Instagram use case (manage messaging and content on Instagram) and a Business app type.
3. In the app, open Instagram → API setup with Instagram login → Generate access tokens → Add account, log in as @neaprecisionskin and approve. If Meta asks, add the account under App roles → Instagram testers and accept the invite in Instagram.
4. Click Generate token next to the account and copy it. The app can stay in development mode because it only reads NEA's own account.
5. Add `INSTAGRAM_ACCESS_TOKEN=<token>` to `.env.local` and to the hosting provider's environment variables, then redeploy.

Tokens last 60 days. `vercel.json` calls `/api/instagram/refresh` every Monday to restart the 60 days (set `CRON_SECRET` in Vercel to protect it). On another host, call that URL weekly with any scheduler. If the refresh response ever shows `"tokenChanged": true`, paste the new token from Meta into `INSTAGRAM_ACCESS_TOKEN`.

## 3D models and credits

`public/models/body.glb` — MakeHuman base mesh (CC0). `public/models/head.glb` + textures —
"Lee Perry-Smith" head scan by Infinite Realities, CC BY 3.0: keep the credit line on /body
(see `public/models/CREDITS.md`).
