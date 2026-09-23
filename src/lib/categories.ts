import type { Category } from "@/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  promociones: "Promociones",
  pizzas: "Pizzas",
  empanadas: "Empanadas",
  calzones: "Calzones",
  faina: "Fainá",
  bebidas: "Bebidas",
};

export const CATEGORY_ORDER: Category[] = [
  "promociones",
  "pizzas",
  "empanadas",
  "calzones",
  "faina",
  "bebidas",
];
