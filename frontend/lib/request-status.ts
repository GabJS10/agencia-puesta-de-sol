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
    className: "bg-[#fde6bf] text-[#6b3d00] dark:bg-sol/20 dark:text-sol",
    description: "Recibimos tu solicitud y tu cupo está apartado mientras la revisamos.",
  },
  CONTACTED: {
    label: "Contactado",
    plural: "Contactadas",
    className: "bg-[#d7efec] text-[#0b5e55] dark:bg-mar/20 dark:text-[#5fd3c5]",
    description: "Ya estamos en contacto contigo para concretar los detalles.",
  },
  CONFIRMED: {
    label: "Confirmado",
    plural: "Confirmadas",
    className: "bg-[#0f7a6f] text-white",
    description: "Tu reserva está confirmada. ¡Nos vemos en el viaje!",
  },
  COMPLETED: {
    label: "Completado",
    plural: "Completadas",
    className: "bg-[#2a2018] text-[#f4ead6] dark:bg-arena dark:text-[#2a2018]",
    description: "Viaje realizado. Gracias por viajar con nosotros.",
  },
  REJECTED: {
    label: "Rechazado",
    plural: "Rechazadas",
    className: "bg-[#f8d7dd] text-[#9c1f38] dark:bg-brasa/20 dark:text-[#f08a9c]",
    description: "No pudimos atender esta solicitud. Revisa el motivo en el historial.",
  },
  CANCELLED: {
    label: "Cancelado",
    plural: "Canceladas",
    className: "bg-[#e9d9bc] text-[#5e5040] dark:bg-white/10 dark:text-[#cdbfa6]",
    description: "La solicitud fue cancelada y el cupo quedó liberado.",
  },
  EXPIRED: {
    label: "Vencido",
    plural: "Vencidas",
    className: "bg-[#f3dccf] text-[#8a4326] dark:bg-barro/20 dark:text-[#e69a76]",
    description: "El cupo apartado venció sin confirmarse. Puedes volver a solicitar el plan.",
  },
};

/** Color sólido de cada estado para gráficos (distintos también en luminosidad). */
export const STATUS_CHART_COLOR: Record<RequestStatus, string> = {
  PENDING: "#f5a538",
  CONTACTED: "#7fcfc5",
  CONFIRMED: "#0f7a6f",
  COMPLETED: "#7a6a55",
  REJECTED: "#d6455f",
  CANCELLED: "#c9b998",
  EXPIRED: "#b85c38",
};

export const ACTOR_LABEL: Record<EventActor, string> = {
  CLIENT: "Cliente",
  ADMIN: "Agencia",
  SYSTEM: "Sistema",
};

// Transiciones permitidas por actor. Los estados ausentes como clave son terminales.
const TRANSITIONS: Record<EventActor, Partial<Record<RequestStatus, RequestStatus[]>>> = {
  // Pendientes/contactadas se cierran con "Rechazar"; "Cancelar" queda para
  // anular una reserva ya confirmada (el cliente cancela las suyas en /cuenta).
  ADMIN: {
    PENDING: ["CONTACTED", "CONFIRMED", "REJECTED"],
    CONTACTED: ["CONFIRMED", "REJECTED"],
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
  CANCELLED: "Anular reserva",
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
