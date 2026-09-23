import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { formatChoiceSummary } from "@/lib/choiceProducts";
import { formatPrice, toWhatsAppLink } from "@/lib/format";
import type { CartItem, Product, Settings } from "@/types";

export type DeliveryType = "envio" | "retiro";
export type PaymentMethod = "efectivo" | "transferencia";

export function buildOrderMessage(params: {
  settings: Settings;
  products: Product[];
  cart: CartItem[];
  customerName?: string;
  deliveryType?: DeliveryType | "";
  customerAddress?: string;
  paymentMethod?: PaymentMethod | "";
  notes?: string;
}): string {
  const {
    settings,
    products,
    cart,
    customerName,
    deliveryType,
    customerAddress,
    paymentMethod,
    notes,
  } = params;
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: string[] = [];

  lines.push(`🍕 *Pedido ${settings.business_name}*`);
  lines.push("");

  let total = 0;

  for (const category of CATEGORY_ORDER) {
    const items = cart
      .map((item) => {
        const product = byId.get(item.productId);
        if (!product || product.category !== category || item.quantity <= 0) {
          return null;
        }
        const subtotal = product.price * item.quantity;
        total += subtotal;
        const summary = formatChoiceSummary(item.choices, products);
        const choiceNote = summary
          ? `\n  Empanadas${item.quantity > 1 ? " (cada una)" : ""}: ${summary}`
          : "";
        return `• ${item.quantity}x ${product.name} — ${formatPrice(subtotal)}${choiceNote}`;
      })
      .filter(Boolean) as string[];

    if (items.length > 0) {
      lines.push(`*${CATEGORY_LABELS[category]}*`);
      lines.push(...items);
      lines.push("");
    }
  }

  lines.push(`*Total: ${formatPrice(total)}*`);
  lines.push("");

  if (customerName?.trim()) lines.push(`Nombre: ${customerName.trim()}`);

  if (deliveryType === "retiro") {
    lines.push("Modalidad: Retiro en el local");
  } else if (deliveryType === "envio") {
    lines.push("Modalidad: Envío");
    if (customerAddress?.trim()) {
      lines.push(`Dirección: ${customerAddress.trim()}`);
    }
  }

  if (paymentMethod === "efectivo") {
    lines.push("Pago: Efectivo");
  } else if (paymentMethod === "transferencia") {
    lines.push("Pago: Transferencia");
  }

  if (notes?.trim()) lines.push(`Notas: ${notes.trim()}`);

  return lines.join("\n").trim();
}

export function buildWhatsAppOrderUrl(params: {
  settings: Settings;
  products: Product[];
  cart: CartItem[];
  customerName?: string;
  deliveryType?: DeliveryType | "";
  customerAddress?: string;
  paymentMethod?: PaymentMethod | "";
  notes?: string;
}): string {
  const message = buildOrderMessage(params);
  return toWhatsAppLink(params.settings.whatsapp_number, message);
}
