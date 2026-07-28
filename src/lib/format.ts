export function formatPrice(amount: string, currencyCode: string): string {
  const value = parseFloat(amount);

  return new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact card price, e.g. 2590000 → "2.590K". */
export function formatPriceK(amount: string): string {
  const value = Math.round(parseFloat(amount) / 1000);

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}K`;
}
