import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  lede,
  trail = [],
  children,
  dark,
  className,
}: {
  title: ReactNode;
  lede?: ReactNode;
  trail?: { name: string; path: string }[];
  children?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const crumbs = [{ name: "Home", path: "/" }, ...trail];
  return (
    <section className={cn("relative overflow-hidden pb-16 pt-[calc(var(--header-h)+56px)] md:pb-24 md:pt-[calc(var(--header-h)+96px)]", dark && "chapter-dark", className)}>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="container relative">
        {trail.length > 0 && (
          <nav aria-label="Breadcrumb" className={cn("mb-8 flex flex-wrap items-center gap-1 text-[13px]", dark ? "text-graphite" : "text-graphite")}>
            {crumbs.map((c, i) => (
              <span key={c.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:underline">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page">{c.name}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="max-w-4xl text-display-lg font-semibold">{title}</h1>
        {lede && <p className={cn("measure mt-6 text-lede", dark ? "text-graphite" : "text-graphite")}>{lede}</p>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHead({ title, lede, className, dark, center }: { title: ReactNode; lede?: ReactNode; className?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={cn("mb-12 md:mb-16", center && "mx-auto text-center", className)}>
      <h2 className={cn("max-w-3xl text-display-md font-semibold", center && "mx-auto")}>{title}</h2>
      {lede && <p className={cn("measure mt-5 text-lede", dark ? "text-graphite" : "text-graphite", center && "mx-auto")}>{lede}</p>}
    </div>
  );
}
