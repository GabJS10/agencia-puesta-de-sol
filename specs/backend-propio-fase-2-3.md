# Backend propio — Fase 2 (Lectura → Prisma/Markdown) + Fase 3 (Auth)

> Bitácora de la migración Strapi → backend propio (Next.js + Postgres).
> Continúa `backend-propio-fase-0-1.md`. Ejecutado: 2026-09-09.

## Resumen

- **Fase 2:** el frontend ya no habla con Strapi. Las páginas leen de Postgres (Prisma) por las
  mismas funciones `lib/get-*.ts` (conservando las formas de respuesta), y el contenido de
  Home/Galería/Teléfono/Redes pasó a módulos TS fijos. El rich-text de los planes es Markdown.
- **Fase 3:** sistema de login propio (clientes + admin) con JWT en cookie httpOnly, Route Handlers
  (sin Server Actions), middleware/proxy de protección, páginas de ingreso/registro y panel de cliente.

## Fase 2 — Camino de lectura

### Contenido fijo (nuevos módulos)
- `content/home.ts` → `HOME` con la misma forma que devolvía el single type Home de Strapi
  (`sobreNosotros`, `estadistica[]`, `HeroTours[]`, `HomeTours[]`, `HomeReviews[]`, `Footer`), con
  imágenes de Unsplash. Editar aquí para cambiar la portada.
- `content/site.ts` → `PHONE` (string), `SOCIAL` ({instagram, facebook, whatsapp}), `GALLERY`
  (`GalleryImage[]`).

### `lib/get-*.ts`
- `get-home.ts`, `get-social.ts`, `get-phone.ts`, `get-gallery.ts` → devuelven el contenido fijo.
- `get-planes.ts`, `get-plan-by-slug.ts`, `get-plan-types.ts`, `get-plan-locations.ts` → consultan
  Prisma. `getPlanes` mantiene `{ data, meta.pagination }` (pageSize 9), filtros search/tipos/
  ubicaciones y `sort` estilo Strapi (`campo:dir`) traducido a `orderBy`.
- `lib/plan-map.ts` → `toPlane()` mapea un `Plan` de Prisma a la forma `Plane` del frontend
  (`slug`→`url`, `photoUrl`→`photo:{url}`, `galleryUrls`→`gallery:[{url}]`, `tags`→`[{element}]`,
  relaciones → `plan_type`/`plan_location`).

### Otros cambios
- `components/planes/PlanTabs.tsx`: `@strapi/blocks-react-renderer` → `react-markdown` + `remark-gfm`.
- `types/Planes.ts`: los 4 campos rich-text pasan de `any` (blocks) a `string` (Markdown).
- `lib/media-url.ts`: `resolveMedia` ya no depende de Strapi (URLs absolutas se devuelven tal cual).
- `app/planes/[slug]/page.tsx`: quitado `STRAPI_HOST`; `PlanGallery baseUrl=""`.
- **Eliminados:** `lib/strapi.ts`, dep `@strapi/blocks-react-renderer`.
- `/planes` y `/planes/[slug]` marcadas `export const dynamic = "force-dynamic"` — consultan la BD y
  **no deben prerenderizarse en el build** (en Railway el build no alcanza el Postgres interno; el
  resto de páginas son estáticas porque usan contenido fijo).

## Fase 3 — Autenticación

### Sesión
- `lib/session.ts` (**edge-safe**, solo `jose`): `COOKIE_NAME`, `SESSION_MAX_AGE` (7d), `SessionUser`,
  `signSession`/`verifySession` (HS256 con `JWT_SECRET`).
- `lib/auth.ts` (Node, `server-only`): `hashPassword`/`verifyPassword` (bcrypt),
  `setSessionCookie`/`clearSessionCookie`/`getSession` (cookie httpOnly, `secure` en prod),
  `requireUser`/`requireAdmin`.

### Route Handlers (sin Server Actions)
- `POST /api/auth/register` (zod; crea CLIENT, setea cookie, 409 si el correo existe).
- `POST /api/auth/login` (verifica bcrypt, 401 si falla).
- `POST /api/auth/logout` (limpia cookie).
- `GET /api/auth/me` (devuelve `{ user }`).
- `GET /api/mis-solicitudes` (401 si anónimo; solicitudes del usuario con su plan).

### Protección
- `proxy.ts` (antes `middleware.ts` — Next 16 renombró la convención; función `proxy`): protege
  `/admin/*` (rol ADMIN, redirige a `/` si no lo es) y `/cuenta/*` (logueado). Redirige a
  `/ingresar?redirect=<path>` si no hay sesión. Verifica el JWT con `lib/session` (Edge).

### UI
- `app/(auth)/ingresar/page.tsx` + `components/auth/LoginForm.tsx` (client, `fetch` a la API;
  redirige por rol o al `redirect`). `useSearchParams` envuelto en `<Suspense>`; página `force-dynamic`.
- `app/(auth)/registro/page.tsx` + `components/auth/RegisterForm.tsx`.
- `app/cuenta/page.tsx` (server, `force-dynamic`): saludo, botón panel admin (si ADMIN), lista de
  solicitudes con estado, y `components/auth/LogoutButton.tsx`.
- `components/layout/Navbar.tsx`: control de sesión (fetch `/api/auth/me`) → "INGRESAR" / "MI CUENTA".

## Verificación
- `npx tsc --noEmit` → 0 errores. `pnpm build` → exit 0 (12/12 páginas; `/planes*`, `/cuenta`,
  `/ingresar`, `/api/*` dinámicas; home/nosotros/contactanos/galeria/registro estáticas; proxy OK).
- Runtime (`next start` :3100 contra Postgres local):
  - `/` 200; `/planes` lista los 4 planes; `/planes/cabo-de-la-vela-magico` renderiza (Markdown OK).
  - `/api/auth/me` anónimo → `{user:null}`; `/cuenta` anónimo → 307 `/ingresar?redirect=/cuenta`.
  - Login admin (`admin@puestadelsol.com`/`admin1234`) → sesión ADMIN; `/cuenta` con cookie → 200.
  - Registro cliente → 201 (CLIENT); duplicado → 409; login errado → 401.
  - `/api/mis-solicitudes`: cliente → `{requests:[]}`; anónimo → 401.
  - `/admin`: anónimo → `/ingresar`; cliente → `/`; admin → 404 (aún sin página, Fase 5). Logout → ok.

## Notas / pendientes
- Dev usa Postgres local en Docker (`pds-postgres`, :5433) y admin dev `admin1234`.
- Próximo: **Fase 4** (formulario de solicitud persistido: `POST /api/solicitudes` + reescribir
  `ReservationForm` para guardar en BD en vez de abrir WhatsApp) y **Fase 5** (panel admin).
