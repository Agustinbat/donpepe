"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import type { AdminRole } from "@/lib/auth";
import type { Category, Product, Settings } from "@/types";

type Section = Category | "ajustes";

type Props = {
  initialProducts: Product[];
  initialSettings: Settings;
  storage: "supabase" | "local";
  role: AdminRole;
  username: string;
};

export function AdminPanel({
  initialProducts,
  initialSettings,
  storage,
  role,
  username,
}: Props) {
  const router = useRouter();
  const isFullAdmin = role === "admin";
  const [products, setProducts] = useState(initialProducts);
  const [settings, setSettings] = useState(initialSettings);
  const [section, setSection] = useState<Section>("promociones");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = Object.fromEntries(
      CATEGORY_ORDER.map((c) => [c, 0]),
    ) as Record<Category, number>;
    for (const product of products) {
      map[product.category] += 1;
    }
    return map;
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (section === "ajustes") return [];
    return products
      .filter((p) => p.category === section)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }, [products, section]);

  function selectSection(next: Section) {
    if (next === "ajustes" && !isFullAdmin) return;
    setSection(next);
    setSidebarOpen(false);
    setMessage(null);
    setError(null);
  }

  function updateLocalProduct(id: string, patch: Partial<Product>) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  async function patchProduct(
    id: string,
    patch: Partial<Pick<Product, "price" | "available" | "name" | "description">>,
  ) {
    setSavingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data.product } : p)),
      );
      setMessage("Producto actualizado");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingId(null);
    }
  }

  async function saveProduct(product: Product) {
    if (!isFullAdmin) return;
    const name = product.name.trim();
    const description = product.description.trim();
    if (!name) {
      setError("El título no puede estar vacío");
      return;
    }
    if (Number.isNaN(product.price) || product.price < 0) {
      setError("Precio inválido");
      return;
    }
    await patchProduct(product.id, {
      name,
      description,
      price: product.price,
      available: product.available,
    });
  }

  async function saveSettings() {
    if (!isFullAdmin) return;
    setSavingSettings(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSettings(data.settings);
      setMessage("Ajustes guardados");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingSettings(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sectionTitle =
    section === "ajustes" ? "Ajustes del local" : CATEGORY_LABELS[section];

  const roleLabel = isFullAdmin
    ? "Administrador completo"
    : "Solo disponibilidad";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-black">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-border px-3 py-2 text-sm lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              Menú
            </button>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">Panel Don Pepe</h1>
              <p className="text-xs text-muted sm:text-sm">
                {username} · {roleLabel}
                {storage === "local" ? " · Local" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="rounded-full border border-border px-3 py-2 text-sm hover:border-accent sm:px-4"
            >
              Ver menú
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/15 sm:px-4"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-[calc(100vh-73px)]">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card pt-[73px] transition-transform lg:static lg:z-0 lg:translate-x-0 lg:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Categorías
            </p>
            {CATEGORY_ORDER.map((category) => {
              const active = section === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectSection(category)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-accent text-white"
                      : "text-foreground hover:bg-white/5"
                  }`}
                >
                  <span>{CATEGORY_LABELS[category]}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? "bg-white/20" : "bg-white/10 text-muted"
                    }`}
                  >
                    {counts[category]}
                  </span>
                </button>
              );
            })}

            {isFullAdmin ? (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  type="button"
                  onClick={() => selectSection("ajustes")}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    section === "ajustes"
                      ? "bg-accent text-white"
                      : "text-foreground hover:bg-white/5"
                  }`}
                >
                  WhatsApp y local
                </button>
              </>
            ) : null}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-5">
            <div>
              <h2 className="text-2xl font-bold">{sectionTitle}</h2>
              <p className="mt-1 text-sm text-muted">
                {section === "ajustes"
                  ? "Configurá el número de WhatsApp y los datos del local."
                  : isFullAdmin
                    ? "Editá título, descripción, precio y disponibilidad."
                    : "Marcá si el producto está disponible o no en la página."}
              </p>
            </div>

            {(message || error) && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  error
                    ? "border border-red-500/40 bg-red-500/10 text-red-200"
                    : "border border-success/40 bg-success/10 text-green-200"
                }`}
              >
                {error || message}
              </div>
            )}

            {section === "ajustes" && isFullAdmin ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm sm:col-span-2">
                    <span className="mb-1 block text-muted">
                      WhatsApp (pedidos)
                    </span>
                    <input
                      value={settings.whatsapp_number}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          whatsapp_number: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      placeholder="1162345926"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-muted">Teléfono</span>
                    <input
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, phone: e.target.value }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-muted">Eslogan</span>
                    <input
                      value={settings.tagline}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, tagline: e.target.value }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="mb-1 block text-muted">Dirección</span>
                    <input
                      value={settings.address}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, address: e.target.value }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {savingSettings ? "Guardando..." : "Guardar ajustes"}
                </button>
              </section>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
                No hay productos en esta categoría.
              </div>
            ) : (
              <div className="space-y-4">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`rounded-2xl border bg-card p-4 sm:p-5 ${
                      product.available
                        ? "border-border"
                        : "border-red-500/30 opacity-80"
                    }`}
                  >
                    {isFullAdmin ? (
                      <>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-muted">
                            Precio público: {formatPrice(product.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              patchProduct(product.id, {
                                available: !product.available,
                              })
                            }
                            disabled={savingId === product.id}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                              product.available
                                ? "bg-success/15 text-green-300 ring-1 ring-success/40"
                                : "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
                            }`}
                          >
                            {product.available
                              ? "Disponible"
                              : "No disponible"}
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm">
                            <span className="mb-1 block text-muted">Título</span>
                            <input
                              value={product.name}
                              onChange={(e) =>
                                updateLocalProduct(product.id, {
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
                            />
                          </label>

                          <label className="block text-sm">
                            <span className="mb-1 block text-muted">
                              Descripción
                            </span>
                            <textarea
                              value={product.description}
                              onChange={(e) =>
                                updateLocalProduct(product.id, {
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
                            />
                          </label>

                          <label className="block text-sm sm:max-w-xs">
                            <span className="mb-1 block text-muted">Precio</span>
                            <input
                              type="number"
                              min={0}
                              step={100}
                              value={product.price}
                              onChange={(e) =>
                                updateLocalProduct(product.id, {
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none ring-accent focus:ring-2"
                            />
                          </label>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => saveProduct(product)}
                            disabled={savingId === product.id}
                            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                          >
                            {savingId === product.id
                              ? "Guardando..."
                              : "Guardar cambios"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.description ? (
                            <p className="mt-1 text-sm text-muted">
                              {product.description}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm font-medium text-accent">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            patchProduct(product.id, {
                              available: !product.available,
                            })
                          }
                          disabled={savingId === product.id}
                          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                            product.available
                              ? "bg-success/15 text-green-300 ring-1 ring-success/40"
                              : "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
                          }`}
                        >
                          {savingId === product.id
                            ? "Guardando..."
                            : product.available
                              ? "Disponible"
                              : "No disponible"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
