"use client";

import { useMemo, useState } from "react";
import { formatChoiceSummary } from "@/lib/choiceProducts";
import { formatPrice } from "@/lib/format";
import {
  buildWhatsAppOrderUrl,
  type DeliveryType,
  type PaymentMethod,
} from "@/lib/whatsapp";
import type { CartItem, Product, Settings } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  settings: Settings;
  total: number;
};

const selectClassName =
  "w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2";

export function CheckoutModal({
  open,
  onClose,
  products,
  cart,
  settings,
  total,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType | "">("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [notes, setNotes] = useState("");

  const choiceLines = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        const summary = formatChoiceSummary(item.choices, products);
        if (!product || !summary) return [];
        return [
          {
            key: `${item.productId}:${summary}`,
            label: `${item.quantity}× ${product.name}`,
            summary,
          },
        ];
      }),
    [cart, products],
  );

  const canSend =
    customerName.trim().length > 0 &&
    deliveryType !== "" &&
    paymentMethod !== "" &&
    (deliveryType === "retiro" || customerAddress.trim().length > 0);

  const waUrl = useMemo(
    () =>
      buildWhatsAppOrderUrl({
        settings,
        products,
        cart,
        customerName,
        deliveryType,
        customerAddress,
        paymentMethod,
        notes,
      }),
    [
      settings,
      products,
      cart,
      customerName,
      deliveryType,
      customerAddress,
      paymentMethod,
      notes,
    ],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="checkout-title" className="text-xl font-bold">
              Confirmar pedido
            </h2>
            <p className="mt-1 text-sm text-muted">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(total)}
              </span>
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

        {choiceLines.length > 0 ? (
          <ul className="mb-4 space-y-2 rounded-2xl bg-background px-3 py-3 text-sm">
            {choiceLines.map((line) => (
              <li key={line.key}>
                <p className="font-semibold">{line.label}</p>
                <p className="mt-0.5 text-muted">{line.summary}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Nombre</span>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
              placeholder="Tu nombre"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-muted">Modalidad</span>
            <select
              value={deliveryType}
              onChange={(e) =>
                setDeliveryType(e.target.value as DeliveryType | "")
              }
              className={selectClassName}
              required
            >
              <option value="">Seleccioná una opción</option>
              <option value="envio">Envío a domicilio</option>
              <option value="retiro">Retiro en el local</option>
            </select>
          </label>

          {deliveryType === "envio" ? (
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Dirección de envío</span>
              <input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
                placeholder="Calle, número, barrio..."
                required
              />
            </label>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1 block text-muted">Método de pago</span>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod | "")
              }
              className={selectClassName}
              required
            >
              <option value="">Seleccioná una opción</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-muted">Notas (opcional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
              placeholder="Sin cebolla, timbre, etc."
            />
          </label>
        </div>

        {!canSend ? (
          <p className="mt-4 text-xs text-muted">
            Completá nombre, modalidad
            {deliveryType === "envio" ? ", dirección" : ""} y método de pago
            para continuar.
          </p>
        ) : null}

        {canSend ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Enviar pedido por WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 flex w-full cursor-not-allowed items-center justify-center rounded-full bg-[#25D366]/40 px-5 py-3 text-sm font-semibold text-black/50"
          >
            Enviar pedido por WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
