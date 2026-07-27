/**
 * Normalize and validate a WhatsApp deep link.
 * Accepts `https://wa.me/62…`, `https://api.whatsapp.com/send?phone=…`,
 * or a bare international number (`62812…` / `+62 812…`).
 */
export function normalizeWhatsAppUrl(raw: string | undefined | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(value)) {
    return value;
  }

  const digits = value.replace(/[^\d]/g, "");
  if (digits.length >= 8 && digits.length <= 15) {
    return `https://wa.me/${digits}`;
  }

  return null;
}
