import type { ReactNode } from "react";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-poster text-4xl uppercase text-ink">{title}</h1>
      <div className="mt-10 space-y-6 text-base font-semibold leading-relaxed text-ink-muted">
        {children}
      </div>
    </div>
  );
}
