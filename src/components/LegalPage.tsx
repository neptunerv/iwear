import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  return (
    <>
      <HomeScrollSnap keepHeaderBorder />

      <section
        id="hero"
        className="snap-section relative flex flex-col bg-cream text-ink"
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-ink sm:text-6xl">
            {title}
          </h1>
          <div className="mt-5 max-w-sm space-y-4 text-sm font-semibold leading-relaxed text-ink-muted">
            {children}
          </div>
        </div>
      </section>

      <Footer viewport snap className="legal-page" />
    </>
  );
}
