# Puesta del Sol Web — Guía del proyecto

> Documento de referencia de cómo está construido el proyecto.
> Sitio de una agencia de turismo (planes/tours en La Guajira, Colombia).
> **Aplicación Next.js única** con backend propio integrado (Postgres + Prisma).
> Reemplazó al antiguo CMS Strapi (ver `specs/backend-propio-fase-*.md` para la migración).

---

## 1. Estructura general

```
puestadelsol-web/
└── frontend/   → App completa: web pública + API + datos (Next.js 16, React 19, Tailwind v4)
```

Gestor de paquetes: **pnpm**. Todo vive en `frontend/`.

### Arranque rápido
- Postgres local (Docker): `docker run -d --name pds-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=puestadelsol -p 5433:5432 postgres:16`
- `cd frontend && pnpm install`
- `frontend/.env` con: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_NAME/KEY/SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `pnpm exec prisma migrate dev` → esquema; `pnpm db:seed` → admin + datos de ejemplo
- `pnpm dev` → `http://localhost:3000`; panel admin en `/admin`

---

## 2. Backend propio (dentro de `frontend/`)

### Base de datos — Prisma + Postgres (`prisma/schema.prisma`)
- `User`: email, passwordHash, name, phone?, `role` (`CLIENT|ADMIN`).
- `Plan`: title, `slug` (se expone como `url`), price, location, `description`/`itinerary?`/`includes`/
  `recommendations` (**Markdown**), `photoUrl`, `galleryUrls[]`, `tags[]`, `published`, relaciones
  `planType`/`planLocation`.
- `PlanType` (`type`), `PlanLocation` (`location`).
- `PlanRequest`: solicitud de plan — `planId?`, `userId?`, name, email, phone, `travelDate`, `guests`,
  `message?`, `status` (`PENDING|CONTACTED|CONFIRMED|CANCELLED`).
- Migraciones en `prisma/migrations/`; seed en `prisma/seed.ts` (idempotente).

### Acceso a datos (`lib/`)
- `db.ts` — singleton de PrismaClient.
- Lecturas SSR (consultan Prisma directamente, sin HTTP): `get-planes.ts`, `get-plan-by-slug.ts`,
  `get-plan-types.ts`, `get-plan-locations.ts` (con `plan-map.ts` → forma que consume la UI).
- Contenido fijo: `get-home.ts`, `get-social.ts`, `get-phone.ts`, `get-gallery.ts` leen de
  `content/home.ts` y `content/site.ts`.

### API (Route Handlers, `app/api/*` — sin Server Actions)
- Auth: `POST /api/auth/{register,login,logout}`, `GET /api/auth/me`.
- Público: `POST /api/solicitudes` (crea `PlanRequest`; liga a la cuenta si hay sesión).
- Cliente: `GET /api/mis-solicitudes`.
- Admin (protegidos con `requireAdmin`): `/api/admin/planes[/id]`, `/api/admin/plan-types[/id]`,
  `/api/admin/plan-locations[/id]`, `/api/admin/solicitudes/[id]` (status),
  `/api/admin/usuarios/[id]` (rol), `/api/admin/upload` (Cloudinary).

### Auth y protección
- `lib/session.ts` (edge-safe, `jose`): firma/verifica JWT. `lib/auth.ts` (Node): bcrypt + cookie
  httpOnly + `getSession`/`requireUser`/`requireAdmin`.
- `proxy.ts` (convención de Next 16, antes `middleware.ts`): protege `/admin/*` (ADMIN) y `/cuenta/*`.

---

## 3. Frontend

### Rutas (`app/`)
- `/` Home, `/planes` (listado con filtros/paginación), `/planes/[slug]` (detalle + formulario de
  solicitud), `/nosotros`, `/galeria`, `/contactanos`.
- `/ingresar`, `/registro`, `/cuenta` (panel del cliente con sus solicitudes).
- `/admin/*` (dashboard, planes CRUD, tipos, ubicaciones, solicitudes, usuarios).
- `/planes*`, `/cuenta`, `/ingresar` y `/api/*` son dinámicas; el resto estáticas.

### Flujo de "solicitar un plan"
`components/planes/ReservationForm.tsx` (client): fecha + personas + datos de contacto (prefill si hay
sesión) → `POST /api/solicitudes` → persiste en BD. **Ya no usa WhatsApp.** (El `ContactForm` de
`/contactanos` sigue abriendo WhatsApp.)

### Rich text
`description/itinerary/includes/recommendations` son **Markdown**, renderizados con `react-markdown`
en `components/planes/PlanTabs.tsx`.

---

## 4. Notas
- Contenido de Home/Galería/Teléfono/Redes es **fijo en código** (`content/`), no gestionado por admin.
- Imágenes en Cloudinary (URLs absolutas); subida desde el admin vía `/api/admin/upload`.
- Despliegue: un servicio Next + Postgres en Railway. Ver `DESPLIEGUE.md`.
