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
  Send,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const SUBJECTS = [
  "Información general",
  "Reservar un plan",
  "Grupos y empresas",
  "Otro",
] as const;

interface ContactFormProps {
  phoneNumber: string;
}

export function ContactForm({ phoneNumber }: ContactFormProps) {
  const [name, setName] = React.useState("");
  const [subject, setSubject] = React.useState<string>(SUBJECTS[0]);
  const [guests, setGuests] = React.useState<number>(1);
  const [date, setDate] = React.useState<Date | undefined>();
  const [message, setMessage] = React.useState("");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isValid = name.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const parts = [
      `Hola, vengo de la página web 🌅. Soy *${name.trim()}*.`,
      `Asunto: *${subject}*.`,
    ];
    if (subject === "Reservar un plan" || guests > 1) {
      parts.push(`Somos *${guests}* ${guests === 1 ? "persona" : "personas"}.`);
    }
    if (date) {
      parts.push(`Fecha tentativa: *${format(date, "PPP", { locale: es })}*.`);
    }
    parts.push(`Mensaje: ${message.trim()}`);

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const url = `https://wa.me/+57${cleanPhone}?text=${encodeURIComponent(parts.join(" "))}`;
    window.open(url, "_blank");
  };

  const fieldLabel = "mb-2 block text-sm font-medium text-foreground";
  const fieldBase =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground/60 hover:border-sol/50 focus:border-sol focus:outline-none focus:ring-2 focus:ring-sol/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className={fieldLabel}>
          Nombre
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Cómo te llamas?"
          className={fieldBase}
          required
        />
      </div>

      {/* Asunto */}
      <div>
        <label htmlFor="subject" className={fieldLabel}>
          Asunto
        </label>
        <div className="relative">
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={cn(fieldBase, "appearance-none pr-10")}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Personas + Fecha */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Personas */}
        <div>
          <label className={fieldLabel}>Personas</label>
          <div className="flex h-[50px] items-center justify-between rounded-xl border border-border bg-surface px-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-sol" />
              <span className="text-sm font-medium text-foreground">
                {guests}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests((n) => Math.max(1, n - 1))}
                disabled={guests <= 1}
                aria-label="Menos personas"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setGuests((n) => Math.min(20, n + 1))}
                disabled={guests >= 20}
                aria-label="Más personas"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="relative" ref={calendarRef}>
          <label className={fieldLabel}>Fecha tentativa</label>
          <button
            type="button"
            onClick={() => setIsCalendarOpen((o) => !o)}
            className={cn(
              fieldBase,
              "flex h-[50px] items-center justify-between text-left",
              !date && "text-muted-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-sol" />
              <span className="text-sm">
                {date ? format(date, "PPP", { locale: es }) : "Opcional"}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isCalendarOpen && "rotate-180",
              )}
            />
          </button>
          {isCalendarOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
              <div className="flex justify-center p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  locale={es}
                  className="p-2"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-border p-3">
                <button
                  type="button"
                  onClick={() => setDate(undefined)}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className={fieldLabel}>
          Mensaje
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Cuéntanos qué aventura tienes en mente…"
          className={cn(fieldBase, "resize-none")}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold shadow-sm transition-colors",
          isValid
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        <Send className="h-4 w-4" />
        Enviar por WhatsApp
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Se abrirá WhatsApp con tu mensaje listo para enviar.
      </p>
    </form>
  );
}
