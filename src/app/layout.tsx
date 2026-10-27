import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Dock, MobileBar } from "@/components/layout/dock";
import { CommandPalette } from "@/components/layout/command-palette";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { JsonLd, clinicSchema } from "@/lib/seo";
import { site } from "@/lib/site";

const display = Manrope({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700", "800"], display: "swap" });
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
    { media: "(prefers-color-scheme: light)", color: "#F5F6F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1214" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <JsonLd data={clinicSchema()} />
        <SmoothScroll />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Dock />
        <MobileBar />
        <CommandPalette />
      </body>
    </html>
  );
}
