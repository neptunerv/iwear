export function formatPrice(amount: string, currencyCode: string): string {
  const value = parseFloat(amount);

  return new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
