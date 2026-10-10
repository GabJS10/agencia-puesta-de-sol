import { format } from "date-fns";
import { es } from "date-fns/locale";
import { dayKeyAsLocal, lastDayUtc, utcDayAsLocal } from "@/lib/date-range";

// Formateo de fechas de viaje (guardadas como días UTC) sin desfase por la zona
// horaria del servidor o del navegador.

/** Día de viaje (UTC) con el patrón dado, en español. */
export function formatTravelDay(date: Date, pattern = "PPP"): string {
  return format(utcDayAsLocal(date), pattern, { locale: es });
}

/** Clave "yyyy-MM-dd" legible ("14 oct 2026" con el patrón por defecto). */
export function formatDayKey(key: string, pattern = "d MMM yyyy"): string {
  return format(dayKeyAsLocal(key), pattern, { locale: es });
}

/** "14 oct 2026" o "14 oct – 17 oct 2026" para un rango [travelDate, endDate). */
export function formatTravelRange(travelDate: Date, endDate?: Date | null): string {
  const last = lastDayUtc(travelDate, endDate);
  if (last.getTime() === travelDate.getTime()) return formatTravelDay(travelDate, "d MMM yyyy");
  return `${formatTravelDay(travelDate, "d MMM")} – ${formatTravelDay(last, "d MMM yyyy")}`;
}

/** Fecha y hora (instante) en la zona de Colombia, para eventos y vencimientos. */
export function formatInstant(date: Date, pattern = "d MMM yyyy, h:mm a"): string {
  // Colombia no tiene horario de verano: UTC-5 fijo.
  const bogota = new Date(date.getTime() - 5 * 3600_000);
  return format(utcDayAsLocalWithTime(bogota), pattern, { locale: es });
}

function utcDayAsLocalWithTime(d: Date): Date {
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  );
}

/** Tiempo restante legible hasta `until` ("23 h", "2 d 4 h", "<1 h"). */
export function formatRemaining(until: Date, now: Date = new Date()): string {
  const hours = Math.floor((until.getTime() - now.getTime()) / 3600_000);
  if (hours < 1) return "<1 h";
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return rest ? `${days} d ${rest} h` : `${days} d`;
}

/** Horas que faltan hasta `until` (negativo si ya pasó). */
export function hoursUntil(until: Date, now: Date = new Date()): number {
  return (until.getTime() - now.getTime()) / 3600_000;
}
