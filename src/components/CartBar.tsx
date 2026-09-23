"use client";

import { formatPrice } from "@/lib/format";

type Props = {
  itemCount: number;
  total: number;
  onCheckout: () => void;
};

export function CartBar({ itemCount, total, onCheckout }: Props) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </p>
          <p className="text-lg font-bold">{formatPrice(total)}</p>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          Pedir por WhatsApp
        </button>
      </div>
    </div>
  );
}
