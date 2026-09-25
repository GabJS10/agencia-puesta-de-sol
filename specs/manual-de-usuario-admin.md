# Manual de usuario del panel admin

## Contexto

El administrador necesita una guía de uso del panel, accesible **solo para
administradores**. El punto de entrada es un botón "Manual de usuario" en
`/cuenta`, en el sidebar **encima del botón de cerrar sesión**, visible solo si
`user.role === "ADMIN"` (mismo patrón que el enlace "Panel admin" ya existente).

Decisiones:
- **Ubicación**: la página vive en `/admin/manual`, dentro del chrome del panel
  (sidebar índigo). Hereda el gate de ADMIN de `app/admin/layout.tsx` (redirige a
  `/` si no es admin) y se añadió un item en su nav.
- **Contenido**: estático, redactado en el código (Markdown), versionado en git.
  **Estado actual: placeholders** ("_Contenido pendiente._") — el contenido real
  está pendiente de redactar.
- **Alcance**: cubre Planes, Disponibilidad, Solicitudes, y Usuarios y cuenta.

## Implementación

Página única con índice (tabla de contenidos) + secciones ancladas. El contenido
se escribe como strings Markdown y se renderiza con `react-markdown` + `remark-gfm`
y las clases `prose`, reutilizando el patrón de `components/planes/PlanTabs.tsx`.

### Archivos nuevos

- **`components/admin/ManualContent.tsx`** (`"use client"`) — array `SECTIONS`
  con `{ id, title, icon, markdown }` para `planes`, `disponibilidad`,
  `solicitudes`, `cuenta`. Layout dos columnas: ToC pegajoso (`lg:sticky`) con
  enlaces ancla (`#planes`, …) + secciones `<section id={id}>` con encabezado
  (icono `lucide-react`) y Markdown renderizado con la clase `prose … dark:prose-invert`.
  **TODO**: reemplazar los `markdown` placeholder por el contenido real.
- **`app/admin/manual/page.tsx`** — server component estático (sin Prisma ni
  `force-dynamic`); `metadata.title` + encabezado + `<ManualContent />`.

### Archivos modificados

- **`app/admin/layout.tsx`** — nuevo item en `NAV`:
  `{ href: "/admin/manual", label: "Manual de usuario", icon: BookOpen }` (+ import `BookOpen`).
- **`app/(site)/cuenta/page.tsx`** — dentro del bloque `user.role === "ADMIN"` del
  sidebar, un `<Link href="/admin/manual">` con icono `BookOpen` encima del
  `<LogoutButton />` (+ import `BookOpen`).

## Verificación

- `npx tsc --noEmit` y `npx eslint` sobre los archivos tocados: limpios.
- Playwright (dev server): login admin → en `/cuenta` aparece "Manual de usuario"
  encima de "Cerrar sesión" y enlaza a `/admin/manual`; la página renderiza el
  índice + las 4 secciones (placeholders); el item aparece en el sidebar del
  admin. 0 errores de consola.
- Gate: un no-admin en `/admin/manual` es redirigido a `/`; el botón no se muestra
  a no-admin en `/cuenta`.

## Pendiente

- Redactar el contenido real de las 4 secciones en `ManualContent.tsx`.
