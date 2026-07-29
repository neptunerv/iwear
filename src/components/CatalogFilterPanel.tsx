"use client";

import { useEffect, useId } from "react";
import { onlineBrandNames } from "@/lib/brands";
import {
  countActiveFilters,
  createDefaultFilters,
  frameShapeOptions,
  frameTypeOptions,
  genderOptions,
  getAvailableBrands,
  lensTypeOptions,
  oakleyModelOptions,
  priceRangeOptions,
  sortOptions,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import type { Product } from "@/lib/shopify";

type CatalogFilterPanelProps = {
  open: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  products: Product[];
  fixedBrand?: string;
  hideSaleFilter?: boolean;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b-2 border-ink px-4 py-4 sm:px-5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TogglePill({
  active,
  label,
  onClick,
  disabled = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border-2 px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors sm:px-2.5 sm:py-2 sm:text-[10px] sm:tracking-[0.14em] ${
        disabled
          ? "cursor-not-allowed border-ink/10 bg-cream text-ink/30"
          : active
            ? "border-ink bg-ink text-cream"
            : "border-ink/30 bg-cream text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

function brandSelected(
  brandName: string,
  filters: CatalogFilters,
  fixedBrand?: string,
): boolean {
  const target = brandName.toLowerCase();
  if (fixedBrand?.toLowerCase() === target) return true;
  return filters.brands.some((brand) => brand.toLowerCase() === target);
}

function toggleBrand(
  filters: CatalogFilters,
  brand: string,
): CatalogFilters {
  const nextBrands = toggle(filters.brands, brand);
  const hasOakley = nextBrands.some((b) => b.toLowerCase() === "oakley");

  return {
    ...filters,
    brands: nextBrands,
    // Shape / gender / frame type are cross-brand — keep them when brand pills change.
    // Model is Oakley-only; lens extras stay Ray-Ban+Oakley for now.
    modelFamilies: hasOakley ? filters.modelFamilies : [],
    lensTypes: nextBrands.some((b) => {
      const name = b.toLowerCase();
      return name === "ray-ban" || name === "oakley";
    })
      ? filters.lensTypes
      : [],
  };
}

export function CatalogFilterPanel({
  open,
  onClose,
  filters,
  onChange,
  products,
  fixedBrand,
  hideSaleFilter = false,
}: CatalogFilterPanelProps) {
  const titleId = useId();
  const brandsInCatalog = new Set(
    getAvailableBrands(products).map((brand) => brand.toLowerCase()),
  );
  const brands = fixedBrand ? [] : [...onlineBrandNames];
  const activeCount = countActiveFilters(filters, fixedBrand);

  // Model stays Oakley-only. Lens type still gated to Ray-Ban/Oakley for now.
  // Shape / gender / frame type are always available.
  const isOakley = brandSelected("Oakley", filters, fixedBrand);
  const showLensExtras =
    brandSelected("Ray-Ban", filters, fixedBrand) || isOakley;

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
        aria-label="Close filter"
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
      />

      <aside
        aria-labelledby={titleId}
        className="absolute inset-y-0 left-0 flex w-1/2 flex-col border-r-2 border-ink bg-cream shadow-[4px_0_24px_rgba(13,11,9,0.08)] sm:w-1/4"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b-2 border-ink px-4 sm:px-5">
          <h2
            id={titleId}
            className="text-xs font-bold uppercase tracking-[0.2em]"
          >
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-brand"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <FilterSection title="Sort by">
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <TogglePill
                  key={option.id}
                  label={option.label}
                  active={filters.sort === option.id}
                  onClick={() => onChange({ ...filters, sort: option.id })}
                />
              ))}
            </div>
          </FilterSection>

          {!fixedBrand && (
            <FilterSection title="Brand">
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <TogglePill
                    key={brand}
                    label={brand}
                    active={filters.brands.includes(brand)}
                    disabled={!brandsInCatalog.has(brand.toLowerCase())}
                    onClick={() => onChange(toggleBrand(filters, brand))}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Frame shape">
            <div className="flex flex-wrap gap-2">
              {frameShapeOptions.map((option) => (
                <TogglePill
                  key={option.id}
                  label={option.label}
                  active={filters.frameShapes.includes(option.id)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      frameShapes: toggle(filters.frameShapes, option.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Gender">
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <TogglePill
                  key={option.id}
                  label={option.label}
                  active={filters.genders.includes(option.id)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      genders: toggle(filters.genders, option.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          {isOakley && (
            <FilterSection title="Model">
              <div className="flex flex-wrap gap-2">
                {oakleyModelOptions.map((option) => (
                  <TogglePill
                    key={option.id}
                    label={option.label}
                    active={filters.modelFamilies.includes(option.id)}
                    onClick={() =>
                      onChange({
                        ...filters,
                        modelFamilies: toggle(filters.modelFamilies, option.id),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Frame type">
            <div className="flex flex-wrap gap-2">
              {frameTypeOptions.map((option) => (
                <TogglePill
                  key={option.id}
                  label={option.label}
                  active={filters.frameTypes.includes(option.id)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      frameTypes: toggle(filters.frameTypes, option.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          {showLensExtras && (
            <FilterSection title="Lens type">
              <div className="flex flex-wrap gap-2">
                {lensTypeOptions.map((option) => (
                  <TogglePill
                    key={option.id}
                    label={option.label}
                    active={filters.lensTypes.includes(option.id)}
                    onClick={() =>
                      onChange({
                        ...filters,
                        lensTypes: toggle(filters.lensTypes, option.id),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Price">
            <div className="flex flex-wrap gap-2">
              {priceRangeOptions.map((range) => (
                <TogglePill
                  key={range.id}
                  label={range.label}
                  active={filters.priceRanges.includes(range.id)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      priceRanges: toggle(filters.priceRanges, range.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Availability">
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(event) =>
                  onChange({ ...filters, inStockOnly: event.target.checked })
                }
                className="h-4 w-4 accent-ink"
              />
              In stock only
            </label>
          </FilterSection>

          {!hideSaleFilter && (
            <FilterSection title="Offers">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={filters.onSaleOnly}
                  onChange={(event) =>
                    onChange({ ...filters, onSaleOnly: event.target.checked })
                  }
                  className="h-4 w-4 accent-ink"
                />
                On sale only
              </label>
            </FilterSection>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 border-t-2 border-ink">
          <button
            type="button"
            onClick={() => onChange(createDefaultFilters())}
            className="border-r-2 border-ink px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-sand-50 sm:text-xs sm:tracking-[0.16em]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-ink px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-brand hover:text-ink sm:text-xs sm:tracking-[0.16em]"
          >
            Apply
          </button>
        </div>
      </aside>
    </div>
  );
}
