"use client";

import * as React from "react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange, DayButton } from "react-day-picker";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toDayKey } from "@/lib/date-range";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useSession } from "@/components/session-provider";
import type { AvailabilityMode, BookingMode } from "@/types/Planes";

interface ReservationFormProps {
  planId: number;
  planTitle: string;
  type: string;
  price: number;
  availabilityMode: AvailabilityMode;
  capacity: number | null;
  bookingMode: BookingMode;
  bookingsOpen: boolean;
  unavailableDates?: string[];
  tentativeDates?: string[];
  remainingByDay?: Record<string, number> | null;
}

// Cupos por día para el DayButton (definido fuera del render para no remontarlo).
const DayInfoContext = React.createContext<{
  remainingByDay: Record<string, number> | null;
  capacity: number | null;
  unavailable: Set<string>;
}>({ remainingByDay: null, capacity: null, unavailable: new Set() });

/** "Pocos cupos": 25 % del aforo o menos. */
function isLow(remaining: number, capacity: number | null) {
  return capacity ? remaining <= Math.max(1, Math.floor(capacity * 0.25)) : false;
}

function AvailabilityDayButton(props: React.ComponentProps<typeof DayButton>) {
  const { remainingByDay, capacity, unavailable } = React.useContext(DayInfoContext);
  const key = toDayKey(props.day.date);
  const remaining = remainingByDay?.[key];
  const showCount =
    remaining !== undefined &&
    !unavailable.has(key) &&
    !props.modifiers.outside &&
    !props.modifiers.disabled;
  return (
    <CalendarDayButton {...props}>
      {props.children}
      {showCount && (
        <span
          className={cn(
            "!text-[10px] font-semibold !opacity-100",
            isLow(remaining, capacity) ? "text-brasa" : "text-mar",
            "group-data-[selected=true]/day:text-current",
          )}
        >
          {remaining}
        </span>
      )}
    </CalendarDayButton>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

export function ReservationForm({
  planId,
  bookingMode,
  bookingsOpen,
  availabilityMode,
  capacity,
  unavailableDates = [],
  tentativeDates = [],
  remainingByDay = null,
}: ReservationFormProps) {
  const { user } = useSession();
  const isRange = bookingMode === "DATE_RANGE";
  const isCapacity = availabilityMode === "CAPACITY";
  const unavailable = React.useMemo(
    () => new Set(unavailableDates),
    [unavailableDates],
  );
  const tentative = React.useMemo(() => new Set(tentativeDates), [tentativeDates]);
  const dayInfo = React.useMemo(
    () => ({ remainingByDay, capacity, unavailable }),
    [remainingByDay, capacity, unavailable],
  );

  const [date, setDate] = React.useState<Date | undefined>();
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [guests, setGuests] = React.useState<number>(1);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const calendarRef = React.useRef<HTMLDivElement>(null);

  // Un día no se puede elegir si es pasado, está bloqueado, o (en aforo) no
  // tiene cupo para el número de personas seleccionado.
  const isDayDisabled = React.useCallback(
    (d: Date) => {
      if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
      const key = toDayKey(d);
      if (unavailable.has(key)) return true;
      if (remainingByDay && key in remainingByDay && remainingByDay[key] < guests) {
        return true;
      }
      return false;
    },
    [unavailable, remainingByDay, guests],
  );

  // Prefill si el usuario tiene sesión (sin pisar lo que ya haya escrito).
  React.useEffect(() => {
    if (user) {
      setName((n) => n || user.name || "");
      setEmail((e) => e || user.email || "");
    }
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasDate = isRange ? !!(range?.from && range?.to) : !!date;

  // Cupo mínimo en los días elegidos (solo aforo): limita el número de personas.
  const selectedDays = React.useMemo(() => {
    if (isRange) {
      if (!range?.from || !range?.to) return [];
      const keys: string[] = [];
      for (let d = range.from; d <= range.to; d = addDays(d, 1)) keys.push(toDayKey(d));
      return keys;
    }
    return date ? [toDayKey(date)] : [];
  }, [isRange, range, date]);
  const minRemaining =
    remainingByDay && selectedDays.length > 0
      ? Math.min(...selectedDays.map((k) => remainingByDay[k] ?? 0))
      : null;

  const maxGuests = Math.min(isCapacity && capacity ? capacity : 20, minRemaining ?? Infinity);
  const incrementGuests = () => setGuests((p) => Math.min(p + 1, Math.max(maxGuests, 1)));
  const decrementGuests = () => setGuests((p) => Math.max(p - 1, 1));

  const dateLabel = isRange
    ? range?.from && range?.to
      ? `${format(range.from, "d MMM", { locale: es })} — ${format(range.to, "d MMM", { locale: es })}`
      : "Selecciona el rango"
    : date
      ? format(date, "PPP", { locale: es })
      : "Selecciona un día";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hasDate) {
      setError(isRange ? "Selecciona el rango de fechas" : "Selecciona una fecha de viaje");
      return;
    }
    setLoading(true);
    try {
      // endDate es EXCLUSIVO: el día siguiente al último día seleccionado.
      const travelDate = (isRange ? range!.from! : date!).toISOString();
      const endDate = isRange ? addDays(range!.to!, 1).toISOString() : undefined;

      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          name,
          email,
          phone,
          travelDate,
          endDate,
          guests,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar la solicitud");
        toast.error(data.error ?? "No se pudo enviar la solicitud");
        return;
      }
      setSuccess(true);
      toast.success("¡Solicitud enviada!", {
        description: "Te enviamos un correo con el resumen.",
      });
    } catch {
      setError("Error de conexión");
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-auto rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600 dark:text-green-400" />
        <h3 className="font-display text-xl font-semibold text-foreground">
          ¡Solicitud enviada!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu cupo queda apartado por 72 horas mientras lo confirmamos. Te enviamos un
          correo con el resumen y te avisaremos de cada cambio.
        </p>
        {user && (
          <a href="/cuenta" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Ver mis solicitudes
          </a>
        )}
      </div>
    );
  }

  if (!bookingsOpen) {
    return (
      <div className="mt-auto rounded-2xl border border-border bg-muted/40 p-6 text-center">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Reservas cerradas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Este plan no está aceptando reservas por ahora. Escríbenos y te avisamos
          cuando se abra de nuevo.
        </p>
      </div>
    );
  }

  const field =
    "w-full h-12 rounded-xl border border-border bg-surface px-4 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
  const overCapacity = minRemaining !== null && guests > minRemaining;
  const isFormValid =
    hasDate && !!name && !!email && !!phone && guests >= 1 && !overCapacity;

  const modifiers = {
    unavailable: (d: Date) => unavailable.has(toDayKey(d)) && !tentative.has(toDayKey(d)),
    tentative: (d: Date) => tentative.has(toDayKey(d)),
  };
  const modifiersClassNames = {
    unavailable: "line-through opacity-40",
    tentative: "[&_button]:!opacity-100 [&_button]:text-sol [&_button]:underline [&_button]:decoration-dotted [&_button]:decoration-2 [&_button]:underline-offset-4",
  };
  const calendarClass = cn("p-3", isCapacity && "[--cell-size:--spacing(10)]");

  return (
    <DayInfoContext.Provider value={dayInfo}>
    <form onSubmit={handleSubmit} className="mt-auto space-y-4">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}

      {/* Datos de contacto */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Tu nombre" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Correo</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Teléfono</label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="3001234567" />
        </div>
      </div>

      {/* Fecha */}
      <div className="relative" ref={calendarRef}>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {isRange ? "Fechas de viaje" : "Fecha de viaje"}
        </label>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl border border-border bg-surface px-4 text-left transition-all hover:border-primary/50",
            isCalendarOpen && "border-primary ring-2 ring-primary/20",
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className={cn("text-sm", !hasDate && "text-muted-foreground")}>
              {dateLabel}
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isCalendarOpen && "rotate-180")} />
        </button>
        {isCalendarOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
            <div className="flex justify-center p-2">
              {isRange ? (
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={isDayDisabled}
                  excludeDisabled
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  components={{ DayButton: AvailabilityDayButton }}
                  locale={es}
                  className={calendarClass}
                />
              ) : (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={isDayDisabled}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  components={{ DayButton: AvailabilityDayButton }}
                  locale={es}
                  className={calendarClass}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border px-3 pt-2.5 text-xs text-muted-foreground">
              {isCapacity ? (
                <>
                  <LegendDot className="bg-mar" label="Cupos libres" />
                  <LegendDot className="bg-brasa" label="Últimos cupos" />
                </>
              ) : (
                <LegendDot className="bg-mar" label="Disponible" />
              )}
              <LegendDot className="bg-sol" label="Apartado (puede liberarse)" />
              <span className="inline-flex items-center gap-1.5">
                <span className="line-through">15</span> No disponible
              </span>
            </div>
            {isCapacity && (
              <p className="px-3 pt-1.5 text-xs text-muted-foreground">
                El número bajo cada día son los cupos que quedan. Los días sin cupo para{" "}
                {guests} {guests === 1 ? "persona" : "personas"} se deshabilitan.
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-border p-3">
              <button
                type="button"
                onClick={() => (isRange ? setRange(undefined) : setDate(undefined))}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Borrar
              </button>
              <button type="button" onClick={() => setIsCalendarOpen(false)} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                Listo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personas */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Número de personas</label>
        <div className="flex h-12 items-center justify-between rounded-xl border border-border bg-surface px-4">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <Users className="h-4 w-4 text-primary" />
            {guests} {guests === 1 ? "persona" : "personas"}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={decrementGuests} disabled={guests <= 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-50">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-4 text-center font-medium">{guests}</span>
            <button type="button" onClick={incrementGuests} disabled={guests >= maxGuests} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-50">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        {minRemaining !== null && capacity && (
          <p
            className={cn(
              "mt-1.5 text-xs font-medium",
              overCapacity ? "text-brasa" : isLow(minRemaining, capacity) ? "text-brasa" : "text-mar",
            )}
          >
            {overCapacity
              ? `Solo quedan ${minRemaining} cupos ${selectedDays.length > 1 ? "en tus fechas" : "ese día"}. Reduce el número de personas o elige otra fecha.`
              : selectedDays.length > 1
                ? `Mínimo ${minRemaining} de ${capacity} cupos libres en tus fechas.`
                : `Quedan ${minRemaining} de ${capacity} cupos ese día.`}
          </p>
        )}
      </div>

      {/* Mensaje */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Mensaje (opcional)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="¿Algo que debamos saber?" />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-lg text-lg font-semibold shadow-sm transition-colors",
          isFormValid && !loading
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        {loading ? "Enviando…" : "Solicitar plan"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        * Tu cupo queda apartado 72 h; te confirmamos por correo
      </p>
    </form>
    </DayInfoContext.Provider>
  );
}
