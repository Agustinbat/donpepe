"use client";

import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CartBar } from "@/components/CartBar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { EmpanadaPicker } from "@/components/EmpanadaPicker";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import {
  choiceKey,
  empanadaChoiceCount,
  empanadaFlavors,
  formatChoiceSummary,
  normalizeChoices,
} from "@/lib/choiceProducts";
import type { CartItem, Product, ProductChoice, Settings } from "@/types";

type Props = {
  products: Product[];
  settings: Settings;
};

type PickerState = {
  productId: string;
  mode: "add" | "edit";
  choiceKey: string;
};

export function MenuApp({ products, settings }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [picker, setPicker] = useState<PickerState | null>(null);

  const flavors = useMemo(() => empanadaFlavors(products), [products]);

  const { itemCount, total } = useMemo(() => {
    let itemCount = 0;
    let total = 0;
    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      itemCount += item.quantity;
      total += product.price * item.quantity;
    }
    return { itemCount, total };
  }, [cart, products]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: products.filter((p) => p.category === category),
    })).filter((group) => group.items.length > 0);
  }, [products]);

  function quantityOf(productId: string) {
    return cart
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  function setQuantity(product: Product, quantity: number) {
    const required = empanadaChoiceCount(product.id);
    const current = quantityOf(product.id);

    if (required) {
      if (quantity > current) {
        const last = [...cart].reverse().find((item) => item.productId === product.id);
        setPicker({
          productId: product.id,
          mode: "add",
          choiceKey: last ? choiceKey(last.choices) : "",
        });
        return;
      }
      if (quantity < current) removeOneChoice(product.id);
      return;
    }

    setCart((prev) => {
      const others = prev.filter((item) => item.productId !== product.id);
      if (quantity <= 0) return others;
      return [...others, { productId: product.id, quantity }];
    });
  }

  function removeOneChoice(productId: string) {
    setCart((prev) => {
      const index = prev.findLastIndex((item) => item.productId === productId);
      if (index < 0) return prev;
      const item = prev[index];
      if (item.quantity <= 1) return prev.filter((_, i) => i !== index);
      const next = [...prev];
      next[index] = { ...item, quantity: item.quantity - 1 };
      return next;
    });
  }

  function saveChoices(choices: ProductChoice[]) {
    if (!picker) return;
    const normalized = normalizeChoices(choices);
    const key = choiceKey(normalized);

    setCart((prev) => {
      const next = prev.map((item) => ({ ...item }));
      let quantity = 1;

      if (picker.mode === "edit") {
        const index = next.findIndex(
          (item) =>
            item.productId === picker.productId &&
            choiceKey(item.choices) === picker.choiceKey,
        );
        if (index >= 0) {
          quantity = next[index].quantity;
          next.splice(index, 1);
        }
      }

      const match = next.findIndex(
        (item) => item.productId === picker.productId && choiceKey(item.choices) === key,
      );
      if (match >= 0) {
        next[match] = { ...next[match], quantity: next[match].quantity + quantity };
      } else {
        next.push({
          productId: picker.productId,
          quantity,
          choices: normalized,
        });
      }
      return next;
    });

    setPicker(null);
  }

  const pickerProduct = picker
    ? products.find((product) => product.id === picker.productId)
    : undefined;
  const pickerRequired = picker ? empanadaChoiceCount(picker.productId) : null;
  const editingLine =
    picker?.mode === "edit"
      ? cart.find(
          (item) =>
            item.productId === picker.productId &&
            choiceKey(item.choices) === picker.choiceKey,
        )
      : undefined;
  const previousLine = picker
    ? [...cart].reverse().find((item) => item.productId === picker.productId && item.choices)
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      <header className="border-b border-border bg-black">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center">
          <h1>
            <BrandLogo title={settings.business_name} />
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-white/80">
            {settings.tagline}
          </p>
          <div className="mt-5 h-1 w-28 rounded-full bg-accent" />
          <p className="mt-5 text-sm text-muted">{settings.address}</p>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
          {grouped.map(({ category }) => (
            <a
              key={category}
              href={`#${category}`}
              className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-accent hover:text-accent"
            >
              {CATEGORY_LABELS[category]}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {grouped.map(({ category, items }) => (
          <section key={category} id={category} className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold tracking-wide">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-3">
              {items.map((product) => {
                const choiceLines = cart
                  .filter((item) => item.productId === product.id && item.choices?.length)
                  .map((item) => ({
                    key: choiceKey(item.choices),
                    quantity: item.quantity,
                    summary: formatChoiceSummary(item.choices, products),
                  }));

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantityOf(product.id)}
                    requiresChoices={empanadaChoiceCount(product.id) !== null}
                    choiceLines={choiceLines}
                    onQuantityChange={(qty) => setQuantity(product, qty)}
                    onEditChoice={(key) =>
                      setPicker({ productId: product.id, mode: "edit", choiceKey: key })
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <CartBar
        itemCount={itemCount}
        total={total}
        onCheckout={() => setCheckoutOpen(true)}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        products={products}
        cart={cart}
        settings={settings}
        total={total}
      />

      {picker && pickerProduct && pickerRequired ? (
        <EmpanadaPicker
          open
          productName={pickerProduct.name}
          required={pickerRequired}
          flavors={flavors}
          sessionKey={`${picker.mode}:${picker.choiceKey}`}
          initialChoices={editingLine?.choices}
          previousChoices={picker.mode === "add" ? previousLine?.choices : undefined}
          confirmLabel={picker.mode === "edit" ? "Guardar cambios" : "Agregar al pedido"}
          onClose={() => setPicker(null)}
          onConfirm={saveChoices}
        />
      ) : null}
    </div>
  );
}
