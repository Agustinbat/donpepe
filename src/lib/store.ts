import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_STORE } from "@/lib/seed";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { Product, Settings, StoreData } from "@/types";

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function ensureLocalStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.writeFile(
      LOCAL_STORE_PATH,
      JSON.stringify(DEFAULT_STORE, null, 2),
      "utf8",
    );
    return structuredClone(DEFAULT_STORE);
  }
}

async function writeLocalStore(data: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price),
    category: row.category as Product["category"],
    available: Boolean(row.available),
    sort_order: Number(row.sort_order ?? 0),
  };
}

async function getStoreFromSupabase(): Promise<StoreData> {
  const supabase = getSupabaseAdmin();

  const [productsRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").order("sort_order", { ascending: true }),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (productsRes.error) throw productsRes.error;

  const settings: Settings = settingsRes.data
    ? {
        whatsapp_number: settingsRes.data.whatsapp_number,
        business_name: settingsRes.data.business_name,
        address: settingsRes.data.address,
        phone: settingsRes.data.phone,
        tagline: settingsRes.data.tagline,
      }
    : DEFAULT_STORE.settings;

  const products = (productsRes.data || []).map(mapProduct);

  return {
    products: products.length > 0 ? products : DEFAULT_STORE.products,
    settings,
  };
}

export async function getStore(): Promise<StoreData> {
  if (isSupabaseConfigured()) {
    return getStoreFromSupabase();
  }
  return ensureLocalStore();
}

export async function getProducts(includeUnavailable = false): Promise<Product[]> {
  const store = await getStore();
  const products = [...store.products].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
  return includeUnavailable ? products : products.filter((p) => p.available);
}

export async function getSettings(): Promise<Settings> {
  const store = await getStore();
  return store.settings;
}

function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "price" | "available" | "name" | "description">>,
): Promise<Product> {
  const cleanPatch = pickDefined(patch);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .update({
        ...cleanPatch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapProduct(data);
  }

  const store = await ensureLocalStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Producto no encontrado");
  store.products[index] = { ...store.products[index], ...cleanPatch };
  await writeLocalStore(store);
  return store.products[index];
}

export async function updateSettings(
  patch: Partial<Settings>,
): Promise<Settings> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const current = await getSettings();
    const next = { ...current, ...patch };
    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          id: 1,
          ...next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return {
      whatsapp_number: data.whatsapp_number,
      business_name: data.business_name,
      address: data.address,
      phone: data.phone,
      tagline: data.tagline,
    };
  }

  const store = await ensureLocalStore();
  store.settings = { ...store.settings, ...patch };
  await writeLocalStore(store);
  return store.settings;
}

export function storageMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
