# Despliegue — Puesta del Sol Web (Railway)

> **Un solo servicio** Next.js (`frontend`) + **Postgres** gestionado, en Railway. Cloudinary para
> imágenes. Reemplaza el esquema anterior de dos servicios (frontend + Strapi).

## Arquitectura en producción

- Proyecto Railway: `responsible-happiness`.
- Servicio **frontend** (root `/frontend`, builder RAILPACK, deploy desde GitHub `main`):
  - Build: `pnpm install && pnpm build` (`pnpm build` = `prisma generate && next build`).
  - Start: `pnpm start` (`next start`). **Las migraciones NO corren en el arranque** (Prisma es
    devDependency y RAILPACK puede podarla en runtime); se aplican fuera de banda (ver abajo).
  - Dominio: `frontend-production-0f36.up.railway.app`.
- Servicio **Postgres** (volumen persistente). La app lo usa vía `DATABASE_URL` (red privada interna).

## Variables (servicio frontend, env production)

- `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `DATABASE_SSL=false`
- `JWT_SECRET` (secreto propio de sesión)
- `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (solo los consume el seed)
- `PORT` lo inyecta Railway.

## Migraciones y seed en producción

El `DATABASE_URL` interno (`postgres.railway.internal`) solo resuelve dentro de Railway. Para migrar/
seed desde local se usa un **proxy TCP temporal** del Postgres:

1. Crear proxy TCP (puerto 5432) sobre el servicio Postgres → da un endpoint público `host:puerto`.
2. `DATABASE_URL="postgresql://postgres:<pwd>@<host>:<puerto>/railway" pnpm exec prisma migrate deploy`
3. `DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm exec tsx prisma/seed.ts`
4. **Borrar el proxy TCP** al terminar (no dejar el Postgres expuesto públicamente).

> El seed es idempotente (upsert), así que puede re-ejecutarse sin duplicar.

## Flujo de despliegue

1. `git push` a `main` → Railway reconstruye y despliega el servicio frontend.
2. Verificar que el deployment quede en **SUCCESS**.
3. Verificar el sitio público (home, `/planes` desde Postgres, login admin en `/admin`).

## Verificación

- `GET /` y `/planes` cargan desde Postgres; imágenes visibles (Cloudinary/Unsplash).
- `/planes/[slug]` → formulario de solicitud crea un `PlanRequest` (visible en `/admin/solicitudes`).
- Login admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) → `/admin` accesible; CRUD de planes con subida de imagen.

## Historial

- El backend Strapi (`agencia-puesta-de-sol`) y sus tablas en Postgres fueron **retirados** en la
  migración a backend propio (Fases 0–6, ver `specs/backend-propio-fase-*.md`).
