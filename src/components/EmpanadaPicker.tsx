"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QuantityControl } from "@/components/QuantityControl";
import { formatChoiceSummary } from "@/lib/choiceProducts";
import type { Product, ProductChoice } from "@/types";

type Props = {
  open: boolean;
  productName: string;
  required: number;
  flavors: Product[];
  initialChoices?: ProductChoice[];
  previousChoices?: ProductChoice[];
  sessionKey: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (choices: ProductChoice[]) => void;
};

export function EmpanadaPicker({
  open,
  productName,
  required,
  flavors,
  initialChoices,
  previousChoices,
  sessionKey,
  confirmLabel,
  onClose,
  onConfirm,
}: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const initialRef = useRef(initialChoices);
  initialRef.current = initialChoices;

  useEffect(() => {
    if (!open) return;
    const next: Record<string, number> = {};
    for (const choice of initialRef.current ?? []) {
      next[choice.productId] = choice.quantity;
    }
    setCounts(next);
  }, [open, sessionKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const selected = useMemo(
    () => Object.values(counts).reduce((sum, qty) => sum + qty, 0),
    [counts],
  );
  const remaining = Math.max(0, required - selected);
  const ready = selected === required && flavors.length > 0;

  const previousSummary = formatChoiceSummary(previousChoices, flavors);
  const showRepeat =
    previousSummary.length > 0 &&
    formatChoiceSummary(initialChoices, flavors) !== previousSummary;

  function setFlavor(productId: string, quantity: number) {
    setCounts((prev) => {
      const current = prev[productId] ?? 0;
      const total = Object.values(prev).reduce((sum, qty) => sum + qty, 0);
      const nextQty = Math.max(0, Math.min(quantity, required - (total - current)));
      const next = { ...prev };
      if (nextQty <= 0) delete next[productId];
      else next[productId] = nextQty;
      return next;
    });
  }

  function fillFlavor(productId: string) {
    setCounts((prev) => {
      const total = Object.values(prev).reduce((sum, qty) => sum + qty, 0);
      const nextQty = (prev[productId] ?? 0) + (required - total);
      if (nextQty <= 0) return prev;
      return { ...prev, [productId]: nextQty };
    });
  }

  function applyChoices(choices: ProductChoice[]) {
    const next: Record<string, number> = {};
    for (const choice of choices) {
      if (choice.quantity > 0) next[choice.productId] = choice.quantity;
    }
    setCounts(next);
  }

  function confirm() {
    if (!ready) return;
    onConfirm(
      Object.entries(counts)
        .filter(([, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="empanada-picker-title"
        className="relative flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
      >
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="empanada-picker-title" className="text-xl font-bold">
                Elegí las empanadas
              </h2>
              <p className="mt-1 text-sm text-muted">
                {productName}. Tienen que ser {required}; podés mezclar gustos.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-muted hover:bg-white/10 hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          {showRepeat && previousChoices ? (
            <button
              type="button"
              onClick={() => applyChoices(previousChoices)}
              className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-left text-sm transition hover:border-accent"
            >
              <span className="block text-xs uppercase tracking-wide text-muted">
                Repetir la última
              </span>
              <span className="mt-0.5 block">{previousSummary}</span>
            </button>
          ) : null}
        </div>

        <div className="overflow-y-auto px-5 py-2">
          {flavors.length === 0 ? (
            <p className="py-6 text-sm text-muted">
              No hay empanadas disponibles para elegir.
            </p>
          ) : (
            <ul>
              {flavors.map((flavor) => {
                const value = counts[flavor.id] ?? 0;
                return (
                  <li
                    key={flavor.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{flavor.name}</p>
                      {remaining > 0 ? (
                        <button
                          type="button"
                          onClick={() => fillFlavor(flavor.id)}
                          className="mt-1 text-xs font-semibold text-accent"
                        >
                          El resto ({remaining})
                        </button>
                      ) : null}
                    </div>
                    <QuantityControl
                      value={value}
                      max={value + remaining}
                      onChange={(qty) => setFlavor(flavor.id, qty)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Seleccionadas</span>
              <span className="font-semibold tabular-nums" aria-live="polite">
                {selected} de {required}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(100, (selected / required) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={confirm}
            className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-accent/40 disabled:text-white/60"
          >
            {ready ? confirmLabel : `Elegí ${required} empanadas`}
          </button>
        </div>
      </div>
    </div>
  );
}
