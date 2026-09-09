# Backend propio — Ajustes post-migración (navbar/admin + edición de perfil)

> Ajustes tras las Fases 0–6. Ejecutado: 2026-09-09.

## 1. Chrome del sitio fuera de `/admin` (route groups)

**Problema:** el `Navbar` (fijo) y el `Footer` del sitio, renderizados en el layout raíz, se
mostraban también sobre las páginas del panel `/admin` (que tiene su propio layout con sidebar),
solapándose y viéndose mal.

**Intento fallido:** un wrapper cliente `ConditionalFooter` que ocultaba el footer según
`usePathname`. No sirve para el SSR: al pasar el `Footer` (Server Component `async`) como `children`
a un componente cliente, Next lo pre-renderiza igual y el HTML inicial incluía el footer.

**Solución (idiomática): route groups.**
- `app/layout.tsx` (raíz) quedó mínimo: `<html>`/`<body>`, fuentes y `ThemeProvider`. **Sin** navbar/footer.
- Nuevo grupo **`app/(site)/`** con su `layout.tsx` que renderiza `Navbar` + `Footer` (y hace
  `getHome()` para el footer). Ahí viven las rutas públicas y de cliente:
  `(site)/page.tsx` (home), `planes/`, `nosotros/`, `galeria/`, `contactanos/`, `cuenta/`, y el grupo
  `(auth)/` (`ingresar`, `registro`). Los route groups **no cambian las URLs**.
- `app/admin/` queda **fuera** de `(site)`, así solo hereda el layout raíz + su propio layout (sidebar),
  sin el chrome del sitio.
- Eliminados `components/layout/ConditionalFooter.tsx` y el guard `/admin` que se había puesto en el `Navbar`.

**Verificación:** en `/admin`, `0` tags `<footer>` y `0` enlaces de navegación del sitio en el DOM
(el texto del footer solo aparece en un payload RSC de prefetch del enlace "Ver sitio", no visible);
en `/planes` y `/cuenta` el navbar y el footer siguen presentes.

## 2. Edición de datos del usuario

Nuevo flujo para que un usuario logueado edite su perfil.

- **API:** `PATCH /api/perfil` (`app/api/perfil/route.ts`, runtime nodejs, zod). Requiere sesión;
  actualiza `name`, `email` (valida unicidad si cambia) y `phone`. Cambio de contraseña **opcional**:
  exige `currentPassword` (verificada con bcrypt) para fijar `newPassword`. Reemite la cookie de sesión
  (name/email pudieron cambiar). Errores: 401 sin sesión, 409 correo en uso, 400 contraseña actual
  incorrecta / falta contraseña actual.
- **UI:**
  - `components/auth/ProfileForm.tsx` (client): nombre, correo, teléfono y sección plegable "cambiar
    contraseña" (actual + nueva). `fetch` a `/api/perfil`, mensaje de éxito, `router.refresh()`.
  - `app/(site)/cuenta/perfil/page.tsx` (server, `force-dynamic`): carga el usuario (incluye `phone`)
    y monta el formulario; enlace "volver a mi cuenta".
  - `app/(site)/cuenta/page.tsx`: botón **"Editar datos"** → `/cuenta/perfil`.

**Verificación (runtime):** `PATCH /api/perfil` con sesión → 200 y datos actualizados; sin sesión → 401;
cambio de contraseña sin la actual → 400; `/cuenta/perfil` protegida (redirige a `/ingresar` sin sesión).

## Verificación global
`npx tsc --noEmit` → 0 errores. `pnpm build` → exit 0 (rutas correctas; `(site)` no altera URLs).
