# Disponibilidad de planes en apartado separado

## Contexto

La lógica de disponibilidad (`lib/availability.ts`, `lib/get-plan-availability.ts`,
`lib/date-range.ts`) ya era robusta, pero su **configuración** estaba mezclada
dentro del flujo de edición del plan:

- Los campos de config (`availabilityMode`, `capacity`, `bookingMode`,
  `bookingsOpen`) vivían en un `<fieldset>` "Disponibilidad" de `PlanForm` y
  viajaban en el mismo payload que el contenido del plan (`planSchema` +
  POST/PATCH de `/api/admin/planes`).
- El `BlackoutManager` (fechas bloqueadas) se montaba al final de la página de
  editar plan.

Objetivo: mover toda la configuración de disponibilidad a una **sub-página por
plan** dedicada, dejando la edición de plan solo con el contenido.

## Cambio realizado

Sub-página por plan: `/admin/planes/[id]/disponibilidad`, que agrupa el modo de
ocupación, cupo, modo de reserva, reservas abiertas y las fechas bloqueadas.

### Separación del modelo de datos (bug de "wipe")

El PATCH del plan escribía los campos de disponibilidad. Si `PlanForm` dejaba de
enviarlos pero el PATCH los seguía escribiendo, cada guardado de contenido
**reseteaba** la disponibilidad a los defaults. Por eso la disponibilidad se sacó
por completo de `planSchema` y de los writes del plan, con su propio endpoint.

### Archivos

**Nuevos**
- `lib/availability-schema.ts` — Zod schema de los 4 campos + `.refine` de capacity.
- `app/api/admin/planes/[id]/availability/route.ts` — `PATCH` dedicado (`requireAdmin`,
  valida, actualiza solo esos 4 campos; `capacity` se normaliza a null salvo modo CAPACITY).
- `components/admin/AvailabilityForm.tsx` — formulario cliente que guarda vía el
  endpoint anterior y hace `router.refresh()`.
- `app/admin/planes/[id]/disponibilidad/page.tsx` — server component que carga el
  plan + blackouts y renderiza `AvailabilityForm` + `BlackoutManager`, con enlace
  de vuelta a editar plan.

**Modificados**
- `lib/plan-schema.ts` — se eliminaron los campos de disponibilidad y su `.refine`.
- `app/api/admin/planes/route.ts` (POST) — deja de escribir disponibilidad; los
  planes nuevos toman los `@default` de Prisma (EXCLUSIVE / SINGLE_DAY /
  bookingsOpen=true / capacity null).
- `app/api/admin/planes/[id]/route.ts` (PATCH) — deja de escribir disponibilidad.
- `components/admin/PlanForm.tsx` — se quitó el fieldset "Disponibilidad" y sus
  campos de `PlanFormData`/defaults.
- `app/admin/planes/[id]/page.tsx` — sin `BlackoutManager`; botón "Configurar
  disponibilidad" hacia la sub-página.
- `app/admin/planes/page.tsx` — acción "Disponibilidad" por fila en el listado.

**Sin cambios**: `BlackoutManager.tsx` y sus rutas `/blackouts/*`, el motor de
cálculo de disponibilidad y `prisma/schema.prisma`.

## Verificación

1. `npm run build` / `npx tsc --noEmit`.
2. Crear plan nuevo → se crea con defaults de disponibilidad.
3. Editar contenido del plan y guardar → la disponibilidad **no** se resetea.
4. En `/admin/planes/[id]/disponibilidad`: cambiar a CAPACITY + cupo, guardar;
   añadir/eliminar fecha bloqueada; recargar y confirmar persistencia.
5. Sitio público (`/planes/[slug]`) refleja cupo y fechas bloqueadas sin cambios
   en la lógica de cálculo.
