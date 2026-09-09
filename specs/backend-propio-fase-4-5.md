# Backend propio — Fase 4 (Solicitud → formulario) + Fase 5 (Panel admin)

> Bitácora de la migración Strapi → backend propio (Next.js + Postgres).
> Continúa `backend-propio-fase-2-3.md`. Ejecutado: 2026-09-09.

## Resumen

- **Fase 4:** "solicitar un plan" dejó de abrir WhatsApp: ahora es un formulario que **persiste** en
  Postgres (`PlanRequest`) vía `POST /api/solicitudes`. Se liga a la cuenta si el usuario tiene sesión.
- **Fase 5:** panel de administración completo en `/admin` (solo rol ADMIN) para gestionar planes
  (CRUD con subida de imágenes a Cloudinary), tipos, ubicaciones, solicitudes y usuarios. Todas las
  mutaciones por Route Handlers (sin Server Actions).

## Fase 4 — Formulario de solicitud

- `app/api/solicitudes/route.ts` (`POST`, zod): crea `PlanRequest`; `userId` desde la sesión si existe
  (solicitud abierta). Valida fecha y campos.
- `components/planes/ReservationForm.tsx` reescrito: mantiene calendario + nº personas, añade
  nombre/correo/teléfono (**prefill** desde `/api/auth/me` si hay sesión) y mensaje. En submit hace
  `fetch('/api/solicitudes')` y muestra estado de éxito/error. Se eliminó toda la lógica de `wa.me`.
- `app/planes/[slug]/page.tsx`: pasa `planId` al form; se quitó `getPhone()` y el prop `phoneNumber`.
- `ContactForm` (contáctanos) se dejó en `wa.me` (fuera del alcance mínimo).

## Fase 5 — Panel de administración

### API (Route Handlers, todos con `requireAdmin`)
- `POST /api/admin/planes`, `PATCH|DELETE /api/admin/planes/[id]` (zod compartido en `lib/plan-schema.ts`,
  valida slug único).
- `POST /api/admin/plan-types` + `DELETE /api/admin/plan-types/[id]` (desvincula planes antes de borrar).
- `POST /api/admin/plan-locations` + `DELETE /api/admin/plan-locations/[id]`.
- `PATCH /api/admin/solicitudes/[id]` (cambia `status`).
- `PATCH /api/admin/usuarios/[id]` (cambia `role`; bloquea auto-cambio del propio admin).
- `POST /api/admin/upload` (multipart → Cloudinary firmado con `CLOUDINARY_SECRET`, vía `lib/cloudinary.ts`,
  límite 8MB).

### UI (`app/admin/*`, layout con guard de rol + sidebar)
- `layout.tsx`: verifica ADMIN (redirige a `/` si no), sidebar de navegación + logout + "ver sitio".
- `page.tsx`: dashboard con conteos (planes, solicitudes, pendientes, usuarios).
- `planes/`: tabla con miniatura/estado + editar/eliminar; `planes/nuevo` y `planes/[id]` usan
  `components/admin/PlanForm.tsx` (todos los campos, selects de tipo/ubicación, tags por coma,
  textareas Markdown, `ImageUploader` para portada y galería, publicado).
- `tipos/` y `ubicaciones/`: `components/admin/TaxonomyManager.tsx` (listar/agregar/eliminar).
- `solicitudes/`: tabla con datos de contacto, plan, fecha, personas y `StatusSelect` (cambia estado).
- `usuarios/`: tabla con conteo de solicitudes y `RoleSelect` (cambia rol; deshabilitado para uno mismo).

### Componentes cliente nuevos
`DeleteButton`, `ImageUploader`, `PlanForm`, `TaxonomyManager`, `StatusSelect`, `RoleSelect`
(en `components/admin/`).

## Verificación
- `npx tsc --noEmit` → 0 errores. `pnpm build` → exit 0 (todas las rutas admin y `/api/*` como
  dinámicas; públicas estáticas salvo `/planes*`, `/cuenta`, `/ingresar`).
- Runtime (`next start` :3100 contra Postgres local + Cloudinary real):
  - **Solicitud anónima** → 201 (`PlanRequest` creado); payload inválido → 400.
  - Crear plan (admin) → 201, visible en `/planes/<slug>` (200); slug duplicado → 409; PATCH → 200;
    DELETE → 200.
  - Crear tipo/ubicación → 201; PATCH estado de solicitud → 200; PATCH rol usuario → 200; admin
    cambiando su propio rol → 400 (bloqueado).
  - `POST /api/admin/upload` sin admin → 403; **con admin subió un PNG y devolvió una URL real
    `https://res.cloudinary.com/nmrw1mwa/.../puestadelsol/...png`** → wiring de Cloudinary de
    producción confirmado.

## Notas / pendientes
- Quedó una imagen de prueba 1×1 en Cloudinary (carpeta `puestadelsol/`); se puede borrar desde el panel
  de Cloudinary. Los cambios de datos de prueba fueron en la BD **local** de dev (desechable).
- **Falta la Fase 6** (cutover/despliegue): correr migraciones + seed en el Postgres de Railway, quitar
  `STRAPI_*` del servicio frontend, desplegar el frontend como servicio único y **retirar el servicio
  Strapi `agencia-puesta-de-sol`**. Las variables de producción ya están cableadas (Fase 0).
- El sitio ya no depende de Strapi en ningún punto del código.
