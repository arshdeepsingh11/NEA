import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Dock } from "@/components/layout/dock";
import { AiProvider } from "@/components/ai/ai-provider";
import { BookingProvider } from "@/components/booking/booking";
import { ReelsProvider } from "@/components/reels/reels";
import { BrandCorner } from "@/components/layout/brand-corner";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { JsonLd, clinicSchema } from "@/lib/seo";
import { site } from "@/lib/site";
import { themeInitScript } from "@/components/theme/init";

// Editorial serif for headlines (Aesop / luxury feel), Inter for everything you read and tap.
const display = Instrument_Serif({ subsets: ["latin"], variable: "--font-display", weight: "400", style: ["normal", "italic"], display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Healthy skin starts inside · Calgary`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "skin clinic Calgary",
    "medical aesthetics Calgary NE",
    "Fotona laser Calgary",
    "acne treatment Calgary",
    "pigmentation treatment brown skin Calgary",
    "melasma Calgary",
    "PRP hair restoration Calgary",
    "microbiome testing Calgary",
    "registered dietitian skin",
    "gut health skin",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: site.name,
    title: `${site.name} — Healthy skin starts inside`,
    description: site.description,
    images: [{ url: "https://neaprecisionskin.com/wp-content/uploads/2023/11/Asset-18.png", width: 305, height: 381, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  category: "health",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBFC" },
    { media: "(prefers-color-scheme: dark)", color: "#FDFBFC" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" data-theme="pearl" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[#060912]">
          Skip to content
        </a>
        <div aria-hidden className="aurora-bg">
          <div className="aurora-grid" />
          <div className="aurora-noise" />
        </div>
        <JsonLd data={clinicSchema()} />
        <SmoothScroll />
        <BookingProvider>
          <AiProvider>
            <ReelsProvider>
              <BrandCorner />
              <main id="main">{children}</main>
              <Footer />
              <Dock />
            </ReelsProvider>
          </AiProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
