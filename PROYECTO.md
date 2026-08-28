# Puesta del Sol Web — Guía del proyecto

> Documento de referencia para recordar cómo está construido este proyecto.
> Es un sitio web de una agencia de turismo (planes/tours en La Guajira y
> alrededores, Colombia). Monorepo con **frontend (Next.js)** + **backend (Strapi CMS)**.

---

## 1. Estructura general

```
puestadelsol-web/
├── frontend/   → App pública (Next.js 16, App Router, React 19, Tailwind v4)
├── backend/    → CMS headless + API (Strapi 5, SQLite en dev)
└── README.md   → Instrucciones básicas de arranque
```

Cada carpeta es su propio paquete (con su `package.json` y `pnpm-lock.yaml`).
Gestor de paquetes: **pnpm**.

### Arranque rápido
- Backend: `cd backend && pnpm install && pnpm dev` → admin en `http://localhost:1337/admin`, API en `http://localhost:1337/api`
- Frontend: `cd frontend && pnpm install && pnpm dev` → `http://localhost:3000`
- El frontend necesita las variables de entorno en `frontend/.env`:
  - `STRAPI_HOST=http://localhost:1337`
  - `STRAPI_TOKEN=...` (API token de Strapi; ⚠️ hoy está commiteado en `.env`)

---

## 2. Frontend (`/frontend`)

### Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (con `@tailwindcss/typography` y `tw-animate-css`)
- **Radix UI** (componentes accesibles) + patrón shadcn (`components/ui`, `components.json`)
- **Framer Motion** (animaciones), **next-themes** (modo claro/oscuro)
- **react-day-picker** + **date-fns** (calendario de reservas)
- **@strapi/blocks-react-renderer** (renderiza los campos "blocks" de Strapi)

### Rutas / páginas (`app/`)
- `app/page.tsx` — **Home**. Trae todo con `getHome()` y arma Hero, About (estadísticas),
  Destinos, Reviews, Location y una sección de cita (QuoteSection).
- `app/planes/page.tsx` — **Listado de planes**. Server Component que lee `searchParams`
  (`page`, `search`, `sort`, `type`, `location`), pide en paralelo planes + ubicaciones + tipos,
  y renderiza grid + sidebar de filtros + paginación. Página fija de 9 items.
- `app/planes/[slug]/page.tsx` — **Detalle de un plan**. Busca el plan por su campo `url`
  (slug), muestra galería, tabs (Descripción/Itinerario/Incluye/Recomendaciones),
  formulario de reserva y planes relacionados. `notFound()` si no existe.

### Capa de datos (`lib/`)
Toda la comunicación con Strapi pasa por `lib/strapi.ts`:
```ts
query(endpoint, options)  // fetch a `${STRAPI_HOST}/api/${endpoint}` con Bearer token
```
Funciones específicas (cada una construye su query con `populate`/`filters`):
- `get-home.ts` — single type Home con todos sus componentes poblados (cache 1h)
- `get-planes.ts` — listado con filtros de búsqueda/tipo/ubicación/orden + paginación (pageSize 9)
- `get-plan-by-slug.ts` — un plan por `filters[url][$eq]`
- `get-plan-locations.ts` / `get-plan-types.ts` — para poblar los filtros
- `get-phone.ts` — número de WhatsApp (single type Phone)
- `get-social.ts` — redes sociales
- `utils.ts` — helper `cn()` (clsx + tailwind-merge)

Los filtros del listado usan la sintaxis de query de Strapi, p.ej.
`filters[plan_type][type][$in][0]=...`, `filters[title][$containsi]=...`.
Revalidación ISR: 60s en planes, 3600s en home.

### Componentes (`components/`)
- `home/` — Hero, About, Destinations + DestinationCard, Reviews + ReviewCard,
  Location, QuoteSection
- `planes/` — PlanesHero, FilterSidebar, SearchInput, SortSelect, PaginationControls,
  PlanGallery, PlanTabs, RelatedPlanes, ReservationForm, ReservationDate
- `layout/` — Navbar, Footer
- `ui/` — button, calendar, ScrollReveal (más theme-provider / theme-toggle)

### Flujo de reserva (importante)
No hay pasarela de pago ni backend de reservas. `ReservationForm.tsx` (client component):
el usuario elige **fecha** (calendario, no permite días pasados) y **nº de personas** (1–20),
y al enviar **arma un mensaje de WhatsApp** con el plan, precio y fecha, y abre
`https://wa.me/+57{telefono}?text=...`. El teléfono viene del single type `Phone` en Strapi.

### Tipos (`types/`)
`Planes.ts`, `HeroTours.ts`, `HomeTours.ts`, `Reviews.ts` — interfaces que modelan la
respuesta de Strapi y los props que consumen los componentes. `helpers/formatPrice.ts`
formatea precios.

---

## 3. Backend (`/backend`) — Strapi 5

CMS headless en TypeScript. Base de datos **SQLite** en desarrollo (`better-sqlite3`);
en producción se recomienda PostgreSQL. Admin en `/admin`, contenido expuesto en `/api`.
i18n habilitado (localización) en los content types del negocio.

### Content types (`src/api/*`)

**Del negocio (turismo):**
- `plan` (colección "Planes") — el core. Campos: `title`, `description` (blocks),
  `price` (float), `url` (slug único), `location`, `itinerary`/`includes`/`recommendations`
  (blocks), `tags` (componente repetible), `photo` (media), `gallery` (media múltiple),
  y relaciones `plan_type` y `plan_location`.
- `plan-type` — tipo de plan (relación 1:1 desde plan). Localizado.
- `plan-location` — ubicación (relación 1:1 desde plan). Localizado.
- `home` (single type) — contenido de la home: `sobreNosotros`, `estadistica` (repetible),
  `HeroTours`, `HomeTours`, `HomeReviews`, `Footer` (todos componentes).
- `phone` (single type) — número de 10 dígitos para WhatsApp.
- `social-media` (single type) — instagram / facebook / whatsapp.

**De plantilla Strapi (blog, presentes pero no usados por el frontend actual):**
- `article`, `author`, `category`, `about`, `global`.

### Componentes (`src/components/*`)
- `home-hero/` — home-hero, home-tours, reviews, footer
- `estadistica/estadistica`
- `planes/tags`
- `shared/` — seo, media, quote, rich-text, slider

### Scripts útiles (`backend/package.json`)
- `pnpm dev` / `pnpm develop` — servidor en modo watch
- `pnpm build` — build de Strapi
- `pnpm start` — producción
- `pnpm seed:example` — carga datos de ejemplo (`scripts/seed.js`)

---

## 4. Notas y pendientes a recordar
- **Seguridad:** `frontend/.env` (con `STRAPI_TOKEN`) está en el repo y el `.gitignore`
  de la raíz está vacío. Conviene mover secretos fuera de git y rotar el token.
- En `lib/get-planes.ts` quedan `console.log` de depuración ("getPlanes", "De nuevo aca").
- El backend trae los content types de blog por defecto de Strapi (`article`, `author`,
  `category`, `about`); no hay páginas de blog en el frontend todavía.
- i18n está configurado en Strapi pero el frontend no maneja rutas por idioma (usa el
  contenido por defecto).
- No hay reservas/pagos reales: todo el "reservar" termina en un mensaje de WhatsApp.
```
