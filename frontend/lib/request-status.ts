// Reglas de los estados de una solicitud. Sin dependencias de servidor: lo usan
// tanto las rutas API como los componentes cliente (botones de acción, badges).
import type { EventActor, RequestStatus } from "@prisma/client";

export type { EventActor, RequestStatus };

/** Horas que una solicitud Pendiente/Contactada aparta cupo antes de vencer. */
export const HOLD_HOURS = 72;

/** Estados que apartan cupo mientras `holdExpiresAt` no haya pasado. */
export const HOLDING_STATUSES: RequestStatus[] = ["PENDING", "CONTACTED"];

export const STATUS_ORDER: RequestStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];

export const STATUS_META: Record<
  RequestStatus,
  { label: string; plural: string; className: string; description: string }
> = {
  PENDING: {
    label: "Pendiente",
    plural: "Pendientes",
    className: "bg-sol/15 text-sol",
    description: "Recibimos tu solicitud y tu cupo está apartado mientras la revisamos.",
  },
  CONTACTED: {
    label: "Contactado",
    plural: "Contactadas",
    className: "bg-mar/15 text-mar",
    description: "Ya estamos en contacto contigo para concretar los detalles.",
  },
  CONFIRMED: {
    label: "Confirmado",
    plural: "Confirmadas",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
    description: "Tu reserva está confirmada. ¡Nos vemos en el viaje!",
  },
  COMPLETED: {
    label: "Completado",
    plural: "Completadas",
    className: "bg-noche/10 text-foreground/80 dark:bg-arena/10",
    description: "Viaje realizado. Gracias por viajar con nosotros.",
  },
  REJECTED: {
    label: "Rechazado",
    plural: "Rechazadas",
    className: "bg-brasa/15 text-brasa",
    description: "No pudimos atender esta solicitud. Revisa el motivo en el historial.",
  },
  CANCELLED: {
    label: "Cancelado",
    plural: "Canceladas",
    className: "bg-brasa/10 text-brasa/80",
    description: "La solicitud fue cancelada y el cupo quedó liberado.",
  },
  EXPIRED: {
    label: "Vencido",
    plural: "Vencidas",
    className: "bg-muted text-muted-foreground",
    description: "El cupo apartado venció sin confirmarse. Puedes volver a solicitar el plan.",
  },
};

export const ACTOR_LABEL: Record<EventActor, string> = {
  CLIENT: "Cliente",
  ADMIN: "Agencia",
  SYSTEM: "Sistema",
};

// Transiciones permitidas por actor. Los estados ausentes como clave son terminales.
const TRANSITIONS: Record<EventActor, Partial<Record<RequestStatus, RequestStatus[]>>> = {
  ADMIN: {
    PENDING: ["CONTACTED", "CONFIRMED", "REJECTED", "CANCELLED"],
    CONTACTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    EXPIRED: ["CONFIRMED", "REJECTED"],
  },
  CLIENT: {
    PENDING: ["CANCELLED"],
    CONTACTED: ["CANCELLED"],
  },
  SYSTEM: {
    PENDING: ["EXPIRED"],
    CONTACTED: ["EXPIRED"],
  },
};

export function allowedTransitions(from: RequestStatus, actor: EventActor): RequestStatus[] {
  return TRANSITIONS[actor][from] ?? [];
}

export function canTransition(
  from: RequestStatus,
  to: RequestStatus,
  actor: EventActor,
): boolean {
  return allowedTransitions(from, actor).includes(to);
}

/** La agencia debe explicar al cliente por qué rechaza o cancela. */
export function noteRequired(to: RequestStatus, actor: EventActor): boolean {
  return actor === "ADMIN" && (to === "REJECTED" || to === "CANCELLED");
}

/** Texto del botón de acción del admin para pasar a `to`. */
export const ACTION_LABEL: Partial<Record<RequestStatus, string>> = {
  CONTACTED: "Marcar contactado",
  CONFIRMED: "Confirmar",
  COMPLETED: "Marcar completado",
  REJECTED: "Rechazar",
  CANCELLED: "Cancelar",
};

/** ¿La solicitud está apartando cupo ahora mismo? */
export function isHolding(
  status: RequestStatus,
  holdExpiresAt: Date | null,
  now: Date = new Date(),
): boolean {
  return HOLDING_STATUSES.includes(status) && !!holdExpiresAt && holdExpiresAt > now;
}

export function holdUntil(from: Date = new Date()): Date {
  return new Date(from.getTime() + HOLD_HOURS * 3600_000);
}
