"use client";

import { useState } from "react";

type SearchPageBarProps = {
  defaultQuery?: string;
};

export function SearchPageBar({ defaultQuery = "" }: SearchPageBarProps) {
  const [active, setActive] = useState(false);

  return (
    <>
      {active ? (
        <button
          type="button"
          aria-label="Dismiss search focus"
          onClick={() => setActive(false)}
          className="fixed inset-0 z-40 bg-ink/40"
        />
      ) : null}

      <div
        className={`relative border-b border-ink bg-cream ${
          active ? "z-50" : ""
        }`}
      >
        <form
          action="/search"
          method="get"
          className="flex items-center gap-4 px-3 py-3 sm:px-5"
        >
          <label
            htmlFor="search"
            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted sm:text-xs"
          >
            Find frames
          </label>
          <input
            id="search"
            name="q"
            type="search"
            defaultValue={defaultQuery}
            placeholder="Search Ray-Ban, Oakley, aviator…"
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink-muted"
          />
          <button
            type="submit"
            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-brand sm:text-xs"
          >
            Search
          </button>
        </form>
      </div>
    </>
  );
}
