import type { ProductVariant } from "@/lib/shopify";

export type ProductOption = {
  name: string;
  values: string[];
};

export function getProductOptions(
  variants: ProductVariant[],
): ProductOption[] {
  const optionMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const option of variant.selectedOptions) {
      if (option.name === "Title" && option.value === "Default Title") {
        continue;
      }

      if (!optionMap.has(option.name)) {
        optionMap.set(option.name, new Set());
      }

      optionMap.get(option.name)!.add(option.value);
    }
  }

  return Array.from(optionMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
}

export function findVariantByOptions(
  variants: ProductVariant[],
  selected: Record<string, string>,
): ProductVariant | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      (option) =>
        option.name === "Title" && option.value === "Default Title"
          ? true
          : selected[option.name] === option.value,
    ),
  );
}
