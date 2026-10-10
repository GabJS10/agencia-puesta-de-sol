// Metadatos de las notificaciones de admin (sin dependencias de servidor).
import type { NotificationType } from "@prisma/client";

export type { NotificationType };

export const NOTIFICATION_META: Record<
  NotificationType,
  { label: string; className: string }
> = {
  REQUEST_CREATED: { label: "Nueva solicitud", className: "bg-mar/15 text-mar" },
  REQUEST_CANCELLED: { label: "Cancelada por el cliente", className: "bg-brasa/15 text-brasa" },
  REQUEST_EXPIRED: { label: "Apartado vencido", className: "bg-muted text-muted-foreground" },
  HOLD_EXPIRING: { label: "Apartado por vencer", className: "bg-sol/15 text-sol" },
};

/** Forma serializada que viaja al cliente. */
export type AdminNotification = {
  id: number;
  type: NotificationType;
  requestId: number | null;
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO
};
