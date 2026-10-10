// Flujo de estados de las solicitudes: toda transición pasa por aquí para
// validar reglas, re-chequear cupo bajo lock y dejar el evento en el historial.
import "server-only";
import { after } from "next/server";
import type { EventActor, Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { availabilitySelect, checkRangeAvailable, withPlanLock } from "@/lib/availability";
import { startOfDayUtc } from "@/lib/date-range";
import {
  HOLDING_STATUSES,
  STATUS_META,
  canTransition,
  holdUntil,
  noteRequired,
} from "@/lib/request-status";
import { notifyStatusEvents } from "@/lib/notifications";
import { notifyAdmins } from "@/lib/admin-notifications";

type Db = typeof prisma | Prisma.TransactionClient;

export type TransitionResult =
  | { ok: true; eventId: number }
  | { ok: false; status: number; error: string };

const fail = (status: number, error: string): TransitionResult => ({ ok: false, status, error });

/**
 * Cambia el estado de una solicitud. `ownerId` restringe a solicitudes de ese
 * usuario (cancelación del cliente). No envía correos: el llamador decide.
 */
export async function transitionRequest({
  id,
  to,
  note,
  actor,
  actorId = null,
  ownerId,
}: {
  id: number;
  to: RequestStatus;
  note?: string | null;
  actor: EventActor;
  actorId?: number | null;
  ownerId?: number;
}): Promise<TransitionResult> {
  const cleanNote = note?.trim() || null;

  const current = await prisma.planRequest.findUnique({
    where: { id },
    select: {
      status: true,
      planId: true,
      userId: true,
      travelDate: true,
      endDate: true,
      guests: true,
    },
  });
  if (!current || (ownerId !== undefined && current.userId !== ownerId)) {
    return fail(404, "Solicitud no encontrada");
  }
  if (!canTransition(current.status, to, actor)) {
    return fail(
      409,
      `No se puede pasar de ${STATUS_META[current.status].label} a ${STATUS_META[to].label}`,
    );
  }
  if (noteRequired(to, actor) && !cleanNote) {
    return fail(400, "Escribe el motivo para el cliente");
  }
  if (to === "COMPLETED" && startOfDayUtc(current.travelDate) > startOfDayUtc(new Date())) {
    return fail(409, "Solo se puede marcar como completado un viaje que ya empezó");
  }

  const apply = async (tx: Prisma.TransactionClient): Promise<TransitionResult> => {
    // Contactar renueva el apartado; Vencido conserva la fecha en que venció;
    // el resto deja de apartar cupo.
    const holdExpiresAt =
      to === "CONTACTED" ? { holdExpiresAt: holdUntil() }
      : to === "EXPIRED" ? {}
      : { holdExpiresAt: null };

    // Update optimista: si otro proceso cambió el estado, no pisamos su cambio.
    const updated = await tx.planRequest.updateMany({
      where: { id, status: current.status },
      data: { status: to, ...holdExpiresAt },
    });
    if (updated.count === 0) {
      return fail(409, "La solicitud cambió mientras tanto; recarga la página");
    }
    const event = await tx.planRequestEvent.create({
      data: {
        requestId: id,
        fromStatus: current.status,
        toStatus: to,
        note: cleanNote,
        actor,
        actorId,
      },
    });
    return { ok: true, eventId: event.id };
  };

  // Confirmar ocupa cupo: re-valida bajo el lock del plan, sin contar el
  // apartado de la propia solicitud. Las reservas pausadas no impiden confirmar
  // solicitudes ya recibidas (bookingsOpen solo frena solicitudes nuevas).
  if (to === "CONFIRMED" && current.planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: current.planId },
      select: availabilitySelect,
    });
    if (plan) {
      return withPlanLock(plan.id, async (tx) => {
        const check = await checkRangeAvailable(
          { ...plan, bookingsOpen: true },
          current.travelDate,
          current.endDate,
          current.guests,
          tx,
          id,
        );
        if (!check.ok) return fail(409, check.reason);
        return apply(tx);
      });
    }
  }

  return prisma.$transaction(apply);
}

/** Crea una solicitud nueva (Pendiente) con su evento de creación. */
export async function createPlanRequest(
  db: Db,
  data: Omit<Prisma.PlanRequestUncheckedCreateInput, "status" | "holdExpiresAt" | "events">,
) {
  return db.planRequest.create({
    data: {
      ...data,
      status: "PENDING",
      // Sin plan no hay cupo que apartar.
      holdExpiresAt: data.planId ? holdUntil() : null,
      events: {
        create: { toStatus: "PENDING", actor: "CLIENT", actorId: data.userId ?? null },
      },
    },
  });
}

/**
 * Marca como Vencidas las solicitudes cuyo apartado ya pasó y agenda el correo
 * al cliente. La disponibilidad ya ignora apartados vencidos, así que esto solo
 * pone al día el estado; se llama al cargar las vistas de solicitudes.
 */
export async function expireStaleRequests(): Promise<void> {
  const stale = await prisma.planRequest.findMany({
    where: { status: { in: HOLDING_STATUSES }, holdExpiresAt: { lt: new Date() } },
    select: { id: true },
  });
  if (stale.length === 0) return;

  const eventIds: number[] = [];
  for (const { id } of stale) {
    const res = await transitionRequest({ id, to: "EXPIRED", actor: "SYSTEM" });
    if (res.ok) {
      eventIds.push(res.eventId);
      await notifyAdmins("REQUEST_EXPIRED", id);
    }
  }
  if (eventIds.length > 0) after(() => notifyStatusEvents(eventIds));
}
