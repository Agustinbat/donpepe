# Don Pepe

Página de pedidos para **Don Pepe** (pizzas, empanadas y calzones).

El cliente elige cantidades, ve el total y envía el pedido por **WhatsApp** con el detalle y el precio calculado.

Incluye un **panel de administración** para cambiar precios, marcar productos disponibles/no disponibles y actualizar el número de WhatsApp.

## Stack

- **Next.js** (App Router) → deploy en **Vercel** (gratis)
- **Supabase** Postgres → base de datos gratis, sin mantenimiento
- En local, si no configurás Supabase, usa un archivo `data/store.json`

## WhatsApp actual

Número de pedidos: **11-62345926**

Podés cambiarlo desde `/admin` cuando quieras.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí:

- Menú: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Usuarios del panel:

| Usuario | Contraseña | Permisos |
|---|---|---|
| `donpepe` | `donpepe2026#` | Completo (precios, textos, WhatsApp, disponibilidad) |
| `administrador` | `administrador2026!` | Solo marcar disponible / no disponible |

## Supabase (gratis) + Vercel

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan Free).
2. En **SQL Editor**, ejecutá el archivo `supabase/schema.sql`.
3. En **Project Settings → API**, copiá:
   - Project URL
   - `anon` key
   - `service_role` key
4. En Vercel, creá el proyecto apuntando a este repo y cargá estas variables:

```env
ADMIN_USER=donpepe
ADMIN_PASSWORD=donpepe2026#
STAFF_USER=administrador
STAFF_PASSWORD=administrador2026!
AUTH_SECRET=un-secreto-largo-aleatorio
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

5. Deploy.

Sin Supabase, el menú funciona en local con archivo JSON. En Vercel conviene usar Supabase para que los cambios del admin persistan.

## Panel admin

En `/admin`:

- **donpepe**: editar título, descripción, precio, disponibilidad y datos del local
- **administrador**: solo marcar productos como disponibles o no disponibles

## Logo

- Original: `public/logo-original.jpg`
- Versión SVG de apoyo: `public/logo.svg`
