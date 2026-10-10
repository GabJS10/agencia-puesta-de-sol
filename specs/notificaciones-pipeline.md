# Cancelado solo en confirmadas, reportes con pipeline y notificaciones para admins

Rama: `feat/estados-correos-reportes`. Continúa `specs/estados-correos-reportes.md`. Todo vive en `frontend/`.

## Contexto

1. **Cancelado:** el admin podía cancelar solicitudes Pendientes y Contactadas, lo que se superponía con "Rechazar". Decisión: el **admin solo cancela reservas Confirmadas** (acción "Anular reserva"). El cliente sigue cancelando sus solicitudes Pendientes y Contactadas desde `/cuenta`.
2. **Reportes según el profesor:**
   - Cantidad de solicitudes, clientes contactados, solicitudes efectivas, % de efectividad y planes vendidos (cuál se vende más).
   - Debajo, un **pipeline**: columnas por etapa donde los registros pasan de una a otra, actualizado automáticamente.
   - Las gráficas anteriores se mantienen debajo.
3. **Notificaciones solo para admins:**
   - Eventos: nueva solicitud, cancelada por el cliente, apartado vencido y apartado por vencer.
   - Se muestran como **toast** y en un **apartado** donde se pueden marcar como leídas o borrar.
   - Al hacer clic se abre `/admin/solicitudes/[id]`.

## 1. Cancelado

- **Transiciones del admin** (`lib/request-status.ts` → `TRANSITIONS.ADMIN`):
  - PENDING → CONTACTED, CONFIRMED, REJECTED
  - CONTACTED → CONFIRMED, REJECTED
  - CONFIRMED → COMPLETED, CANCELLED
  - EXPIRED → CONFIRMED, REJECTED
- **Textos:** `ACTION_LABEL.CANCELLED` = "Anular reserva". El correo al cliente dice "Tu reserva fue anulada".
- **Diálogo de transición:** se extrajo `components/admin/TransitionDialog.tsx` (nota, confirmación, PATCH y toasts). Lo usan `RequestActions` y el pipeline.

## 2. Notificaciones in-app para admins

### Modelo (migración `20261010155632_notificaciones_admin`)
- `enum NotificationType { REQUEST_CREATED, REQUEST_CANCELLED, REQUEST_EXPIRED, HOLD_EXPIRING }`.
- `Notification`:
  - Campos: `userId` (admin destinatario, cascade), `type`, `requestId?` (cascade), `title`, `body`, `readAt?`, `createdAt`.
  - Índice `[userId, readAt, createdAt]`.
  - Se crea **una fila por admin**, así cada uno tiene su propio estado de lectura y sus propios borrados.
- `PlanRequest.expiryWarnedFor`: el `holdExpiresAt` que ya se avisó como "por vencer".

### Servidor — `lib/admin-notifications.ts`
- **`notifyAdmins(type, requestId)`:**
  - Arma el título (`<tipo> · <plan>`) y el cuerpo (`#id · nombre · personas · fechas`; para HOLD_EXPIRING agrega "vence en X").
  - Hace `createMany` para los usuarios ADMIN.
  - Nunca lanza errores.
- **`warnExpiringHolds()`:**
  - Busca las PENDING/CONTACTED con apartado que vence en menos de 24 h.
  - Reclama el aviso con un `updateMany` condicional sobre `expiryWarnedFor`. Es atómico, así que dos polls simultáneos no lo duplican. Si el apartado se renueva al contactar, se vuelve a avisar.
- **Disparo:**
  - `POST /api/solicitudes` → REQUEST_CREATED.
  - `POST /api/mis-solicitudes/[id]/cancelar` → REQUEST_CANCELLED.
  - `expireStaleRequests()` → REQUEST_EXPIRED.
  - El poll → HOLD_EXPIRING.
- **`lib/notification-meta.ts`** (seguro para el cliente): etiqueta y color por tipo, y el tipo serializado `AdminNotification`.

### API (`requireAdmin`; todo se limita al `userId` del admin)
- `GET /api/admin/notificaciones`:
  - `?after=<id>` devuelve solo las nuevas (para el polling); sin `after`, devuelve las últimas `limit` (con `filtro=no-leidas` opcional).
  - Respuesta: `{ unread, latestId, items }`.
  - Antes de responder ejecuta `expireStaleRequests()` y `warnExpiringHolds()`. Mientras haya un admin conectado, vencimientos y avisos salen a tiempo sin cron.
- `PATCH /api/admin/notificaciones`: `{ ids | all, read }`.
- `DELETE /api/admin/notificaciones`: `{ ids | all, onlyRead? }`.
- `PATCH` / `DELETE /api/admin/notificaciones/[id]`.

### Cliente
- **`components/admin/notifications/NotificationsProvider.tsx`:**
  - Polling cada 15 s; se pausa con la pestaña oculta y vuelve a consultar al recuperar la visibilidad.
  - La primera consulta solo fija la línea base, sin toasts.
  - Cada notificación nueva genera un `toast.custom` (sonner) clickeable completo: marca como leída y navega a `/admin/solicitudes/[id]`.
  - Si llegan más de 3 juntas, muestra un solo toast que lleva a `/admin/notificaciones`.
  - Con novedades llama a `router.refresh()` en las vistas vivas: dashboard, solicitudes, reportes y notificaciones.
  - Expone `unread`, `version` y `open()`.
  - Se monta en `app/admin/layout.tsx` y en `app/(site)/layout.tsx` cuando la sesión es ADMIN.
- **`AdminSidebar`:** entrada "Notificaciones" con badge de no leídas; con el sidebar colapsado, un punto.
- **`app/admin/notificaciones/page.tsx` + `NotificationsList.tsx`:**
  - Filtro Todas / No leídas.
  - Clic en un ítem → lo marca leído y abre el detalle.
  - Por ítem: leída/no leída y eliminar.
  - Selección múltiple: marcar leídas o no leídas, eliminar.
  - "Marcar todas como leídas" y "Eliminar todas" (esta con diálogo de confirmación).
  - La lista se recarga cuando llegan notificaciones nuevas.

## 3. Reportes: métricas del profesor + pipeline

- **`lib/reports.ts`:**
  - `contactedRequests`: solicitudes cuyo historial incluye CONTACTED o CONFIRMED.
  - `contactedClients`: emails distintos, normalizados (trim + minúsculas), entre esas solicitudes.
  - `contactedConversion`: efectivas / contactadas.
  - `topPlan`: el plan con más efectivas.
  - `perPlan` se ordena por ventas.
  - `getPipelineCards(filters)`: hasta 500 tarjetas con los mismos filtros del reporte.
- **`app/admin/reportes/page.tsx`**, en este orden:
  1. Filtros.
  2. Tarjetas: Solicitudes · Clientes contactados · Solicitudes efectivas · Efectividad · Plan más vendido.
  3. **Pipeline.**
  4. **Planes vendidos** (ranking; barro = solicitudes, mar = vendidas, la misma paleta validada).
  5. **Detalle**: personas, ingreso, primera respuesta, solicitudes por semana o mes, por estado, ocupación y tabla por plan.
- **`components/admin/pipeline/PipelineBoard.tsx`** (`@dnd-kit/core`):
  - Columnas: Sin contactar · Contactados · Confirmados · Completados · Perdidas (REJECTED/CANCELLED/EXPIRED, con badge). Máximo 50 tarjetas por columna, con enlace a Solicitudes para ver el resto.
  - `targetFor(card, column)` decide si se puede soltar:
    - Usa `allowedTransitions(status, "ADMIN")`.
    - Completados solo se permite si el viaje ya empezó.
    - En Perdidas aplica el único cierre permitido: REJECTED desde Pendiente/Contactada/Vencida, CANCELLED desde Confirmada.
    - Al arrastrar solo se resaltan las columnas permitidas; las bloqueadas son droppables deshabilitados.
  - **Colisión:** con mouse o táctil, `pointerWithin` (solo cuenta la columna bajo el puntero); con teclado, `rectIntersection`. *Bug corregido:* el fallback a intersección con puntero abría el diálogo de la columna vecina al soltar sobre una columna bloqueada.
  - Al soltar se abre `TransitionDialog`. Si sale bien, la tarjeta se mueve de forma optimista (override local) y se hace `router.refresh()`. Si da 409, la tarjeta queda donde estaba y se muestra un toast de error.
  - Refresco automático cada 20 s, en pausa mientras se arrastra o el diálogo está abierto.
  - Sensores de puntero (umbral de 6 px), táctil (200 ms) y teclado. El `id` de `DndContext` es estable para evitar desajustes de hidratación.
  - La tarjeta muestra id, nombre (enlace al detalle), plan, fechas, personas y `HoldBadge`.

## Documentación
- `lib/manual-content.ts`:
  - **Solicitudes**: transiciones nuevas y "Anular reserva".
  - **Reportes**: métricas y pipeline.
  - Nueva sección **Notificaciones**.
- `specs/estados-correos-reportes.md`: tabla de transiciones actualizada.

## Verificación (local, 2026-10-10)

`tsc`, `lint` y `build` en verde. Las pruebas se hicieron sobre `next start -p 3001`, porque el `next dev` del puerto 3000 tenía cargado el cliente de Prisma anterior a la migración (requiere reinicio).

- **Cancelado:** PATCH CANCELLED sobre una Pendiente → 409 ("No se puede pasar de Pendiente a Cancelado").
- **Notificaciones (API):**
  - Al crear una solicitud se genera REQUEST_CREATED; al cancelar el cliente, REQUEST_CANCELLED.
  - Con `holdExpiresAt` = ahora + 10 h: un solo HOLD_EXPIRING aunque haya dos polls concurrentes.
  - Con `holdExpiresAt` en el pasado: la solicitud pasa a EXPIRED y se genera una sola REQUEST_EXPIRED.
  - Marcar leídas/no leídas por ids, por id y todas; eliminar por id. Un id inexistente da 404; una selección vacía, 400; un cliente que llama a la API, 403.
  - Fan-out con dos admins: una fila por admin.
- **Navegador (playwright-cli):**
  - Con el admin en `/admin`, una solicitud nueva hace aparecer el toast en ≤15 s, el badge en 1 y el dashboard se refresca.
  - Clic en el toast → `/admin/solicitudes/19`, marcada como leída.
  - El apartado de notificaciones muestra tipos, estado leído y acciones.
- **Pipeline:**
  - Sin contactar → Contactados: diálogo "Marcar contactado", queda CONTACTED.
  - Sin contactar → Completados: bloqueado, no abre diálogo.
  - Sin contactar → Perdidas: "Rechazar" exige motivo y queda REJECTED con la nota.
  - Vencida → Confirmados con la fecha apartada por otra solicitud: toast de error 409 y la tarjeta sigue en Perdidas.
- **Métricas:** coinciden con SQL (12 solicitudes, 2 clientes contactados / 5 solicitudes contactadas, 3 efectivas).

## Pendiente
- **Railway:** aplicar también la migración `20261010155632_notificaciones_admin`.
- **Opcional:** limpieza periódica de notificaciones antiguas, y SSE en lugar de polling si el número de admins crece.
