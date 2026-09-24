import {
  getPlanAvailability,
  type AvailabilityResult,
  type PlanAvailabilityConfig,
} from "@/lib/availability";
import { startOfDayUtc } from "@/lib/date-range";

// Ventana que se ofrece en el calendario del formulario de reserva.
const WINDOW_MONTHS = 12;

/**
 * Disponibilidad de un plan para los próximos `WINDOW_MONTHS` meses, lista para
 * el calendario del frontend: días bloqueados y (en aforo) cupos por día.
 */
export async function getPlanCalendar(
  plan: PlanAvailabilityConfig,
): Promise<AvailabilityResult> {
  const from = startOfDayUtc(new Date());
  const to = new Date(from);
  to.setUTCMonth(to.getUTCMonth() + WINDOW_MONTHS);
  return getPlanAvailability(plan, from, to);
}
