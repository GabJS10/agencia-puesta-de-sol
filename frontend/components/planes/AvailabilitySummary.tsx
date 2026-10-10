import { CalendarCheck, CalendarDays, Users, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { eachDayKey, startOfDayUtc } from "@/lib/date-range";
import { durationText, formatDayKey } from "@/lib/format-dates";
import type { AvailabilityResult } from "@/lib/availability";
import type { AvailabilityMode, BookingMode } from "@/types/Planes";

const HORIZON_DAYS = 30;

/** Condiciones y disponibilidad próxima de un plan, visibles antes de solicitar. */
export function AvailabilitySummary({
  availabilityMode,
  capacity,
  bookingMode,
  bookingsOpen,
  minDays = null,
  maxDays = null,
  availability,
}: {
  availabilityMode: AvailabilityMode;
  capacity: number | null;
  bookingMode: BookingMode;
  bookingsOpen: boolean;
  minDays?: number | null;
  maxDays?: number | null;
  availability: AvailabilityResult;
}) {
  const today = startOfDayUtc(new Date());
  const horizonEnd = new Date(today);
  horizonEnd.setUTCDate(horizonEnd.getUTCDate() + HORIZON_DAYS);
  const blocked = new Set(availability.unavailableDays);
  const remaining = availability.remainingByDay;

  const isFree = (key: string) =>
    !blocked.has(key) && (!remaining || (remaining[key] ?? 0) > 0);
  const freeDays = eachDayKey(today, horizonEnd).filter(isFree).length;
  // Busca en toda la ventana del calendario (12 meses).
  const windowEnd = new Date(today);
  windowEnd.setUTCFullYear(windowEnd.getUTCFullYear() + 1);
  const nextFree = bookingsOpen ? eachDayKey(today, windowEnd).find(isFree) : undefined;

  const items = [
    availabilityMode === "CAPACITY"
      ? { icon: Users, title: `Cupo de ${capacity} personas por día`, text: "Varios grupos comparten la salida hasta llenar el cupo." }
      : { icon: Users, title: "Salida privada", text: "Una sola reserva por fecha: el día es para tu grupo." },
    bookingMode === "DATE_RANGE"
      ? {
          icon: CalendarDays,
          title: `Plan de varios días: ${durationText(minDays ?? 1, maxDays ?? Infinity)}`,
          text: "Eliges fecha de inicio y de regreso.",
        }
      : { icon: CalendarDays, title: "Plan de un día", text: "Eliges una sola fecha de salida." },
    bookingsOpen
      ? { icon: Unlock, title: "Reservas abiertas", text: "Tu solicitud aparta el cupo 72 h mientras la confirmamos." }
      : { icon: Lock, title: "Reservas cerradas", text: "Por ahora no estamos recibiendo solicitudes." },
  ];

  return (
    <div className="mb-5 space-y-3">
      <ul className="space-y-2.5">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-mar" />
            <div className="text-sm">
              <span className="font-semibold text-foreground">{title}.</span>{" "}
              <span className="text-muted-foreground">{text}</span>
            </div>
          </li>
        ))}
      </ul>
      {bookingsOpen && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
            nextFree ? "bg-mar/10 text-foreground" : "bg-brasa/10 text-brasa",
          )}
        >
          <CalendarCheck className={cn("h-4 w-4 shrink-0", nextFree ? "text-mar" : "")} />
          {nextFree ? (
            <span>
              Próxima fecha disponible:{" "}
              <strong>{formatDayKey(nextFree, "EEEE d 'de' MMMM")}</strong>
              {remaining?.[nextFree] !== undefined && ` · ${remaining[nextFree]} cupos`}
              <span className="block text-xs text-muted-foreground">
                {freeDays} de {HORIZON_DAYS} días con disponibilidad en el próximo mes
              </span>
            </span>
          ) : (
            <span>Sin fechas disponibles en los próximos meses.</span>
          )}
        </div>
      )}
    </div>
  );
}
