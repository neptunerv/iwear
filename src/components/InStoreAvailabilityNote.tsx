import { site } from "@/lib/site";

type InStoreAvailabilityNoteProps = {
  /** Shop catalog strip under the filter bar. */
  compact?: boolean;
};

/**
 * Catalog listings are not live store-floor stock. Ask shoppers to
 * confirm a frame before they come in.
 */
export function InStoreAvailabilityNote({
  compact = false,
}: InStoreAvailabilityNoteProps) {
  const messageLink = (
    <a
      href={site.messageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink underline decoration-ink/30 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
    >
      {site.whatsappLabel}
    </a>
  );

  if (compact) {
    return (
      <p className="border-b border-ink bg-cream px-3 py-2 text-center text-[10px] font-semibold leading-relaxed text-ink-muted sm:px-5 sm:text-xs">
        Listings aren’t live store stock. {messageLink} to check a frame.
      </p>
    );
  }

  return (
    <>
      This page isn’t live store stock. {messageLink} to confirm it’s in
      store.
    </>
  );
}
