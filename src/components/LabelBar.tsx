type LabelBarProps = {
  label: string;
  borderTop?: boolean;
};

export function LabelBar({ label, borderTop = false }: LabelBarProps) {
  return (
    <div
      className={`flex items-center justify-center border-b border-ink bg-cream px-5 py-4 sm:px-8 sm:py-5 ${
        borderTop ? "border-t" : ""
      }`}
    >
      <p className="text-center text-xs font-bold uppercase tracking-[0.25em] sm:text-sm">
        {label}
      </p>
    </div>
  );
}
