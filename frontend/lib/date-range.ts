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

/** Día siguiente (00:00 UTC) al día de `date`. */
export function nextDayUtc(date: Date): Date {
  return dayRangeUtc(date).lt;
}

/**
 * Claves "yyyy-MM-dd" (UTC) de cada día del rango medio-abierto [start, end).
 * Si `end` es null/indefinido, cubre un único día (el de `start`).
 */
export function eachDayKey(start: Date, end?: Date | null): string[] {
  const from = startOfDayUtc(start);
  const to = end ? startOfDayUtc(end) : nextDayUtc(start);
  const keys: string[] = [];
  for (let d = new Date(from); d < to; d.setUTCDate(d.getUTCDate() + 1)) {
    keys.push(toDayKey(d));
  }
  return keys;
}

/** Fin exclusivo efectivo de una reserva: `endDate` o `travelDate`+1 día. */
export function effectiveEndUtc(start: Date, end?: Date | null): Date {
  return end ? startOfDayUtc(end) : nextDayUtc(start);
}

/** Fecha local con el mismo día calendario que el día UTC de `date` (para formatear sin desfase de zona). */
export function utcDayAsLocal(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Fecha local para una clave "yyyy-MM-dd". */
export function dayKeyAsLocal(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Último día (inclusive) de una reserva: endDate es exclusivo; null = día único. */
export function lastDayUtc(start: Date, end?: Date | null): Date {
  if (!end) return startOfDayUtc(start);
  const last = startOfDayUtc(end);
  last.setUTCDate(last.getUTCDate() - 1);
  return last;
}
