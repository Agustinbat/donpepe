-- Don Pepe — schema para Supabase (gratis)
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
  '1162345926',
  'Don Pepe',
  'Burgos Nº 947 Esq. M. Añeiros - Morón',
  '11-6124-9867',
  'La mejor pizza a la piedra'
)
on conflict (id) do update set
  whatsapp_number = excluded.whatsapp_number,
  business_name = excluded.business_name,
  address = excluded.address,
  phone = excluded.phone,
  tagline = excluded.tagline;

truncate table public.products;

insert into public.products (id, name, description, price, category, available, sort_order) values
  ('promo-1', '2 Grandes de Muzzarella', 'Promo 1: dos pizzas grandes de muzzarella.', 32000, 'promociones', true, 1),
  ('promo-2', '1 Grande de Muzza + 6 empanadas', 'Promo 2: 1 pizza grande de muzzarella + 6 empanadas a elección.', 30000, 'promociones', true, 2),
  ('promo-3', '2 Gde. Muzza + 1 Gde. Fugazza con Queso', 'Promo 3: 2 pizzas grandes de muzzarella + 1 grande de fugazza con queso.', 50000, 'promociones', true, 3),
  ('promo-4', '1 Gde. de Muzza + 1 Doc. Empanadas', 'Promo 4: 1 pizza grande de muzzarella + 1 docena de empanadas a elección.', 40000, 'promociones', true, 4),
  ('promo-5', '1 Gde. Muzza + 1 Gde. Jamón y Morrón', 'Promo 5: 1 pizza grande de muzzarella + 1 grande de jamón y morrón.', 43000, 'promociones', true, 5),
  ('promo-6', '1 Gde. de Jamón + 1 Gde. de Napolitana', 'Promo 6: 1 pizza grande de jamón + 1 pizza grande napolitana.', 44000, 'promociones', true, 6),
  ('pizza-00-ch', 'Especial Don Pepe · Chica', 'Nº 00. Salsa tomate, muzzarella, tomate en cubitos, huevo rallado.', 30000, 'pizzas', true, 1),
  ('pizza-00-gr', 'Especial Don Pepe · Grande', 'Nº 00. Salsa tomate, muzzarella, tomate en cubitos, huevo rallado.', 33000, 'pizzas', true, 2),
  ('pizza-01-ch', 'Canchera · Chica', 'Nº 01. Salsa canchera (ajo, ají molido, perejil y orégano).', 16500, 'pizzas', true, 3),
  ('pizza-01-gr', 'Canchera · Grande', 'Nº 01. Salsa canchera (ajo, ají molido, perejil y orégano).', 17000, 'pizzas', true, 4),
  ('pizza-02-ch', 'Muzzarella · Chica', 'Nº 02. Salsa de tomate, muzzarella, aceitunas verdes.', 15000, 'pizzas', true, 5),
  ('pizza-02-gr', 'Muzzarella · Grande', 'Nº 02. Salsa de tomate, muzzarella, aceitunas verdes.', 17000, 'pizzas', true, 6),
  ('pizza-03-ch', 'Romana · Chica', 'Nº 03. Salsa tomate, muzzarella, anchoas y aceitunas verdes.', 21000, 'pizzas', true, 7),
  ('pizza-03-gr', 'Romana · Grande', 'Nº 03. Salsa tomate, muzzarella, anchoas y aceitunas verdes.', 24000, 'pizzas', true, 8),
  ('pizza-04-ch', 'Anchoas · Chica', 'Nº 04. Salsa tomate, filet de anchoas, morrones y aceitunas.', 21000, 'pizzas', true, 9),
  ('pizza-04-gr', 'Anchoas · Grande', 'Nº 04. Salsa tomate, filet de anchoas, morrones y aceitunas.', 24000, 'pizzas', true, 10),
  ('pizza-05-ch', 'Fugazza · Chica', 'Nº 05. Cebolla, aceite de oliva, pimienta, orégano y aceitunas.', 18000, 'pizzas', true, 11),
  ('pizza-05-gr', 'Fugazza · Grande', 'Nº 05. Cebolla, aceite de oliva, pimienta, orégano y aceitunas.', 19000, 'pizzas', true, 12),
  ('pizza-06-ch', 'Fugazza con Queso · Chica', 'Nº 06. Idem Fugazza, más muzzarella.', 20000, 'pizzas', true, 13),
  ('pizza-06-gr', 'Fugazza con Queso · Grande', 'Nº 06. Idem Fugazza, más muzzarella.', 23000, 'pizzas', true, 14),
  ('pizza-07-ch', 'Napolitana · Chica', 'Nº 07. Salsa de tomate, muzza, rodajas de tomate, aceite de oliva, ajo y aceitunas.', 22000, 'pizzas', true, 15),
  ('pizza-07-gr', 'Napolitana · Grande', 'Nº 07. Salsa de tomate, muzza, rodajas de tomate, aceite de oliva, ajo y aceitunas.', 25000, 'pizzas', true, 16),
  ('pizza-08-ch', 'Napolitana Especial · Chica', 'Nº 08. Idem Napolitana, más jamón.', 26000, 'pizzas', true, 17),
  ('pizza-08-gr', 'Napolitana Especial · Grande', 'Nº 08. Idem Napolitana, más jamón.', 29000, 'pizzas', true, 18),
  ('pizza-09-ch', 'Jamón · Chica', 'Nº 09. Salsa de tomate, muzza, jamón, aceite de oliva, aceitunas.', 22000, 'pizzas', true, 19),
  ('pizza-09-gr', 'Jamón · Grande', 'Nº 09. Salsa de tomate, muzza, jamón, aceite de oliva, aceitunas.', 25000, 'pizzas', true, 20),
  ('pizza-10-ch', 'Especial de Jamón · Chica', 'Nº 10. Idem Jamón y Morrón.', 27000, 'pizzas', true, 21),
  ('pizza-10-gr', 'Especial de Jamón · Grande', 'Nº 10. Idem Jamón y Morrón.', 30000, 'pizzas', true, 22),
  ('pizza-11-ch', 'Jamón y Huevo · Chica', 'Nº 11. Salsa de tomate, muzza, jamón, huevo, orégano y aceitunas.', 25000, 'pizzas', true, 23),
  ('pizza-11-gr', 'Jamón y Huevo · Grande', 'Nº 11. Salsa de tomate, muzza, jamón, huevo, orégano y aceitunas.', 28000, 'pizzas', true, 24),
  ('pizza-12-ch', 'Doble Muzzarella · Chica', 'Nº 12. Salsa de tomate, doble porc. muzzarella, orégano y aceitunas.', 21000, 'pizzas', true, 25),
  ('pizza-12-gr', 'Doble Muzzarella · Grande', 'Nº 12. Salsa de tomate, doble porc. muzzarella, orégano y aceitunas.', 24000, 'pizzas', true, 26),
  ('pizza-13-ch', 'Jamaica · Chica', 'Nº 13. Salsa tomate, muzzarella, jamón, rodajas ananá, morrón y aceitunas.', 29000, 'pizzas', true, 27),
  ('pizza-13-gr', 'Jamaica · Grande', 'Nº 13. Salsa tomate, muzzarella, jamón, rodajas ananá, morrón y aceitunas.', 33000, 'pizzas', true, 28),
  ('pizza-14-ch', 'Calabresa · Chica', 'Nº 14. Salsa de tomate, muzzarella, longaniza.', 23000, 'pizzas', true, 29),
  ('pizza-14-gr', 'Calabresa · Grande', 'Nº 14. Salsa de tomate, muzzarella, longaniza.', 25000, 'pizzas', true, 30),
  ('pizza-15-ch', 'Calabresa Especial · Chica', 'Nº 15. Salsa de tomate, muzzarella, longaniza y morrones.', 26000, 'pizzas', true, 31),
  ('pizza-15-gr', 'Calabresa Especial · Grande', 'Nº 15. Salsa de tomate, muzzarella, longaniza y morrones.', 29000, 'pizzas', true, 32),
  ('pizza-16-ch', 'Especial Completa · Chica', 'Nº 16. Salsa de tomate, muzzarella, rod. tomate, jamón y morrón.', 26000, 'pizzas', true, 33),
  ('pizza-16-gr', 'Especial Completa · Grande', 'Nº 16. Salsa de tomate, muzzarella, rod. tomate, jamón y morrón.', 29000, 'pizzas', true, 34),
  ('pizza-17-ch', 'Roquefort · Chica', 'Nº 17. Salsa tomate, muzzarella y roquefort.', 23000, 'pizzas', true, 35),
  ('pizza-17-gr', 'Roquefort · Grande', 'Nº 17. Salsa tomate, muzzarella y roquefort.', 26000, 'pizzas', true, 36),
  ('pizza-18-ch', 'Palmitos · Chica', 'Nº 18. Salsa de tomate, muzza, jamón, huevo duro, palmitos y salsa golf.', 30000, 'pizzas', true, 37),
  ('pizza-18-gr', 'Palmitos · Grande', 'Nº 18. Salsa de tomate, muzza, jamón, huevo duro, palmitos y salsa golf.', 34000, 'pizzas', true, 38),
  ('pizza-19-ch', 'Fugazzeta común · Chica', 'Nº 19. Muzzarella, cebolla, aceite de oliva y orégano (relleno).', 24000, 'pizzas', true, 39),
  ('pizza-19-gr', 'Fugazzeta común · Grande', 'Nº 19. Muzzarella, cebolla, aceite de oliva y orégano (relleno).', 27000, 'pizzas', true, 40),
  ('pizza-20-ch', 'Fugazzeta Especial · Chica', 'Nº 20. Idem fugazzeta común + jamón (relleno).', 27000, 'pizzas', true, 41),
  ('pizza-20-gr', 'Fugazzeta Especial · Grande', 'Nº 20. Idem fugazzeta común + jamón (relleno).', 31000, 'pizzas', true, 42),
  ('pizza-25-ch', 'Pizza de Verduras · Chica', 'Nº 25. Salsa, muzzarella, verdura con salsa blanca y morrones y aceitunas verdes.', 22000, 'pizzas', true, 43),
  ('pizza-25-gr', 'Pizza de Verduras · Grande', 'Nº 25. Salsa, muzzarella, verdura con salsa blanca y morrones y aceitunas verdes.', 25000, 'pizzas', true, 44),
  ('pizza-26-ch', 'Provolone · Chica', 'Nº 26. Salsa de tomate, jamón, muzzarella, provolone y aceitunas negras.', 25000, 'pizzas', true, 45),
  ('pizza-26-gr', 'Provolone · Grande', 'Nº 26. Salsa de tomate, jamón, muzzarella, provolone y aceitunas negras.', 28000, 'pizzas', true, 46),
  ('pizza-27-ch', 'Rúcula y Jamón Crudo · Chica', 'Nº 27. Salsa, muzzarella, rúcula, jamón crudo y aceitunas.', 24000, 'pizzas', true, 47),
  ('pizza-27-gr', 'Rúcula y Jamón Crudo · Grande', 'Nº 27. Salsa, muzzarella, rúcula, jamón crudo y aceitunas.', 29000, 'pizzas', true, 48),
  ('pizza-28-ch', 'Española · Chica', 'Nº 28. Salsa de tomate, muzzarella, huevo duro rallado, aceitunas verdes.', 23000, 'pizzas', true, 49),
  ('pizza-28-gr', 'Española · Grande', 'Nº 28. Salsa de tomate, muzzarella, huevo duro rallado, aceitunas verdes.', 26000, 'pizzas', true, 50),
  ('pizza-29-ch', 'Primavera Especial · Chica', 'Nº 29. Salsa, muzzarella, rodajas de tomate al natural, jamón, huevo rallado y aceitunas verdes.', 25000, 'pizzas', true, 51),
  ('pizza-29-gr', 'Primavera Especial · Grande', 'Nº 29. Salsa, muzzarella, rodajas de tomate al natural, jamón, huevo rallado y aceitunas verdes.', 28000, 'pizzas', true, 52),
  ('pizza-30-ch', '4 quesos · Chica', 'Nº 30. Salsa de tomate, muzzarella, queso azul, provolone, aceitunas negras.', 23000, 'pizzas', true, 53),
  ('pizza-30-gr', '4 quesos · Grande', 'Nº 30. Salsa de tomate, muzzarella, queso azul, provolone, aceitunas negras.', 26000, 'pizzas', true, 54),
  ('empa-docena', '1 Docena de empanadas', '12 empanadas a elección.', 24000, 'empanadas', true, 1),
  ('empa-media-docena', '½ Docena de empanadas', '6 empanadas a elección.', 13000, 'empanadas', true, 2),
  ('empa-carne-cuchillo', 'Carne cortada a cuchillo', 'Empanada de carne cortada a cuchillo. Precio por unidad.', 2500, 'empanadas', true, 3),
  ('empa-carne-roticera', 'Carne Rotisera', 'Empanada de carne rotisera. Precio por unidad.', 2500, 'empanadas', true, 4),
  ('empa-pollo', 'Pollo', 'Empanada de pollo. Precio por unidad.', 2500, 'empanadas', true, 5),
  ('empa-jyq', 'Jamón y Queso', 'Empanada de jamón y queso. Precio por unidad.', 2500, 'empanadas', true, 6),
  ('empa-jtyq', 'Jamón, Tomate y Queso', 'Empanada de jamón, tomate y queso. Precio por unidad.', 2500, 'empanadas', true, 7),
  ('empa-roque-jamon', 'Roquefort con Jamón', 'Empanada de roquefort con jamón. Precio por unidad.', 2500, 'empanadas', true, 8),
  ('empa-humita', 'Humita', 'Empanada de humita. Precio por unidad.', 2500, 'empanadas', true, 9),
  ('empa-cebolla-queso', 'Cebolla y Queso', 'Empanada de cebolla y queso. Precio por unidad.', 2500, 'empanadas', true, 10),
  ('empa-verdura', 'Verdura', 'Empanada de verdura. Precio por unidad.', 2500, 'empanadas', true, 11),
  ('calzone-21-ch', 'Calzone Tradicional · Chica', 'Nº 21. Salsa de tomate, muzza, aceite de oliva, ajo y jamón, rodajas de tomate natural.', 29000, 'calzones', true, 1),
  ('calzone-21-gr', 'Calzone Tradicional · Grande', 'Nº 21. Salsa de tomate, muzza, aceite de oliva, ajo y jamón, rodajas de tomate natural.', 31000, 'calzones', true, 2),
  ('calzone-22-ch', 'Calzone Roquefort · Chica', 'Nº 22. Idem calzone tradicional + roquefort.', 29000, 'calzones', true, 3),
  ('calzone-22-gr', 'Calzone Roquefort · Grande', 'Nº 22. Idem calzone tradicional + roquefort.', 33000, 'calzones', true, 4),
  ('calzone-23-ch', 'Calzone Calabresa · Chica', 'Nº 23. Muzzarella, rodajas de tomate, longaniza, jamón.', 29000, 'calzones', true, 5),
  ('calzone-23-gr', 'Calzone Calabresa · Grande', 'Nº 23. Muzzarella, rodajas de tomate, longaniza, jamón.', 33000, 'calzones', true, 6),
  ('calzone-24-ch', 'Calzone de Verduras · Chica', 'Nº 24. Base de jamón, muzzarella, verdura, salsa blanca y morrones. Ajo, orégano y aceitunas.', 23000, 'calzones', true, 7),
  ('calzone-24-gr', 'Calzone de Verduras · Grande', 'Nº 24. Base de jamón, muzzarella, verdura, salsa blanca y morrones. Ajo, orégano y aceitunas.', 33000, 'calzones', true, 8),
  ('faina-cu', 'Fainá', 'Fainá clásica. Precio por unidad.', 2500, 'faina', true, 1),
  ('faina-roque', 'Fainá c/ Roquefort', 'Fainá con roquefort. Precio por unidad.', 3000, 'faina', true, 2),
  ('faina-jyq', 'Fainá c/ Jamón y Queso', 'Fainá con jamón y queso. Precio por unidad.', 3000, 'faina', true, 3),
  ('faina-cyq', 'Fainá c/ Cebolla y Queso', 'Fainá con cebolla y queso. Precio por unidad.', 3000, 'faina', true, 4),
  ('bebida-gaseosa', 'Gaseosa', 'Gaseosa. También se puede sumar a las promociones (+$3.000).', 3000, 'bebidas', true, 1);
