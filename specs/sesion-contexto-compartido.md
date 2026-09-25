# Sesión compartida vía contexto SSR-seeded

## Contexto

El estado de sesión del cliente **no estaba consolidado**: cada componente pedía
`/api/auth/me` por su cuenta, sin coordinación.

- `components/layout/Navbar.tsx` — `useEffect` con dependencia `[pathname]`: hacía
  fetch al montar **y en cada navegación**, solo para alternar "Ingresar" / "Mi
  cuenta".
- `components/planes/ReservationForm.tsx` — `useEffect` al montar: fetch para
  prellenar nombre/email si había sesión.

Resultado: requests redundantes a `/api/auth/me` y, en el Navbar, uno **por cada
cambio de ruta** aunque la sesión casi nunca cambia. (La ruta `/api/auth/me` solo
llama `getSession()` sobre la cookie JWT `pds_session`; es barata, pero se invocaba
sin necesidad.)

**Objetivo:** una única fuente de verdad de sesión en el cliente, sin fetches
redundantes.

## Decisión

Se eligió un **contexto sembrado desde el server** en lugar de SWR:

- `app/(site)/layout.tsx` ya es un *server component* y puede resolver la sesión
  con `getSession()` (`lib/auth.ts`).
- Login/Logout/Register ya llaman `router.refresh()`, que re-ejecuta ese layout.

Así, un `SessionProvider` sembrado con la sesión del server logra **cero fetches en
la carga inicial** y propaga los cambios de auth automáticamente, **sin añadir
dependencias** (SWR seguiría haciendo un fetch en cliente y añadiría la librería).

## Implementación

### 1. `components/session-provider.tsx` (nuevo)

- `"use client"`. Contexto `{ user: SessionUser | null; refresh() }`.
- `SessionProvider({ initialUser, children })`: `useState(initialUser)` +
  `useEffect(() => setUser(initialUser), [initialUser])` para re-sincronizar tras
  `router.refresh()` (la prop solo cambia de identidad en un re-render del server,
  no en re-renders del cliente).
- `refresh()`: escape hatch que re-consulta `/api/auth/me`; normalmente innecesario
  porque `router.refresh()` ya re-siembra la prop.
- Hook `useSession()` que lanza si se usa fuera del provider.
- `SessionUser` (`{id,email,name,role}`) importado de `@/lib/session`.

### 2. `app/(site)/layout.tsx`

- `const [home, user] = await Promise.all([getHome(), getSession()]);`
- Envuelve `<Navbar/> + children + <Footer/>` con
  `<SessionProvider initialUser={user}>`.

### 3. `components/layout/Navbar.tsx`

- Eliminado `useState<SessionUser>` y el `useEffect` que hacía fetch con
  `[pathname]`; ahora `const { user } = useSession();`.
- Se conserva `usePathname` para los enlaces activos y el resto de la UI.

### 4. `components/planes/ReservationForm.tsx`

- Eliminado el `useEffect` que hacía fetch a `/api/auth/me`.
- `const { user } = useSession();` + `useEffect` sobre `user` para el prefill,
  manteniendo la semántica de "no pisar lo que el usuario ya escribió".

### Sin cambios

`LoginForm`, `LogoutButton`, `RegisterForm` no requieren cambios: su
`router.refresh()` re-siembra el contexto. La ruta `app/api/auth/me/route.ts` se
mantiene como escape hatch (`refresh()`) y para usos futuros.

## Nota

La petición original mencionaba "3× fetch (Navbar/Hero/ReservationForm)"; en la
práctica **Hero no consumía la sesión** — eran 2 sitios, con el Navbar refetch-eando
por navegación.

## Verificación

- `npx tsc --noEmit` y `npx eslint` sobre los archivos tocados: limpios.
- Único `fetch('/api/auth/me')` restante: el `refresh()` del provider (no se llama
  en la carga).
- Manual (DevTools → Network, filtro `auth/me`): 0 requests en carga inicial y al
  navegar; el Navbar cambia a "Mi cuenta" tras login sin recargar, y el formulario
  de reserva aparece prellenado con nombre/email.
