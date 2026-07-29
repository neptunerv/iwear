"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

type SearchBarPopupProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchBarPopup({ open, onClose }: SearchBarPopupProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20"
      />

      <div className="relative z-50 border-t border-ink bg-cream text-ink">
        <form
          className="flex items-center gap-4 px-5 py-4 sm:px-8"
          onSubmit={(event) => {
            event.preventDefault();
            const query = new FormData(event.currentTarget).get("q");
            if (typeof query === "string" && query.trim()) {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              onClose();
            }
          }}
        >
          <SearchIcon className="h-5 w-5 shrink-0" />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="site-search"
            name="q"
            type="search"
            placeholder="Search Ray-Ban, Oakley, aviator…"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-brand"
          >
            Close
          </button>
        </form>
      </div>
    </>
  );
}
