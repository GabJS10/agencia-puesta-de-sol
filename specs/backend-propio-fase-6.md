# Backend propio — Fase 6 (Cutover + despliegue)

> Cierre de la migración Strapi → backend propio (Next.js + Postgres). Ejecutado: 2026-09-09.
> Continúa `backend-propio-fase-4-5.md`.

## Resumen

El sitio ya corre en producción con el backend propio: **un solo servicio Next.js + Postgres** en
Railway. Se retiró Strapi (servicio y tablas) y el sitio quedó verificado end-to-end.

## Estado de Railway (proyecto `responsible-happiness`, prod)

Antes: 3 servicios (frontend, Postgres, **agencia-puesta-de-sol**=Strapi).
Después: **frontend** + **Postgres** (Strapi eliminado). Sin proxies TCP.

## Pasos ejecutados

1. **Ajuste de arranque:** `frontend/package.json` → `start` = `next start` (se quitó
   `prisma migrate deploy` del start porque `prisma` es devDependency y RAILPACK puede podarla en
   runtime → crashearía). `build` sigue = `prisma generate && next build`. Migraciones fuera de banda.

2. **Migración + seed de producción (desde local vía proxy TCP temporal):**
   - Se creó un proxy TCP sobre el Postgres → endpoint público `trolley.proxy.rlwy.net:17601`.
   - La BD tenía 70 tablas de Strapi. Como se retira Strapi y se empieza de cero, se ejecutó
     `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` (+ grants).
   - `prisma migrate deploy` → aplicó `20260909200326_init` (esquema limpio, con historial).
   - `tsx prisma/seed.ts` con `ADMIN_EMAIL`/`ADMIN_PASSWORD` de producción → admin + 4 tipos + 4
     ubicaciones + 4 planes.
   - El proxy TCP se **eliminó** al terminar (no dejar el Postgres expuesto públicamente).

3. **Limpieza de código:**
   - Eliminada la carpeta `backend/` (Strapi) del repo y del disco.
   - Reescritos `README.md`, `PROYECTO.md`, `DESPLIEGUE.md`; nuevo `.gitignore` raíz.

4. **Despliegue:** commit + push a `main` (`f8189003`) → Railway reconstruyó el servicio frontend
   (RAILPACK, root `/frontend`). Deployment quedó en **SUCCESS**.

5. **Variables:** se eliminaron `STRAPI_HOST` y `STRAPI_TOKEN` del servicio frontend. Quedan
   `DATABASE_URL` (ref a Postgres), `DATABASE_SSL`, `JWT_SECRET`, `CLOUDINARY_*`, `ADMIN_EMAIL/PASSWORD`.

6. **Retiro de Strapi:** eliminado el servicio `agencia-puesta-de-sol`.

## Verificación en producción (`https://frontend-production-0f36.up.railway.app`)

- `/` → 200; `/planes` lista los planes **desde Postgres**; `/planes/[slug]` → 200.
- `/api/auth/me` → `{user:null}`; login admin (`admin@puestadelsol.com`) → sesión ADMIN;
  `/admin` con sesión → 200; anónimo → 307 a `/ingresar`.
- `POST /api/solicitudes` → crea `PlanRequest` en el Postgres interno (escritura verificada y luego
  limpiada).
- `POST /api/admin/upload` sin admin → 403; con admin → URL real `res.cloudinary.com/nmrw1mwa/...`
  (Cloudinary operativo en el contenedor desplegado).
- Último deployment del frontend: **SUCCESS** (`f8189003`).

## Notas / pendientes

- **Credenciales admin de producción:** `admin@puestadelsol.com` / la contraseña está en la variable
  `ADMIN_PASSWORD` del servicio frontend (valor actual: `+1NXqTyMbg8p/DTL`). Recomendado cambiarla.
- Quedaron 2 imágenes de prueba 1×1 en Cloudinary (carpeta `puestadelsol/`) de las verificaciones de
  upload; borrar desde el panel de Cloudinary si se desea.
- Dev local sigue con Postgres en Docker (`pds-postgres`, :5433) y admin `admin1234`.
- Futuras migraciones a producción: recrear un proxy TCP temporal y `prisma migrate deploy`, o correr
  desde dentro de Railway; borrar el proxy al terminar.
- **Migración completa (Fases 0–6). El sitio ya no depende de Strapi.**
