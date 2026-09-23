"use client";

import { QuantityControl } from "@/components/QuantityControl";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

export type ChoiceLine = {
  key: string;
  quantity: number;
  summary: string;
};

type Props = {
  product: Product;
  quantity: number;
  requiresChoices?: boolean;
  choiceLines?: ChoiceLine[];
  onQuantityChange: (quantity: number) => void;
  onEditChoice?: (key: string) => void;
};

export function ProductCard({
  product,
  quantity,
  requiresChoices = false,
  choiceLines = [],
  onQuantityChange,
  onEditChoice,
}: Props) {
  return (
    <article
      className={`rounded-2xl border border-border bg-card p-4 transition ${
        quantity > 0 ? "ring-1 ring-accent/60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight">
            {product.name}
          </h3>
          {product.description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}
          <p className="mt-3 text-base font-bold text-accent">
            {formatPrice(product.price)}
          </p>
          {requiresChoices && quantity === 0 ? (
            <p className="mt-2 text-xs text-muted">
              Tocá + para elegir las empanadas.
            </p>
          ) : null}
        </div>
        <QuantityControl value={quantity} onChange={onQuantityChange} />
      </div>
      {choiceLines.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-border pt-3">
          {choiceLines.map((line) => (
            <li key={line.key} className="flex items-start justify-between gap-3 text-sm">
              <p className="leading-snug">
                {line.summary}
                {line.quantity > 1 ? (
                  <span className="text-muted"> · ×{line.quantity}</span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => onEditChoice?.(line.key)}
                className="shrink-0 font-semibold text-accent"
              >
                Cambiar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
