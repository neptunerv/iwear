type PageLoadingProps = {
  message?: string;
};

export function PageLoading({ message = "Loading" }: PageLoadingProps) {
  return (
    <div
      className="relative flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center bg-cream"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="page-spinner page-spinner-brand" aria-hidden="true" />
      <span className="sr-only">{message}</span>
    </div>
  );
}
