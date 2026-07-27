import { LabelBar } from "@/components/LabelBar";

const trustPoints = [
  {
    title: "Authorized reseller",
    body: "We are an official Luxottica retail partner. Every pair is sourced directly — no grey market, no fakes.",
  },
  {
    title: "Official warranty",
    body: "Full manufacturer warranty on every frame, honored in-store and worldwide.",
  },
  {
    title: "Fast Bali delivery",
    body: "Same-day delivery across Kuta and Sanur. Nationwide shipping in 1–3 days.",
  },
  {
    title: "Try before you buy",
    body: "Visit Beachwalk or Sanur to try frames in person — including Prada, Armani and other brands only available in store.",
  },
] as const;

export function TrustSection() {
  return (
    <div className="snap-section flex flex-col bg-cream text-ink">
      <LabelBar label="Why buy from iWear" />

      <section className="grid min-h-0 flex-1 grid-cols-2">
        {trustPoints.map((point, index) => (
          <div
            key={point.title}
            id={point.title === "Official warranty" ? "warranty" : undefined}
            className={`group flex min-h-[45vh] flex-col justify-end px-8 py-12 transition-colors hover:bg-sand-50 sm:px-10 sm:py-14 md:min-h-0 md:px-12 md:py-16 ${
              index === 0
                ? "border-b-2 border-r-2 border-ink"
                : index === 1
                  ? "border-b-2 border-ink"
                  : index === 2
                    ? "border-r-2 border-ink"
                    : ""
            }`}
          >
            <div>
              <h2 className="font-poster text-4xl uppercase leading-none sm:text-5xl lg:text-6xl">
                {point.title}
              </h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
                {point.body}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
