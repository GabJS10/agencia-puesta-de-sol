// Etapas del pipeline de solicitudes (columnas del tablero y agrupación del export).
import type { RequestStatus } from "@/lib/request-status";

export type StageId = "PENDING" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "LOST";

export const PIPELINE_STAGES: {
  id: StageId;
  title: string;
  statuses: RequestStatus[];
  dot: string;
}[] = [
  { id: "PENDING", title: "Sin contactar", statuses: ["PENDING"], dot: "bg-sol" },
  { id: "CONTACTED", title: "Contactados", statuses: ["CONTACTED"], dot: "bg-mar" },
  { id: "CONFIRMED", title: "Confirmados", statuses: ["CONFIRMED"], dot: "bg-green-600" },
  { id: "COMPLETED", title: "Completados", statuses: ["COMPLETED"], dot: "bg-noche dark:bg-arena" },
  { id: "LOST", title: "Perdidas", statuses: ["REJECTED", "CANCELLED", "EXPIRED"], dot: "bg-brasa" },
];
