"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
  Minus,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { formatPrice } from "@/helpers/formatPrice";

interface ReservationFormProps {
  planTitle: string;
  phoneNumber: string;
  type: string;
  price: number;
}

export function ReservationForm({
  planTitle,
  phoneNumber,
  type,
  price,
}: ReservationFormProps) {
  // State
  const [date, setDate] = React.useState<Date | undefined>();
  const [guests, setGuests] = React.useState<number>(1);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Refs
  const calendarRef = React.useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const handleConfirmDate = () => {
    setIsCalendarOpen(false);
  };

  const handleClearDate = () => {
    setDate(undefined);
  };

  const incrementGuests = () => {
    setGuests((prev) => Math.min(prev + 1, 20)); // Limit to 20 for now
  };

  const decrementGuests = () => {
    setGuests((prev) => Math.max(prev - 1, 1)); // Minimum 1
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      return;
    }

    const formattedDate = format(date, "PPP", { locale: es });
    const message = `Hola, vengo de su pagina web :), quiero reservar el plan *${planTitle} ${type}* con un valor por persona de *${formatPrice(price)}* para el día *${formattedDate}* para *${guests}* personas.`;

    // Clean phone number (remove +, spaces, dashes)
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    const whatsappUrl = `https://wa.me/+57${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const isFormValid = !!date && guests >= 1;

  return (
    <form onSubmit={handleSubmit} className="mt-auto space-y-6">
      <div className="space-y-4">
        {/* Date Picker */}
        <div className="relative" ref={calendarRef}>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Fecha de viaje
          </label>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={cn(
              "w-full flex items-center justify-between text-left font-normal h-14 rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm",
              isCalendarOpen && "border-primary ring-2 ring-primary/20",
              !date && "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                  date
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-xs uppercase tracking-wider font-semibold",
                    date ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {date ? "Fecha seleccionada" : "Selecciona un día"}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    date ? "text-foreground" : "text-muted-foreground/70",
                  )}
                >
                  {date ? format(date, "PPP", { locale: es }) : "DD/MM/AAAA"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isCalendarOpen && "rotate-180",
              )}
            />
          </button>

          {/* Calendar Popover */}
          {isCalendarOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 z-50 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
              <div className="p-2 flex justify-center bg-popover">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  locale={es}
                  className="p-3 w-full"
                />
              </div>
              <div className="p-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDate}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guests Counter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Número de personas
          </label>
          <div className="flex items-center justify-between h-14 rounded-xl border border-border bg-surface px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                  Pasajeros
                </span>
                <span className="text-sm font-medium text-foreground">
                  {guests} {guests === 1 ? "persona" : "personas"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementGuests}
                disabled={guests <= 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-4 text-center font-medium">{guests}</span>
              <button
                type="button"
                onClick={incrementGuests}
                disabled={guests >= 20}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          type="submit"
          disabled={!isFormValid}
          className={cn(
            "w-full font-semibold h-12 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-sm cursor-pointer",
            isFormValid
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          Reservar Ahora
        </button>

        <p className="text-xs text-center text-muted-foreground mt-2">
          * Precios sujetos a cambios según temporada
        </p>
      </div>
    </form>
  );
}
