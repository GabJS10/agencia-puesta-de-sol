# Disponibilidad visible, estados con peso, correos y reportes

Rama: `feat/estados-correos-reportes`. Todo vive en `frontend/`.

## Contexto

- **Disponibilidad poco visible:** el motor (`lib/availability.ts`) ya manejaba los modos EXCLUSIVE/CAPACITY, los rangos, los blackouts y el advisory lock, pero el cliente apenas lo veía. El calendario solo tachaba y deshabilitaba días. No mostraba cupos, modo ni próxima fecha, y la ficha decía "Salidas programadas" como texto fijo.
- **Estados de adorno:** los estados (`PENDING|CONTACTED|CONFIRMED|CANCELLED`) se cambiaban con un `<select>` libre que permitía cualquier transición. No había historial ni nota, y no se avisaba al cliente. El único efecto era que solo CONFIRMED contaba en el cupo.
- **Sin correos ni reportes.**

**Decisiones**
- Correo con **Brevo** por API HTTP. Railway Hobby bloquea SMTP saliente (documentación de Railway: "SMTP is only available on the Pro plan").
- Pendiente y Contactado **apartan cupo 72 h** y vencen solos.
- El **cliente puede cancelar** su solicitud.
- Estados nuevos **Completado** y **Rechazado** (distinto de Cancelado).
- Toasts con **sonner**.
- La agencia recibe los avisos en `jgabis65@gmail.com` (`ADMIN_NOTIFY_EMAILS`). El login admin no cambia.

## Modelo de datos

Migración `prisma/migrations/20261010032027_estados_notificaciones/`:

- `RequestStatus`: se agregan `COMPLETED`, `REJECTED`, `EXPIRED`.
- `PlanRequest`:
  - `holdExpiresAt?`: hasta cuándo aparta cupo.
  - `unitPrice?`: precio por persona al solicitar, para los reportes.
  - `updatedAt`.
- `enum EventActor { CLIENT ADMIN SYSTEM }`.
- `PlanRequestEvent`:
  - Campos: `requestId` (cascade), `fromStatus?` (null = creación), `toStatus`, `note?` (va en el correo), `actor`, `actorId?` (User, SetNull), `emailSentAt?`, `createdAt`.
  - Índice `[requestId, createdAt]`.
- Backfill:
  - Las PENDING/CONTACTED existentes reciben `holdExpiresAt = now + 72h`.
  - `unitPrice` = precio actual del plan.
  - Cada solicitud recibe un evento inicial `null → status`.

## Reglas de estados — `lib/request-status.ts`

Sin dependencias de servidor; lo usan también los componentes cliente.

| Desde | Admin | Cliente | Sistema |
|---|---|---|---|
| PENDING | CONTACTED, CONFIRMED, REJECTED | CANCELLED | EXPIRED |
| CONTACTED | CONFIRMED, REJECTED | CANCELLED | EXPIRED |
| CONFIRMED | COMPLETED (solo si el viaje ya empezó), CANCELLED | — | — |
| EXPIRED | CONFIRMED (rescate, con chequeo de cupo), REJECTED | — | — |
| COMPLETED / REJECTED / CANCELLED | terminales | — | — |

- `HOLD_HOURS = 72` y `HOLDING_STATUSES = [PENDING, CONTACTED]`.
- `isHolding(status, holdExpiresAt)` y `holdUntil()`.
- `noteRequired`: el admin debe escribir un motivo para REJECTED y CANCELLED.
- Actualizado en `specs/notificaciones-pipeline.md`: el admin solo cancela ("Anular reserva") reservas CONFIRMED.
- `STATUS_META` (etiqueta, plural, clase, descripción), `ACTION_LABEL` y `ACTOR_LABEL`. Reemplazan los mapas `STATUS` duplicados.

## Flujo — `lib/request-workflow.ts` (server-only)

- **`transitionRequest({ id, to, note, actor, actorId, ownerId })`:**
  - Valida la regla y la nota.
  - Si `ownerId` no coincide, responde 404.
  - COMPLETED solo se permite si `travelDate <= hoy`.
  - **CONFIRMED** se ejecuta bajo `withPlanLock` y llama a `checkRangeAvailable(..., excludeRequestId)` para no contar el apartado de la propia solicitud. Usa `bookingsOpen: true`, porque cerrar reservas solo frena solicitudes nuevas, no la confirmación de las ya recibidas.
  - El update es optimista (`updateMany where status = from`). Si otro proceso cambió el estado, responde 409 ("La solicitud cambió…").
  - `holdExpiresAt`:
    - CONTACTED lo renueva a now + 72 h.
    - EXPIRED conserva la fecha en que venció.
    - El resto lo pone en null.
  - El evento se crea en la misma transacción.
  - No envía correos: lo decide quien llama.
- **`createPlanRequest(db, data)`:** crea la solicitud PENDING con su evento de creación y `holdExpiresAt`. Si la solicitud no tiene plan, `holdExpiresAt` queda en null.
- **`expireStaleRequests()`:** vencimiento **perezoso**, sin cron. Pasa a EXPIRED las PENDING/CONTACTED con apartado vencido y agenda el correo con `after()`. Se llama al cargar:
  - el dashboard admin;
  - `/admin/solicitudes` (lista y detalle);
  - `/admin/reportes`;
  - `/cuenta`.

  La disponibilidad ya ignora los apartados vencidos aunque nadie haya marcado el estado.

## Disponibilidad — `lib/availability.ts`

- Ocupan cupo las solicitudes `CONFIRMED` **o** `PENDING|CONTACTED` con `holdExpiresAt > now`.
- Parámetro nuevo `excludeRequestId` en `getPlanAvailability` y `checkRangeAvailable`.
- `AvailabilityResult` suma:
  - `tentativeDays`: días bloqueados **solo** por apartados, que podrían liberarse.
  - `capacity`.
- Mensajes con fechas legibles (`formatDayKey`). Hay un mensaje propio cuando el bloqueo se debe a un apartado.
- `POST /api/solicitudes` rechaza duplicados: el mismo email, plan y fecha con una solicitud aún en proceso.

## Fechas — `lib/date-range.ts` + `lib/format-dates.ts`

Las fechas de viaje son días UTC. Para formatearlas sin desfase de zona horaria (en desarrollo, Bogotá es UTC−5):
- `utcDayAsLocal`, `dayKeyAsLocal`, `lastDayUtc` (`endDate` es exclusivo).
- `formatTravelDay`, `formatTravelRange`, `formatDayKey`.
- `formatInstant` (hora de Colombia, UTC−5 fijo), `formatRemaining`, `hoursUntil`.

## Correos

- **`lib/email/brevo.ts` — `sendEmail()`:**
  - Hace un `POST https://api.brevo.com/v3/smtp/email` con el header `api-key`, sin SDK y con timeout de 10 s.
  - Sin `BREVO_API_KEY` o `MAIL_FROM_EMAIL`, imprime el correo en consola.
  - Nunca lanza errores.
- **`lib/email/templates.ts`:** funciones puras que devuelven HTML con estilos inline y texto plano. **Escapan todo lo que escribe el usuario.** Plantillas:
  - `requestReceivedClient`
  - `requestReceivedAdmin` (con `replyTo` = cliente)
  - `statusChangedClient`: un texto por estado; distingue la cancelación del cliente de la del admin; la nota se muestra como "Motivo" o "Mensaje de la agencia"; para EXPIRED el botón lleva a "Volver a solicitar".
  - `requestCancelledByClientAdmin`
- **`lib/notifications.ts`:** `notifyRequestCreated`, `notifyStatusChanged` y `notifyStatusEvents`.
  - Cuando el correo al cliente sale bien, marcan `emailSentAt`.
  - Destinatarios de la agencia: `ADMIN_NOTIFY_EMAILS` o, si no está, los usuarios ADMIN.
- **Disparo:** siempre con `after()` de `next/server`, desde las rutas y desde las páginas que vencen solicitudes.

**Variables**

| Variable | Uso |
|---|---|
| `BREVO_API_KEY` | API key de Brevo |
| `MAIL_FROM_EMAIL` | Remitente verificado en Brevo (`jgabis65@gmail.com`) |
| `MAIL_FROM_NAME` | Nombre del remitente ("Puesta del Sol") |
| `ADMIN_NOTIFY_EMAILS` | Avisos a la agencia, separados por coma |
| `APP_URL` | Base de los enlaces (`http://localhost:3000` en local) |

Con un remitente Gmail sin dominio propio es fácil que los correos lleguen a spam. Conviene un dominio propio más adelante.

## API

- `POST /api/solicitudes`: usa `createPlanRequest`, guarda `unitPrice`, rechaza duplicados y llama a `after(notifyRequestCreated)`.
- `PATCH /api/admin/solicitudes/[id]`: recibe `{ status, note? }`, llama a `transitionRequest(ADMIN)` y luego a `after(notifyStatusChanged)`.
- **Nuevo** `POST /api/mis-solicitudes/[id]/cancelar`: recibe `{ note? }`, requiere `requireUser` y verifica que el usuario sea el dueño (`ownerId`). Avisa por correo al cliente y a la agencia.
- **Nuevo** `GET /api/admin/reportes/export`: CSV con `;`, BOM UTF-8 y los mismos filtros de la página de reportes.

## UI

**Admin**
- **`app/admin/solicitudes/page.tsx`:**
  - Pestañas por estado con conteos (`groupBy`).
  - Filtros por GET: búsqueda, plan y rango de fecha de viaje.
  - Paginación de 25.
  - Rangos de fechas correctos y badge "Aparta cupo · vence en X".
- **`app/admin/solicitudes/[id]/page.tsx` (nuevo):**
  - Acciones.
  - Datos de la reserva y del cliente (mailto, tel, WhatsApp).
  - Valor estimado.
  - **Disponibilidad de esas fechas** sin contar la propia solicitud: veredicto de `checkRangeAvailable` y detalle día a día.
  - **Historial** con actor, nota y si se envió el correo.
- **`components/admin/RequestActions.tsx`** (reemplaza `StatusSelect`, que se eliminó):
  - Botones solo para las transiciones permitidas.
  - Diálogo de Radix con el efecto de la acción y la nota (obligatoria u opcional).
  - Toasts.
- **`components/requests/StatusBadge.tsx`:** `StatusBadge` y `HoldBadge`.
- **`app/admin/page.tsx`:** tarjetas "En proceso", "Apartados por vencer (<24 h)" y "Viajes confirmados · 7 días"; enlaces al detalle.
- **Toasts** también en `AvailabilityForm` y `BlackoutManager`.

**Cliente**
- **`app/(site)/cuenta/page.tsx`:**
  - Badge y descripción del estado, y rango de fechas.
  - Apartado vigente.
  - Historial con las notas de la agencia (`<details>`).
  - Filtros con todos los estados.
  - `components/cuenta/CancelRequestButton.tsx`: diálogo con motivo opcional y toast.
- **`components/planes/AvailabilitySummary.tsx`** (ficha del plan):
  - Modo (cupo por día o salida privada) y tipo (un día o varios).
  - Reservas abiertas o cerradas.
  - **Próxima fecha disponible** y "X de 30 días con disponibilidad".
  - El encabezado reemplaza "Salidas programadas" por el modo real.
- **`components/planes/ReservationForm.tsx`:**
  - `DayButton` propio (vía contexto) que muestra los cupos restantes bajo cada día en modo CAPACITY, en rojo si son los últimos (≤25 %).
  - Los días con apartado se marcan "puede liberarse".
  - Leyenda siempre visible.
  - Aviso del cupo de la fecha o rango elegido.
  - El tope de personas es el menor entre el aforo y el cupo libre.
  - Toast al enviar y mensaje de éxito con el apartado de 72 h.
- **`DestinationCard` y listado `/planes`:** badge "Cupo N/día", "Salida privada" o "Reservas cerradas", tomado de la configuración del plan, sin consultas extra.
- **`components/ui/sonner.tsx`:** `Toaster` según el tema activo, montado en `app/layout.tsx`.

## Reportes — `/admin/reportes`

`lib/reports.ts` hace consultas Prisma y agrega en JS (el volumen es bajo).

- **Filtros:** 30, 90 o 365 días, o rango propio; base por fecha de solicitud o de viaje; plan.
- **Indicadores:**
  - Solicitudes y en proceso.
  - Confirmadas (CONFIRMED + COMPLETED) y conversión.
  - Personas.
  - Ingreso estimado (`unitPrice × guests`).
  - Tiempo medio hasta el primer evento ADMIN.
- **Gráficas** (HTML/CSS, sin dependencias, tooltip nativo `title`):
  - Solicitudes y confirmadas por semana, o por mes si el rango supera 120 días.
  - Embudo por estado, con las tasas de rechazo, cancelación y vencimiento.
  - Top 8 planes.
  - Ocupación confirmada de los próximos 30 días: cupos usados entre aforo × 30, o días reservados entre 30.
- **Tabla por plan.**
- **Paleta:** barro `#b85c38` = solicitudes, mar `#159a8c` = confirmadas. Validada con el script de dataviz sobre la superficie clara `#fbf5e9` y la oscura `#211a33`: pasa todos los checks.
- **Menú:** entrada "Reportes" en `AdminSidebar`.

## Documentación

- `lib/manual-content.ts`:
  - **Disponibilidad**: apartados de 72 h y lo que ve el cliente.
  - **Solicitudes**: tabla de estados, transiciones y correos.
  - **Reportes**: sección nueva.
- `PROYECTO.md` (modelo y variables) y `DESPLIEGUE.md` (variables de correo).

## Verificación (local, 2026-10-09)

- `tsc --noEmit`, `pnpm lint` (solo 2 advertencias que ya existían) y `pnpm build` en verde.
- Postgres local (`pds-postgres`, puerto 5433), migración y seed. Plan 1 en CAPACITY con cupo 10.
- **Pruebas con curl:**
  - Apartado de 6 personas: un pedido de 5 da 409 ("Solo quedan 4 cupos") y uno de 4 da 201.
  - Una solicitud duplicada da 409.
  - PENDING→COMPLETED da 409, y rechazar sin nota da 400.
  - CONTACTED→CONFIRMED funciona.
  - CONFIRMED→COMPLETED antes del viaje da 409.
  - Dos PATCH concurrentes: uno se aplica y el otro da 409.
  - En modo EXCLUSIVE, un pendiente bloquea el día con el mensaje de apartado. Cuando el cliente cancela, el día se libera.
  - Con `holdExpiresAt` en el pasado, al cargar `/admin/solicitudes` la solicitud pasa a EXPIRED, se crea el evento SYSTEM y se envía el correo. El rescate EXPIRED→CONFIRMED funciona.
  - Brevo aceptó todos los correos (`emailSentAt` registrado).
- **Pruebas en el navegador (playwright-cli):**
  - La ficha muestra el resumen y el calendario con cupos (20 oct: 4, 21 oct: 1).
  - El detalle admin muestra el veredicto de disponibilidad y el historial.
  - Reportes y CSV correctos.

## Pendiente

- **Railway:** aplicar la migración según `DESPLIEGUE.md` y cargar las 5 variables de correo, con `APP_URL` apuntando al dominio público.
- **Opcional:**
  - Cron para enviar los correos de vencimiento a tiempo aunque no haya tráfico.
  - Enlace firmado para que un invitado cancele su solicitud.
  - Dominio propio para el remitente.
