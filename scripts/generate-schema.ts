import { writeFileSync } from "fs";
import { DEFAULT_STORE } from "../src/lib/seed";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

const settings = DEFAULT_STORE.settings;
const productValues = DEFAULT_STORE.products
  .map(
    (p) =>
      `  ('${esc(p.id)}', '${esc(p.name)}', '${esc(p.description)}', ${p.price}, '${p.category}', ${p.available}, ${p.sort_order})`,
  )
  .join(",\n");

const sql = `-- Don Pepe — schema para Supabase (gratis)
-- Pegá esto en: Supabase → SQL Editor → Run

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  category text not null check (category in ('promociones', 'pizzas', 'empanadas', 'calzones', 'faina', 'bebidas')),
  available boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null,
  business_name text not null,
  address text not null,
  phone text not null,
  tagline text not null,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public read products" on public.products;
drop policy if exists "Public read settings" on public.settings;

create policy "Public read products"
  on public.products for select
  using (true);

create policy "Public read settings"
  on public.settings for select
  using (true);

insert into public.settings (
  id, whatsapp_number, business_name, address, phone, tagline
) values (
  1,
  '${esc(settings.whatsapp_number)}',
  '${esc(settings.business_name)}',
  '${esc(settings.address)}',
  '${esc(settings.phone)}',
  '${esc(settings.tagline)}'
)
on conflict (id) do update set
  whatsapp_number = excluded.whatsapp_number,
  business_name = excluded.business_name,
  address = excluded.address,
  phone = excluded.phone,
  tagline = excluded.tagline;

truncate table public.products;

insert into public.products (id, name, description, price, category, available, sort_order) values
${productValues};
`;

writeFileSync("supabase/schema.sql", sql, "utf8");
console.log(`Wrote schema with ${DEFAULT_STORE.products.length} products`);
