import { prisma } from "@/lib/db";
import { startOfDayUtc, toDayKey } from "@/lib/date-range";

/**
 * Días no disponibles para un plan: fechas (de hoy en adelante) con una
 * solicitud CONFIRMED. La reserva es exclusiva por día.
 * Devuelve claves "yyyy-MM-dd" (UTC) sin duplicados.
 */
export async function getUnavailableDates(planId: number): Promise<string[]> {
  const rows = await prisma.planRequest.findMany({
    where: {
      planId,
      status: "CONFIRMED",
      travelDate: { gte: startOfDayUtc(new Date()) },
    },
    select: { travelDate: true },
  });

  return Array.from(new Set(rows.map((r) => toDayKey(r.travelDate))));
}
