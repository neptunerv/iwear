import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  /** Last updated date, e.g. "August 2026". Omit for pages without dated content. */
  updated?: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, updated, children }: LegalPageProps) {
  return (
    <>
      <HomeScrollSnap keepHeaderBorder documentFlow />

      <section className="bg-cream text-ink">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-6 py-12 text-center sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-ink sm:text-6xl">
            {title}
          </h1>
          {updated ? (
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted/70">
              Last updated {updated}
            </p>
          ) : null}
          <div className="mt-6 max-w-md space-y-4 text-left text-sm font-semibold leading-relaxed text-ink-muted [&_h2]:mt-2 [&_h2]:text-ink [&_li]:ml-4 [&_li]:list-disc [&_ol]:space-y-2 [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </section>

      <Footer className="legal-page" />
    </>
  );
}
