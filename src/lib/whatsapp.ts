import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { normalizeChoices } from "@/lib/choiceProducts";
import { formatPrice, toWhatsAppLink } from "@/lib/format";
import type { CartItem, Product, ProductChoice, Settings } from "@/types";

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
}): string {
  const {
    products,
    cart,
    customerName,
    deliveryType,
    customerAddress,
    paymentMethod,
  } = params;
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: string[] = [];
  const name = customerName?.trim();

  lines.push(
    name
      ? `Hola, soy ${name}, quiero hacer el siguiente pedido:`
      : "Hola, quiero hacer el siguiente pedido:",
  );
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
        return formatOrderLine(item, product.name, subtotal, products);
      })
      .filter(Boolean) as string[];

    if (items.length > 0) {
      lines.push(`*${CATEGORY_LABELS[category]}*`);
      lines.push("");
      lines.push(...items);
      lines.push("");
    }
  }

  lines.push(`*Total: ${formatPrice(total)}*`);
  lines.push("");

  if (deliveryType === "retiro") {
    lines.push("Entrega: paso a retirarlo por el local");
  } else if (deliveryType === "envio") {
    lines.push("Entrega: envío a domicilio");
    if (customerAddress?.trim()) {
      lines.push(`Dirección: ${customerAddress.trim()}`);
    }
  }

  if (paymentMethod === "efectivo") {
    lines.push("Pago: efectivo");
  } else if (paymentMethod === "transferencia") {
    lines.push("Pago: transferencia");
  }

  return lines.join("\n").trim();
}

function formatOrderLine(
  item: CartItem,
  productName: string,
  subtotal: number,
  products: Product[],
): string {
  const line = `- ${item.quantity} x ${productName} (${formatPrice(subtotal)})`;
  const flavors = formatFlavorLines(item.choices, products);
  if (flavors.length === 0) return line;

  const label = item.quantity > 1 ? "Sabores de cada una:" : "Sabores:";
  return [line, `  ${label}`, ...flavors].join("\n");
}

function formatFlavorLines(
  choices: ProductChoice[] | undefined,
  products: Product[],
): string[] {
  if (!choices?.length) return [];
  const names = new Map(products.map((product) => [product.id, product.name]));
  return normalizeChoices(choices).map(
    (choice) => `  - ${choice.quantity} x ${names.get(choice.productId) ?? "Empanada"}`,
  );
}

export function buildWhatsAppOrderUrl(params: {
  settings: Settings;
  products: Product[];
  cart: CartItem[];
  customerName?: string;
  deliveryType?: DeliveryType | "";
  customerAddress?: string;
  paymentMethod?: PaymentMethod | "";
}): string {
  const message = buildOrderMessage(params);
  return toWhatsAppLink(params.settings.whatsapp_number, message);
}
