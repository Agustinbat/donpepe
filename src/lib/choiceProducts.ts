import type { Product, ProductChoice } from "@/types";

/** Productos que piden una cantidad fija de empanadas a elección. */
export const EMPANADA_CHOICE_COUNTS: Record<string, number> = {
  "promo-2": 6,
  "promo-4": 12,
  "empa-docena": 12,
  "empa-media-docena": 6,
};

export function empanadaChoiceCount(productId: string): number | null {
  return EMPANADA_CHOICE_COUNTS[productId] ?? null;
}

export function empanadaFlavors(products: Product[]): Product[] {
  return products.filter(
    (product) =>
      product.category === "empanadas" &&
      product.available &&
      empanadaChoiceCount(product.id) === null,
  );
}

export function normalizeChoices(choices: ProductChoice[]): ProductChoice[] {
  return choices
    .filter((choice) => choice.quantity > 0)
    .sort((a, b) => a.productId.localeCompare(b.productId));
}

export function choiceKey(choices: ProductChoice[] | undefined): string {
  if (!choices?.length) return "";
  return normalizeChoices(choices)
    .map((choice) => `${choice.productId}:${choice.quantity}`)
    .join("|");
}

export function formatChoiceSummary(
  choices: ProductChoice[] | undefined,
  products: Product[],
): string {
  if (!choices?.length) return "";
  const byId = new Map(products.map((product) => [product.id, product.name]));
  return normalizeChoices(choices)
    .map((choice) => `${choice.quantity}× ${byId.get(choice.productId) ?? "Empanada"}`)
    .join(", ");
}
