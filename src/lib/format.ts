/** Formato ARS estable entre server y browser (evita errores de hidratación). */
export function formatPrice(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  const withDots = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${rounded < 0 ? "-" : ""}$ ${withDots}`;
}

/** Convierte un número local AR a formato internacional para wa.me */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  return `549${digits}`;
}

export function toWhatsAppLink(number: string, message: string): string {
  const phone = normalizeWhatsAppNumber(number);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
