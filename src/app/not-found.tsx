import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">404</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Page not found</h1>
      <p className="mt-4 font-semibold text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-8 py-3 text-sm font-bold uppercase tracking-widest text-cream hover:bg-terracotta"
      >
        Back home
      </Link>
    </div>
  );
}
