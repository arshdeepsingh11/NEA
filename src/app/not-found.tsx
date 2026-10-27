import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center pt-[var(--header-h)]">
      <div className="container text-center">
        <p className="font-display text-7xl font-semibold text-flora">404</p>
        <h1 className="mt-4 text-display-md font-semibold">This page has moved or no longer exists.</h1>
        <p className="mx-auto mt-4 max-w-md text-graphite">The new NEA site is organized around programs and treatments. Search, or start from one of these.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Home
          </Link>
          <Link href="/treatments" className="btn-ghost">
            All treatments
          </Link>
          <Link href="/programs" className="btn-ghost">
            Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
