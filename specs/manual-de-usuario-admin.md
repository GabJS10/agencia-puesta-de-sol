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
  El contenido vive en `lib/manual-content.ts` (separado de la UI) y ya está
  redactado con texto real + imágenes (pendiente de revisión del usuario).
- **Imágenes**: capturas reales del panel tomadas con Playwright, en
  `public/manual/*.png`, referenciadas desde el Markdown como `/manual/<archivo>.png`.
- **Alcance**: cubre Planes, Disponibilidad, Solicitudes, y Usuarios y cuenta.

## Implementación

Página única con índice (tabla de contenidos) + secciones ancladas. El contenido
se escribe como strings Markdown y se renderiza con `react-markdown` + `remark-gfm`
y las clases `prose`, reutilizando el patrón de `components/planes/PlanTabs.tsx`.

### Archivos nuevos

- **`lib/manual-content.ts`** — el contenido: `MANUAL_SECTIONS: ManualSection[]`
  con `{ id, title, markdown }` para `planes`, `disponibilidad`, `solicitudes`,
  `cuenta`. Sin JSX ni iconos (fácil de editar). Las imágenes se referencian en el
  Markdown como `/manual/<archivo>.png`.
- **`components/admin/ManualContent.tsx`** (`"use client"`) — solo UI: consume
  `MANUAL_SECTIONS`, mapea `id → LucideIcon` (`ICONS`), layout dos columnas con ToC
  pegajoso (`lg:sticky`) + secciones ancladas, Markdown con `react-markdown` +
  `remark-gfm` (clase `prose … dark:prose-invert`) y un `components.img` que
  estiliza las capturas (`rounded-lg border`, `loading="lazy"`).
- **`app/admin/manual/page.tsx`** — server component estático (sin Prisma ni
  `force-dynamic`); `metadata.title` + encabezado + `<ManualContent />`.
- **`public/manual/*.png`** — capturas: `planes-listado`, `planes-form`,
  `disponibilidad`, `solicitudes`, `usuarios`, `perfil`.

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
  índice + las 4 secciones con texto real e imágenes; el item aparece en el
  sidebar del admin. Las 6 rutas `/manual/*.png` responden 200. 0 errores de consola.
- Gate: un no-admin en `/admin/manual` es redirigido a `/`; el botón no se muestra
  a no-admin en `/cuenta`.

## Pendiente

- Revisión del texto por el usuario y ajustes finos de las capturas.
