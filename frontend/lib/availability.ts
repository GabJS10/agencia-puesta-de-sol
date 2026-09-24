import type { Prisma, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
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
  /** Solo en CAPACITY: cupos libres por día dentro de la ventana. null en EXCLUSIVE. */
  remainingByDay: Record<string, number> | null;
};

/**
 * Calcula la disponibilidad de un plan para la ventana [from, to) (UTC, medio-abierta),
 * combinando reservas CONFIRMED (respetando rangos y aforo) y blackouts del admin.
 */
export async function getPlanAvailability(
  plan: PlanAvailabilityConfig,
  from: Date,
  to: Date,
  db: Db = prisma,
): Promise<AvailabilityResult> {
  const winFrom = startOfDayUtc(from);
  const winTo = startOfDayUtc(to);
  const isCapacity = plan.availabilityMode === "CAPACITY";
  const capacity = plan.capacity ?? 0;

  // Reservas CONFIRMED que solapan la ventana. endDate null = día único.
  const reservations = await db.planRequest.findMany({
    where: {
      planId: plan.id,
      status: "CONFIRMED",
      travelDate: { lt: winTo },
      OR: [
        { endDate: { gt: winFrom } },
        { endDate: null, travelDate: { gte: winFrom } },
      ],
    },
    select: { travelDate: true, endDate: true, guests: true },
  });

  const blackouts = await db.planBlackout.findMany({
    where: { planId: plan.id, startDate: { lt: winTo }, endDate: { gt: winFrom } },
    select: { startDate: true, endDate: true },
  });

  const blocked = new Set<string>();
  const remaining: Record<string, number> | null = isCapacity ? {} : null;

  const windowDays = eachDayKey(winFrom, winTo);
  if (isCapacity) {
    for (const key of windowDays) remaining![key] = capacity;
  }

  // Reservas abiertas cerradas ("agotado") => toda la ventana bloqueada.
  if (!plan.bookingsOpen) {
    for (const key of windowDays) blocked.add(key);
  }

  for (const b of blackouts) {
    for (const key of eachDayKey(b.startDate, b.endDate)) blocked.add(key);
  }

  for (const r of reservations) {
    for (const key of eachDayKey(r.travelDate, r.endDate)) {
      if (isCapacity) {
        if (key in remaining!) remaining![key] -= r.guests;
      } else {
        blocked.add(key);
      }
    }
  }

  if (isCapacity) {
    for (const key of windowDays) {
      if (remaining![key] <= 0) blocked.add(key);
    }
  }

  return {
    unavailableDays: Array.from(blocked).sort(),
    remainingByDay: remaining,
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
): Promise<AvailabilityCheck> {
  if (!plan.bookingsOpen) {
    return { ok: false, reason: "Este plan no está aceptando reservas por ahora" };
  }
  const winFrom = startOfDayUtc(start);
  const winTo = effectiveEndUtc(start, end);
  const { unavailableDays, remainingByDay } = await getPlanAvailability(
    plan,
    winFrom,
    winTo,
    db,
  );

  const requestedDays = eachDayKey(winFrom, winTo);
  const blocked = new Set(unavailableDays);

  for (const key of requestedDays) {
    if (blocked.has(key)) {
      return {
        ok: false,
        reason:
          plan.availabilityMode === "CAPACITY"
            ? "No hay cupo disponible para esas fechas"
            : "Esa fecha ya no está disponible para este plan",
      };
    }
    if (remainingByDay && remainingByDay[key] < guests) {
      return {
        ok: false,
        reason: `Solo quedan ${remainingByDay[key]} cupos para el ${key}`,
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
} as const;

// Re-export para serializar rangos día a día en el frontend.
export { toDayKey };
