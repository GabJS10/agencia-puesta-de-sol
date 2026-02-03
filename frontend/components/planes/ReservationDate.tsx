"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

export function ReservationDate() {
  const [date, setDate] = React.useState<Date | undefined>();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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

  const handleConfirm = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setDate(undefined);
  };

  return (
    <div className="relative mb-6" ref={containerRef}>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Fecha de viaje
      </label>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between text-left font-normal h-14 rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm",
          isOpen && "border-primary ring-2 ring-primary/20",
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
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Calendar Popover/Card */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 z-50 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          {/* Header of the Card */}

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

          {/* Footer Actions */}
          <div className="p-4 border-t border-border flex items-center justify-end gap-3">
            <button
              onClick={() => {
                handleClear();
                // Optional: Keep open or close? Usually keep open if they just cleared to let them pick again.
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Borrar
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
