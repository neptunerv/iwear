type ProductStripPlaceholderProps = {
  label?: string;
  fill?: boolean;
};

export function ProductStripPlaceholder({
  label = "Coming soon",
  fill = false,
}: ProductStripPlaceholderProps) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden bg-white ${fill ? "h-full" : "aspect-square"}`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="h-7 w-14 border border-ink" />
        <div className="flex gap-2.5">
          <div className="h-5 w-9 rounded-full border border-ink" />
          <div className="h-5 w-9 rounded-full border border-ink" />
        </div>
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}
