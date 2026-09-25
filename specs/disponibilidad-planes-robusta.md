# Sistema robusto de disponibilidad de planes

## Contexto

Hoy la disponibilidad **no es un dato propio**: se *deriva* de `PlanRequest` con `status = CONFIRMED`. Reglas y fragilidades actuales:

- Un plan es **exclusivo por día**: una sola reserva confirmada bloquea el día completo, sin importar `guests` (el aforo no cuenta).
- Solo hay **un día** (`travelDate`); no existen rangos multi-día.
- Los chequeos en `POST /api/solicitudes` (`route.ts:33-45`) y `PATCH /api/admin/solicitudes/[id]` (`route.ts:37-54`) hacen *check-then-write* **sin transacción ni constraint**, así que dos confirmaciones concurrentes pueden **duplicar la reserva** del mismo día.
- No hay control manual del admin: no se pueden bloquear fechas (mantenimiento/clima) ni marcar un plan como "agotado" sin despublicarlo.

**Objetivo (decidido con el usuario):**
1. **Correctitud anti-doble-reserva** — reservas atómicas, sin carreras.
2. **Control manual del admin** — bloqueos (blackouts) de fechas y toggle de "reservas abiertas/agotado".
3. **Modo mixto por plan** — cada plan es *exclusivo* o por *aforo/cupo* (N personas por día).
4. **Duración configurable por plan** — el admin elige, al crear/editar, si el plan se reserva por **día único** o por **rango de fechas**.

Fuera de alcance (no priorizado): historial/auditoría de cambios y modelar la disponibilidad como calendario explícito de slots. La disponibilidad sigue derivándose de reservas + blackouts, pero con modelo, concurrencia y control adecuados.

---

## Diseño

### 1. Esquema Prisma (`frontend/prisma/schema.prisma`)

Nuevos enums:
```prisma
enum AvailabilityMode { EXCLUSIVE  CAPACITY }  // exclusivo por día | aforo por día
enum BookingMode      { SINGLE_DAY DATE_RANGE } // día único | rango de fechas
```

`Plan` — añadir:
```prisma
availabilityMode AvailabilityMode @default(EXCLUSIVE)
capacity         Int?             // cupo de personas/día cuando CAPACITY; null en EXCLUSIVE
bookingMode      BookingMode      @default(SINGLE_DAY)
bookingsOpen     Boolean          @default(true) // pausar/"agotado" sin despublicar
blackouts        PlanBlackout[]
```

`PlanRequest` — añadir (sin renombrar `travelDate`, para no tocar referencias existentes):
```prisma
endDate   DateTime?           // fin EXCLUSIVO del rango; null = día único
updatedAt DateTime @updatedAt // faltaba; útil y barato
```
Semántica: la reserva ocupa el rango medio-abierto `[travelDate, endDate ?? travelDate+1día)` en UTC.

Nuevo modelo:
```prisma
model PlanBlackout {
  id        Int      @id @default(autoincrement())
  plan      Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  planId    Int
  startDate DateTime // [startDate, endDate) UTC
  endDate   DateTime
  reason    String?
  createdAt DateTime @default(now())
  @@index([planId, startDate])
}
```

Migración: `prisma migrate dev --name availability-robusta`. Los planes existentes quedan `EXCLUSIVE` / `SINGLE_DAY` / `bookingsOpen=true` (comportamiento idéntico al actual → sin regresión). `endDate` nulo en reservas viejas = día único.

> **Concurrencia:** no se usa índice único parcial, porque una tabla mixta (exclusivo + aforo + rangos) no se cubre con un solo `UNIQUE`. La correctitud se garantiza con **lock de advisory por plan dentro de una transacción** (ver §3), único punto donde se decide ocupar.

### 2. Servicio de disponibilidad (reescribir `frontend/lib/get-plan-availability.ts`)

Reemplazar `getUnavailableDates` por un servicio que entienda modo, aforo, rangos y blackouts. Reutiliza los helpers de `frontend/lib/date-range.ts` (`dayRangeUtc`, `startOfDayUtc`, `toDayKey`) y añade un `eachDayKey(start, end)` que itere días de un rango medio-abierto.

```ts
// Devuelve, para un rango [from, to), qué días están llenos y (en CAPACITY) cuántos cupos quedan.
getPlanAvailability(plan, from, to): {
  unavailableDays: string[];              // días completamente bloqueados
  remainingByDay?: Record<string, number>; // solo CAPACITY: cupos libres por día
}
```
Lógica por día `D` en el rango:
- `!plan.bookingsOpen` → todos los días bloqueados.
- Blackout que cubre `D` → bloqueado.
- **EXCLUSIVE:** bloqueado si existe alguna `PlanRequest` `CONFIRMED` cuyo `[travelDate,endDate)` cubra `D`.
- **CAPACITY:** `remaining = capacity - Σ guests` de las `CONFIRMED` que cubren `D`; bloqueado si `remaining <= 0`.

Se consultan de una sola vez las reservas `CONFIRMED` y los blackouts que **solapan** `[from, to)` (`travelDate < to AND (endDate ?? travelDate+1) > from`).

Helper compartido `assertRangeAvailable(tx, plan, start, end, guests)` (nuevo, en el mismo módulo o `frontend/lib/availability.ts`) que lanza/`return`ea conflicto si algún día del rango no admite `guests`. Lo usan POST y PATCH dentro de la transacción.

### 3. Reserva atómica (correctitud)

Envolver la decisión en una transacción con **advisory lock por plan** para serializar todos los intentos del mismo plan:

```ts
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'plan:'+planId}))`;
  // re-leer CONFIRMED + blackouts del rango DENTRO del lock
  // assertRangeAvailable(...) -> si falla, throw ConflictError (=> 409)
  await tx.planRequest.create/update(...);
});
```
El lock se libera solo al terminar la transacción. Robusto para exclusivo, aforo y rangos sin constraints frágiles.

- **`POST /api/solicitudes`** (`frontend/app/api/solicitudes/route.ts`): añadir `endDate` opcional al `zod` schema; normalizar a UTC; validar que `bookingMode`/rango coincidan con el plan (día único ⇒ endDate ignorado; rango ⇒ endDate requerido y > inicio); ejecutar la transacción con lock; 409 con mensaje claro si no hay cupo/está tomado/bloqueado.
- **`PATCH /api/admin/solicitudes/[id]`** (`frontend/app/api/admin/solicitudes/[id]/route.ts`): al pasar a `CONFIRMED`, misma transacción con lock re-validando el rango contra aforo/exclusividad/blackouts antes de `update`.

### 4. Control manual del admin

- **Blackouts:** nueva ruta `frontend/app/api/admin/planes/[id]/blackouts/route.ts` (`POST` crear, `GET` listar) y `.../blackouts/[blackoutId]/route.ts` (`DELETE`), protegidas con `requireAdmin`. Zod para `{ startDate, endDate, reason? }`.
- **Toggle "reservas abiertas":** ya cubierto por `bookingsOpen` en el update de plan.
- **UI admin:** en `frontend/components/admin/PlanForm.tsx` añadir controles para `availabilityMode` (+ `capacity` condicional), `bookingMode` y `bookingsOpen`; y una sección de blackouts (lista + añadir/eliminar) en la página de edición `frontend/app/admin/planes/[id]/page.tsx`.

### 5. Plumbing de campos nuevos

- `frontend/lib/plan-schema.ts`: añadir `availabilityMode`, `capacity` (requerido si `CAPACITY`, refine), `bookingMode`, `bookingsOpen` a `planSchema`.
- `frontend/app/api/admin/planes/route.ts` (POST) y `frontend/app/api/admin/planes/[id]/route.ts` (PUT/PATCH): persistir los nuevos campos.
- `frontend/components/admin/PlanForm.tsx`: extender `PlanFormData` y el estado inicial.
- `frontend/lib/plan-map.ts` (`toPlane`) y `frontend/types/Planes.ts`: exponer `availabilityMode`, `capacity`, `bookingMode`, `bookingsOpen` al frontend.

### 6. Frontend de reserva

- `frontend/app/(site)/planes/[slug]/page.tsx`: llamar al nuevo servicio (rango ~próximos 12 meses) y pasar `unavailableDays` (+`remainingByDay` y config del plan) a `ReservationForm`.
- `frontend/components/planes/ReservationForm.tsx`:
  - Si `bookingMode === DATE_RANGE`, usar el calendario en modo `range` (`Calendar mode="range"`, ya disponible en `components/ui/calendar`) y enviar `endDate`.
  - En `CAPACITY`, deshabilitar un día cuando `remainingByDay[day] < guests` (no solo cuando esté a 0), y mostrar cupos restantes.
  - Ajustar el copy: "Confirmación inmediata" (`page.tsx:125`) no refleja el flujo de solicitud→confirmación; cambiarlo a algo como "Sujeto a confirmación".

---

## Archivos a tocar

**Backend/datos:** `prisma/schema.prisma` (+migración) · `lib/date-range.ts` · `lib/get-plan-availability.ts` (→ o `lib/availability.ts`) · `lib/plan-schema.ts` · `lib/plan-map.ts` · `app/api/solicitudes/route.ts` · `app/api/admin/solicitudes/[id]/route.ts` · `app/api/admin/planes/route.ts` · `app/api/admin/planes/[id]/route.ts` · **nuevas** `app/api/admin/planes/[id]/blackouts/route.ts` y `.../[blackoutId]/route.ts`

**Frontend/admin:** `types/Planes.ts` · `components/admin/PlanForm.tsx` · `components/admin/StatusSelect.tsx` (tipar `status` desde el enum en vez de `string`) · `app/admin/planes/[id]/page.tsx` · `app/(site)/planes/[slug]/page.tsx` · `components/planes/ReservationForm.tsx`

---

## Verificación

1. **Migración:** `cd frontend && npx prisma migrate dev --name availability-robusta && npx prisma generate`. Verificar que planes existentes quedan `EXCLUSIVE/SINGLE_DAY/bookingsOpen=true` y que la web sigue igual.
2. **Exclusivo (regresión):** confirmar una reserva para un día ⇒ ese día aparece tachado y `POST` devuelve 409.
3. **Aforo:** plan `CAPACITY capacity=10`; confirmar reservas sumando 8 guests ⇒ día disponible solo para ≤2; el 3.º (que excede) recibe 409; a 10 el día queda bloqueado.
4. **Rango:** plan `DATE_RANGE`; reservar `[10, 13)` ⇒ días 10-12 bloqueados, 13 libre.
5. **Blackout / agotado:** crear blackout desde el admin y togglear `bookingsOpen=false` ⇒ días bloqueados en el calendario y `POST` 409.
6. **Concurrencia (clave):** disparar dos `POST`/confirmaciones simultáneas para el mismo día/plan exclusivo (p. ej. `xargs -P2 curl`) ⇒ exactamente una tiene éxito, la otra 409. Repetir en `CAPACITY` para verificar que la suma nunca supera el cupo.
