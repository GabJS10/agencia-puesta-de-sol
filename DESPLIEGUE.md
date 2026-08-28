# Plan de despliegue — Puesta del Sol Web (Railway)

> Combo elegido: **Railway** (monorepo: frontend + Strapi + Postgres en un mismo proyecto) + **Cloudinary** (imágenes).
> Se ejecuta por pasos. Marca cada casilla `[x]` al completarla. Bitácora detallada en `specs/despliegue-registro.md`.

## Contexto

Monorepo con **frontend Next.js** y **backend Strapi 5** (en local: SQLite + imágenes en disco).
Se despliega **todo en un lugar** con Railway: dos servicios desde el mismo repo (root `frontend` y
root `backend`) + un Postgres gestionado. Las imágenes van a **Cloudinary**. Costo: ~$5/mes (crédito
de prueba inicial). Resultado: sitio público + Strapi + Postgres + Cloudinary, con datos persistentes.

---

## FASE 0 — Cuentas ✅
Neon, Cloudinary, Render y Vercel ya existían. Para este plan solo se usan **Railway** (nuevo) y **Cloudinary**.

## FASE 1 — Código backend ✅
- `backend/config/plugins.ts` → provider Cloudinary.
- `backend/config/middlewares.ts` → CSP permite `res.cloudinary.com` + CORS con `FRONTEND_URL`.
- Instalado `@strapi/provider-upload-cloudinary`.
- `config/database.ts` ya soportaba Postgres vía `DATABASE_URL` (sin cambios).

## FASE 2 — Código frontend ✅
- `frontend/lib/media-url.ts` (`resolveMedia`), usado en `app/page.tsx`, `app/planes/page.tsx`,
  `app/planes/[slug]/page.tsx`, `components/planes/PlanGallery.tsx`.
- `next.config.ts` → `res.cloudinary.com` añadido.
- Verificado con `npx tsc --noEmit` (exit 0).

---

## PASO A — Subir código a GitHub
- [ ] Commit + push de los cambios (Railway despliega desde GitHub).
- Rama: a definir (`main` directa o `deploy-setup`).

## PASO B — Servicio BACKEND en Railway
- [ ] New Project → Deploy from GitHub repo → `puestadelsol-web`.
- [ ] En el servicio: **Settings → Root Directory = `backend`**.
- [ ] Si no autodetecta: Build `pnpm install && pnpm build`, Start `pnpm start`.
- [ ] Variable `NIXPACKS_NODE_VERSION=22`.

## PASO C — Postgres
- [ ] En el proyecto: New → Database → **PostgreSQL**.

## PASO D — Variables del BACKEND
- [ ] Secretos (ya generados): `APP_KEYS` (2 valores), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`,
  `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`.
- [ ] `DATABASE_CLIENT=postgres`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}` (referencia al servicio Postgres)
- [ ] `DATABASE_SSL=false`
- [ ] `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- [ ] `HOST=0.0.0.0`, `NODE_ENV=production` (NO fijar `PORT`, lo inyecta Railway)
- [ ] Settings → Networking → **Generate Domain** → anotar URL del backend.

## PASO E — Admin + API token
- [ ] Abrir `/admin`, crear usuario admin.
- [ ] Settings → API Tokens → crear token **read-only** → copiarlo.

## PASO F — Servicio FRONTEND en Railway
- [ ] New → GitHub Repo (mismo repo) → **Root Directory = `frontend`**.
- [ ] Variables: `STRAPI_HOST=https://<backend>.up.railway.app`, `STRAPI_TOKEN=<token del Paso E>`.
- [ ] Generate Domain → anotar URL del frontend.

## PASO G — CORS
- [ ] En el backend: `FRONTEND_URL=https://<frontend>.up.railway.app` → redeploy del backend.

## PASO H — Cargar contenido
- [ ] (a) Reingresar contenido en el admin, o (b) `strapi transfer` desde local. Imágenes → Cloudinary.

---

## Verificación final
- [ ] Admin carga y permite login; subir imagen genera URL `res.cloudinary.com/...`.
- [ ] `GET /api/planes?populate=photo` con Bearer token devuelve datos.
- [ ] Home y `/planes` cargan; imágenes visibles (Cloudinary).
- [ ] Plan → botón "Reservar" abre WhatsApp.
- [ ] Redeploy del backend → contenido e imágenes persisten.

## Notas
- Railway no es gratis permanente: crédito inicial, luego ~$5/mes.
- Postgres de Railway por red privada → sin SSL.
- Seguridad: usar `STRAPI_TOKEN` nuevo (el de `frontend/.env` está commiteado); rotar el viejo.
- Enfoque anterior (Render + Neon) descartado.
