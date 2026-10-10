import type { Prisma, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HOLDING_STATUSES } from "@/lib/request-status";
import { formatDayKey } from "@/lib/format-dates";
import {
  eachDayKey,
  effectiveEndUtc,
  startOfDayUtc,
  toDayKey,
} from "@/lib/date-range";

// Acepta el cliente global o uno transaccional (para chequeos bajo lock).
type Db = typeof prisma | Prisma.TransactionClient;

export type PlanAvailabilityConfig = Pick<
  Plan,
  "id" | "availabilityMode" | "capacity" | "bookingsOpen"
>;

export type AvailabilityResult = {
  /** Días completamente bloqueados (cerrado, blackout, exclusivo tomado o aforo lleno). */
  unavailableDays: string[];
  /** Días bloqueados solo por solicitudes en proceso (apartados): podrían liberarse. */
  tentativeDays: string[];
  /** Solo en CAPACITY: cupos libres por día dentro de la ventana. null en EXCLUSIVE. */
  remainingByDay: Record<string, number> | null;
  /** Aforo por día (CAPACITY) o null (EXCLUSIVE). */
  capacity: number | null;
};

/**
 * Calcula la disponibilidad de un plan para la ventana [from, to) (UTC, medio-abierta),
 * combinando reservas CONFIRMED, apartados vigentes de solicitudes en proceso
 * (PENDING/CONTACTED con holdExpiresAt futuro) y blackouts del admin.
 * `excludeRequestId` ignora una solicitud (para re-validar la propia al confirmarla).
 */
export async function getPlanAvailability(
  plan: PlanAvailabilityConfig,
  from: Date,
  to: Date,
  db: Db = prisma,
  excludeRequestId?: number,
): Promise<AvailabilityResult> {
  const winFrom = startOfDayUtc(from);
  const winTo = startOfDayUtc(to);
  const isCapacity = plan.availabilityMode === "CAPACITY";
  const capacity = plan.capacity ?? 0;
  const now = new Date();

  // Reservas que ocupan y solapan la ventana. endDate null = día único.
  const reservations = await db.planRequest.findMany({
    where: {
      planId: plan.id,
      ...(excludeRequestId ? { id: { not: excludeRequestId } } : {}),
      travelDate: { lt: winTo },
      AND: [
        {
          OR: [
            { endDate: { gt: winFrom } },
            { endDate: null, travelDate: { gte: winFrom } },
          ],
        },
        {
          OR: [
            { status: "CONFIRMED" },
            { status: { in: HOLDING_STATUSES }, holdExpiresAt: { gt: now } },
          ],
        },
      ],
    },
    select: { travelDate: true, endDate: true, guests: true, status: true },
  });

  const blackouts = await db.planBlackout.findMany({
    where: { planId: plan.id, startDate: { lt: winTo }, endDate: { gt: winFrom } },
    select: { startDate: true, endDate: true },
  });

  const blocked = new Set<string>();
  const remaining: Record<string, number> | null = isCapacity ? {} : null;
  // Lo mismo, contando solo reservas confirmadas: distingue bloqueos "en firme"
  // de los que dependen de apartados que pueden vencer o rechazarse.
  const firmBlocked = new Set<string>();
  const firmRemaining: Record<string, number> = {};

  const windowDays = eachDayKey(winFrom, winTo);
  if (isCapacity) {
    for (const key of windowDays) {
      remaining![key] = capacity;
      firmRemaining[key] = capacity;
    }
  }

  // Reservas abiertas cerradas ("agotado") => toda la ventana bloqueada.
  if (!plan.bookingsOpen) {
    for (const key of windowDays) blocked.add(key);
  }

  for (const b of blackouts) {
    for (const key of eachDayKey(b.startDate, b.endDate)) blocked.add(key);
  }
  for (const key of blocked) firmBlocked.add(key);

  for (const r of reservations) {
    const firm = r.status === "CONFIRMED";
    for (const key of eachDayKey(r.travelDate, r.endDate)) {
      if (isCapacity) {
        if (key in remaining!) remaining![key] -= r.guests;
        if (firm && key in firmRemaining) firmRemaining[key] -= r.guests;
      } else {
        blocked.add(key);
        if (firm) firmBlocked.add(key);
      }
    }
  }

  if (isCapacity) {
    for (const key of windowDays) {
      if (remaining![key] <= 0) blocked.add(key);
      if (firmRemaining[key] <= 0) firmBlocked.add(key);
    }
  }

  const tentativeDays = Array.from(blocked)
    .filter((key) => !firmBlocked.has(key))
    .sort();

  return {
    unavailableDays: Array.from(blocked).sort(),
    tentativeDays,
    remainingByDay: remaining,
    capacity: isCapacity ? capacity : null,
  };
}

export type AvailabilityCheck = { ok: true } | { ok: false; reason: string };

/**
 * Verifica que el rango [start, end) admita `guests` personas todos los días.
 * Pensado para correr DENTRO de la transacción con advisory lock (ver withPlanLock).
 */
export async function checkRangeAvailable(
  plan: PlanAvailabilityConfig,
  start: Date,
  end: Date | null,
  guests: number,
  db: Db,
  excludeRequestId?: number,
): Promise<AvailabilityCheck> {
  if (!plan.bookingsOpen) {
    return { ok: false, reason: "Este plan no está aceptando reservas por ahora" };
  }
  const winFrom = startOfDayUtc(start);
  const winTo = effectiveEndUtc(start, end);
  const { unavailableDays, tentativeDays, remainingByDay } = await getPlanAvailability(
    plan,
    winFrom,
    winTo,
    db,
    excludeRequestId,
  );

  const requestedDays = eachDayKey(winFrom, winTo);
  const blocked = new Set(unavailableDays);
  const tentative = new Set(tentativeDays);

  for (const key of requestedDays) {
    if (blocked.has(key)) {
      return {
        ok: false,
        reason: tentative.has(key)
          ? `El ${formatDayKey(key)} está apartado por otra solicitud en proceso; podría liberarse pronto`
          : plan.availabilityMode === "CAPACITY"
            ? "No hay cupo disponible para esas fechas"
            : "Esa fecha ya no está disponible para este plan",
      };
    }
    if (remainingByDay && remainingByDay[key] < guests) {
      return {
        ok: false,
        reason: `Solo quedan ${remainingByDay[key]} cupos para el ${formatDayKey(key)}`,
      };
    }
  }
  return { ok: true };
}

/**
 * Serializa todos los intentos de reserva del mismo plan con un advisory lock
 * de Postgres tomado dentro de la transacción (se libera al terminar). Esto
 * cierra la ventana de carrera del "consultar y luego escribir".
 */
export async function withPlanLock<T>(
  planId: number,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`plan:${planId}`}))`;
    return fn(tx);
  });
}

/** Config mínima de disponibilidad de un plan, para pasar a los helpers. */
export const availabilitySelect = {
  id: true,
  availabilityMode: true,
  capacity: true,
  bookingsOpen: true,
  bookingMode: true,
  minDays: true,
  maxDays: true,
} as const;

// Re-export para serializar rangos día a día en el frontend.
export { toDayKey };
