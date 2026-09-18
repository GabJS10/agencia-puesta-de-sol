// Utilidades para tratar `travelDate` a nivel de día calendario (UTC).
// La disponibilidad de un plan es exclusiva por día, así que comparamos por día,
// no por instante. Normalizamos a UTC para que el POST y la lectura coincidan.

/** Rango [gte, lt) que cubre el día calendario UTC de `date`. Para consultas Prisma. */
export function dayRangeUtc(date: Date): { gte: Date; lt: Date } {
  const gte = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const lt = new Date(gte);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}

/** Inicio del día (00:00 UTC) de `date`. */
export function startOfDayUtc(date: Date): Date {
  return dayRangeUtc(date).gte;
}

/** Clave "yyyy-MM-dd" (UTC) para serializar un día ocupado. */
export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
