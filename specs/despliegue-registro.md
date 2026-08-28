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
| B | Servicio backend en Railway | ⬜ Pendiente |
| C | Postgres en Railway | ⬜ Pendiente |
| D | Variables del backend | ⬜ Pendiente |
| E | Admin + API token | ⬜ Pendiente |
| F | Servicio frontend en Railway | ⬜ Pendiente |
| G | CORS (FRONTEND_URL) | ⬜ Pendiente |
| H | Cargar contenido | ⬜ Pendiente |

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
