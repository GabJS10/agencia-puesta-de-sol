# Exportación CSV por tipo y límite de días en planes por rango

Rama: `feat/estados-correos-reportes`. Continúa `specs/notificaciones-pipeline.md`. Todo vive en `frontend/`.

## Contexto

1. **Exportar:** solo había un CSV (detalle de solicitudes). Ahora el usuario elige qué reporte exportar.
2. **Rango de fechas:** en los planes con "Reserva por: Rango de fechas" el cliente podía elegir cualquier rango (del 1 al 31). Ahora el admin define un **mínimo y un máximo de días** por plan.

## 1. Exportación por tipo

- **`app/api/admin/reportes/export/route.ts`:**
  - Parámetro `tipo`; un tipo desconocido responde 400 (se valida con `Object.hasOwn`). Sin sesión de admin, 403.
  - Respeta los mismos filtros de la página (`parseReportFilters`).
  - Todos los CSV usan `;`, BOM UTF-8, CRLF y **decimales con coma**, para que Excel en español los lea como números.
  - Nombre del archivo: `<tipo>_<desde>_<hasta>.csv`.

  | tipo | Columnas | Fuente |
  |---|---|---|
  | `solicitudes` (por defecto) | ID, fecha, plan, cliente, contacto, inicio, fin, personas, estado, precio, valor | `getReportRows` |
  | `resumen` | Métrica; Valor (periodo, filtros, KPIs del profesor y secundarios, tasas) | `getReport().kpis/topPlan` |
  | `planes` | Plan; Solicitudes; Vendidas; Conversión; Personas; Ingreso | `perPlan` |
  | `estados` | Etapa del pipeline; Estado; Cantidad; % del total | `byStatus` + `PIPELINE_STAGES` |
  | `serie` | Semana o mes; Solicitudes; Efectivas | `series` |

- **`lib/pipeline-stages.ts`:** las etapas del pipeline se extrajeron de `PipelineBoard` para compartirlas con el export.
- **`components/admin/ExportMenu.tsx`:** menú "Exportar" (`DropdownMenu` de `radix-ui`). Cada opción es un enlace `download` con los filtros actuales, acompañado de su descripción.

## 2. Mínimo y máximo de días

- **Modelo** (migración `20261010172854_rango_dias_plan`):
  - `Plan.minDays` y `Plan.maxDays` (`Int?`), contando el día de salida y el de regreso: duración = `endDate − travelDate`, con fin exclusivo.
  - Backfill: los planes que ya estaban en DATE_RANGE quedaron con 2 a 7 días.
- **Admin:**
  - `availabilitySchema` (enteros de 1 a 60) exige ambos en DATE_RANGE y `min ≤ max`.
  - El PATCH de availability los guarda; en SINGLE_DAY los pone en null.
  - `AvailabilityForm` muestra "Mínimo de días" y "Máximo de días", con 2 y 7 sugeridos al pasar a rango, y los valida.
- **Servidor:** `POST /api/solicitudes` responde 400 "Este plan se reserva de X a Y días" si el rango queda fuera de límites.
- **Cliente — `ReservationForm`:**
  - En react-day-picker v9 el primer clic deja `from === to`. Si el plan exige más de un día, eso se trata como "eligiendo el regreso" (`choosingEnd`).
  - Mientras tanto se deshabilitan los días que harían el viaje más corto o más largo (en ambas direcciones desde el inicio).
  - Textos de ayuda: "Ahora elige el día de regreso…" y "de X a Y días (N elegidos)".
  - Un error claro si el rango queda inválido, y el envío se bloquea.
- **`durationText(min, max)`** en `lib/format-dates.ts` (lo usan el resumen y el formulario). `AvailabilitySummary` muestra "Plan de varios días: de X a Y días".
- `minDays`/`maxDays` se agregaron a `availabilitySelect`, `toPlane` y el tipo `Plane`.

## Verificación (local, 2026-10-10)

- `tsc`, `lint` y `build` en verde. Pruebas sobre `next start -p 3001`.
- **Export:**
  - Los 5 tipos con BOM, `;` y cabeceras correctas.
  - `tipo=constructor` da 400; sin sesión, 403.
  - El menú muestra las 5 opciones con los filtros en la URL.
- **Admin:** guardar con mínimo > máximo, o sin límites en modo rango, da 400; 2–4 da 200.
- **Servidor:** un rango de 10 días o de 1 día da 400 ("de 2 a 4 días"); uno de 3 días da 201.
- **Calendario** (plan 2–4 días, inicio el día 10): 9, 11, 12 y 13 habilitados; 14 y 15 deshabilitados. Al elegir del 10 al 13 muestra "(4 días elegidos)".

## Pendiente

- **Railway:** aplicar también la migración `20261010172854_rango_dias_plan`.
