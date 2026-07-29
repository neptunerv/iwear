"use client";

import { useEffect, useId, type ReactNode } from "react";

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function SideDrawer({ open, onClose, title, children }: SideDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label={`Close ${title.toLowerCase()}`}
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-1/2 flex-col border-l border-ink bg-cream text-ink shadow-[-4px_0_24px_rgba(13,11,9,0.08)] sm:w-1/4"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink px-4 sm:px-5">
          <h2
            id={titleId}
            className="text-xs font-bold uppercase tracking-[0.2em]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-brand"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
