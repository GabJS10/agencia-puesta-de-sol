# Registro de despliegue — Puesta del Sol Web

> Bitácora de todo lo que se va haciendo para desplegar el proyecto.
> Combo: **Railway** (monorepo: frontend + Strapi + Postgres en un mismo proyecto) + **Cloudinary** (imágenes).
> Plan completo en `../DESPLIEGUE.md`. Se actualiza al final de cada paso.

> **Cambio de rumbo (2026-08-28):** inicialmente se planeó Render + Neon + Vercel. El usuario pidió
> desplegar el monorepo **todo en un mismo lugar** → se migró el plan a **Railway**. Los cambios de
> código de Fases 1 y 2 siguen siendo válidos sin retrabajo (Postgres vía `DATABASE_URL`, Cloudinary).

---

## Estado general

| Paso | Descripción | Estado |
|------|-------------|--------|
| 0 | Cuentas (Railway + Cloudinary) | ✅ Hecho |
| 1 | Código backend (Cloudinary, CSP, CORS) | ✅ Hecho |
| 2 | Código frontend (media-url, next.config) | ✅ Hecho |
| A | Commit + push a GitHub | ✅ Hecho |
| B | Servicio backend en Railway | ✅ Hecho (creado por el usuario) |
| C | Postgres en Railway | ✅ Hecho |
| D | Variables del backend (DB + Cloudinary) | ✅ Hecho |
| B/C/D deploy | Backend arriba (Postgres + Cloudinary) | ✅ SUCCESS — /admin 200, /api 403 |
| E | Admin + API token (read-only) | ✅ Hecho 👤 |
| F | Servicio frontend en Railway | ✅ Hecho — home/planes/detalle 200 |
| G | CORS (FRONTEND_URL) | ✅ Hecho |
| H | Cargar contenido (strapi transfer) | ✅ Hecho — 372 items, 100 imágenes → Cloudinary |

## ✅ DESPLIEGUE COMPLETO (2026-08-28)

- **Frontend:** https://frontend-production-0f36.up.railway.app — home, `/planes` y `/planes/<slug>` → 200; imágenes desde `res.cloudinary.com`.
- **Backend admin/API:** https://agencia-puesta-de-sol-production.up.railway.app/admin
- **Fix final:** Next escuchaba en el `PORT` inyectado (8080) pero el dominio apuntaba a 3000 → 502.
  Se fijó `PORT=3000` en el servicio frontend y coincidió. Verificado 200.

### Transfer de contenido (✅ 2026-08-28)
`pnpm strapi transfer` local (SQLite) → remoto Postgres, `--force`. Resultado:
79 entities (4 planes, home, 4 plan-location, 4 plan-type, phone, social-media, global, 21 upload.file),
100 assets (12 MB, imágenes → Cloudinary), 143 links, 50 config. Total 372 items / 12.3 MB. Éxito.

### Frontend deploy
Repo `GabJS10/agencia-puesta-de-sol` conectado al servicio `frontend` (root `/frontend`), build en curso.

### Estado Railway (ampliado)
- Frontend service `frontend` (0b272727) — root `/frontend`, vars `STRAPI_HOST` + `STRAPI_TOKEN`,
  dominio **`frontend-production-0f36.up.railway.app`** (port 3000). **Source aún NO conectado**
  (se conecta tras cargar contenido, porque el build de Next prerenderiza la home consultando la API).
- Backend `FRONTEND_URL=https://frontend-production-0f36.up.railway.app` (CORS).
- API token read-only del backend → guardado en `STRAPI_TOKEN` del frontend.
- Plan de contenido: `strapi transfer` desde SQLite local (`.tmp/data.db`, 1.5 MB) → Postgres remoto;
  imágenes suben a Cloudinary vía provider. Requiere Transfer Token (push) creado en el admin remoto.

### Fixes de build/deploy aplicados (2026-08-28)

1. **`backend/pnpm-workspace.yaml`**: faltaba `packages: ['.']` → pnpm 9.15.9 (Railpack) fallaba con
   *"packages field missing or empty"*. Commit `9129232`. **Build OK tras el fix.**
2. **`pg` driver**: Strapi con `DATABASE_CLIENT=postgres` crasheaba con *"Cannot find module 'pg'"*
   (solo estaba `better-sqlite3`). `pnpm add pg` → commit `075cca6`. Redeploy en curso.

### Estado Railway
- Proyecto `responsible-happiness` (9b221e45), env production (7dcb6400).
- Backend `agencia-puesta-de-sol` (5b07f26b), dominio `agencia-puesta-de-sol-production.up.railway.app`.
- Postgres `Postgres` (e1963957) — SUCCESS.
- Vars backend puestas: secretos + `DATABASE_CLIENT=postgres`, `DATABASE_URL=${{Postgres.DATABASE_URL}}`,
  `DATABASE_SSL=false`, `NODE_ENV=production`. **Faltan `CLOUDINARY_NAME/KEY/SECRET` y `FRONTEND_URL`.**

---

## FASE 0 — Cuentas (✅ 2026-08-28)

El usuario confirmó que ya tiene cuentas en **Neon, Cloudinary, Render y Vercel**.

---

## FASE 1 — Backend (✅ 2026-08-28)

**Archivos modificados:**
- `backend/config/plugins.ts` — registrado el provider de uploads **Cloudinary**
  (`cloud_name`/`api_key`/`api_secret` desde env `CLOUDINARY_NAME`/`CLOUDINARY_KEY`/`CLOUDINARY_SECRET`).
- `backend/config/middlewares.ts` — `strapi::security` pasa de string a objeto con CSP que permite
  `res.cloudinary.com` en `img-src`/`media-src` (para previsualizar en el admin); `strapi::cors`
  ahora usa `origin: [FRONTEND_URL || 'http://localhost:3000']`.

**Dependencia añadida:**
- `@strapi/provider-upload-cloudinary@5.52.2` (`pnpm add`, en `/backend`).

**Sin cambios de código:** `config/database.ts` ya soportaba Postgres vía `DATABASE_URL`.

**Nota de entorno:** el backend corre con **Node 24** (gestionado por fnm, no nvm); se desvinculó
el Node 26 de Homebrew (`brew unlink node`) porque rompía la compilación de `better-sqlite3`.

---

## FASE 2 — Frontend (✅ 2026-08-28)

**Archivo nuevo:**
- `frontend/lib/media-url.ts` — helper `resolveMedia(url, base?)`: devuelve la url tal cual si es
  absoluta (Cloudinary), o le antepone el host de Strapi si es relativa (uploads locales en dev).

**Archivos modificados (reemplazadas 8 concatenaciones `${STRAPI_HOST}${url}` por `resolveMedia`):**
- `frontend/app/page.tsx` (HeroTours, HomeTours, HomeReviews, Footer)
- `frontend/app/planes/page.tsx` (card de plan)
- `frontend/app/planes/[slug]/page.tsx` (planes relacionados; `baseUrl` de la galería sigue siendo `STRAPI_HOST`)
- `frontend/components/planes/PlanGallery.tsx` (client component: `resolveMedia(url, baseUrl)`)
- `frontend/next.config.ts` — añadido `res.cloudinary.com` a `remotePatterns`; quitado
  `dangerouslyAllowLocalIP`; se conserva `localhost:1337` para desarrollo.

**Verificación:** `npx tsc --noEmit` → exit 0 (sin errores de tipos).

---

## PASO A — Commit + push (✅ 2026-08-28)

**Hecho:** commit `094a898` en rama **main** → push a `origin` (github.com/GabJS10/agencia-puesta-de-sol).
Incluye solo los archivos del despliegue (código backend/frontend + docs). Los `.env` **no** están
trackeados (el token no está en el repo). Quedaron fuera del commit cambios de tooling no relacionados
(`.claude/`, `.agents/`, `skills-lock.json`, borrados en `.opencode/`, `.gitignore`).

### Config previa (referencia)

**Secretos generados** (`openssl rand -base64 16`) para las env vars de Railway — guardados por el usuario:
`APP_KEYS` (2 valores), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`.

**Configuración prevista del proyecto Railway:**
- Servicio backend: Root `backend`, Build `pnpm install && pnpm build`, Start `pnpm start`, `NIXPACKS_NODE_VERSION=22`.
- Postgres gestionado de Railway (`DATABASE_URL=${{Postgres.DATABASE_URL}}`, `DATABASE_SSL=false`).
- Servicio frontend: Root `frontend`, variables `STRAPI_HOST` + `STRAPI_TOKEN`.
- Cloudinary para imágenes (`CLOUDINARY_NAME/KEY/SECRET`).

**Pendiente:**
- [ ] Commit + push (Railway despliega desde GitHub). Rama a definir (`main` o `deploy-setup`).

---

## Pendientes / decisiones abiertas

- Elegir rama para el push (`main` directa o `deploy-setup`).
- **Seguridad:** rotar el `STRAPI_TOKEN` commiteado en `frontend/.env`; usar token nuevo en el frontend de Railway.
