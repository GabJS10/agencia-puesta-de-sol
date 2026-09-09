# Puesta del Sol Web

Sitio web de la agencia de turismo **Puesta del Sol** (La Guajira, Colombia). Aplicación
**Next.js** única con backend propio integrado (API + Postgres vía Prisma) — reemplaza al antiguo
CMS Strapi.

## 🏗 Estructura

- `/frontend` — La aplicación completa: web pública + API (Route Handlers) + acceso a datos (Prisma).
  - `app/` — páginas y API (`app/api/*`).
  - `prisma/` — esquema y migraciones (`schema.prisma`, `migrations/`, `seed.ts`).
  - `lib/` — Prisma client (`db.ts`), auth/sesión (`auth.ts`, `session.ts`), lecturas (`get-*.ts`),
    Cloudinary (`cloudinary.ts`).
  - `content/` — contenido fijo de Home/Redes/Teléfono/Galería.
  - `components/`, `proxy.ts` (protección de rutas).

## 💻 Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS v4 + Radix UI + Framer Motion
- **Base de datos:** PostgreSQL + [Prisma](https://www.prisma.io/) ORM
- **Auth:** credenciales propias (bcrypt + JWT en cookie httpOnly, `jose`)
- **Imágenes:** Cloudinary
- **Gestor de paquetes:** pnpm

## 🚀 Arranque (desarrollo)

```bash
cd frontend
pnpm install

# Postgres local (Docker)
docker run -d --name pds-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=puestadelsol -p 5433:5432 postgres:16

# Variables: crear frontend/.env con DATABASE_URL, JWT_SECRET, CLOUDINARY_*, ADMIN_EMAIL/PASSWORD
pnpm exec prisma migrate dev   # crea el esquema
pnpm db:seed                   # admin + datos de ejemplo
pnpm dev                       # http://localhost:3000
```

El panel de administración está en `/admin` (requiere un usuario con rol `ADMIN`).

## 🚀 Despliegue

Un solo servicio Next.js + un Postgres gestionado (Railway). Ver `DESPLIEGUE.md`.

## 📄 Licencia

Proyecto privado.
