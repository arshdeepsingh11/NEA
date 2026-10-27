import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "./logo";
import { footerNav } from "@/content/nav";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t border-ink/[0.06] bg-porcelain pb-28 pt-20 md:pb-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[15px] leading-relaxed text-graphite">{site.promise} A physician-managed clinic combining Fotona laser, medical-grade skincare and microbiome science.</p>
            <address className="mt-6 not-italic text-[15px] leading-relaxed">
              {site.address.line1}
              <br />
              {site.address.city}, {site.address.region}
              <br />
              <a className="underline-offset-4 hover:underline" href={site.phoneHref}>
                {site.phone}
              </a>
              <br />
              <a className="underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </address>
            <dl className="mt-6 space-y-1 text-[14px] text-graphite">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6">
                  <dt>{h.days}</dt>
                  <dd>{"closed" in h && h.closed ? "Closed" : `${h.open} – ${h.close}`}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex gap-2">
              <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="NEA on Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 transition hover:bg-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="NEA on Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 transition hover:bg-white">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {footerNav.map((g) => (
              <nav key={g.title} aria-label={g.title}>
                <p className="mb-4 text-[13px] font-medium text-ink">{g.title}</p>
                <ul className="space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[14px] text-graphite transition hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-ink/[0.06] pt-8 text-[13px] text-graphite md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NEA Precision Skin. Testing fulfilled by BioAro Labs in CLIA-registered laboratories.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-ink">
              Accessibility
            </Link>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-[12px] leading-relaxed text-graphite/80">
          Information on this site is for education and is not medical advice. Results vary from person to person. Lab tests are not intended to diagnose, treat, cure or prevent any disease; discuss results with a qualified healthcare provider. In an emergency call 911. For nurse advice in Alberta, call Health Link 811.
        </p>
      </div>
    </footer>
  );
}
