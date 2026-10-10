import { z } from "zod";

// Esquema dedicado para la configuración de disponibilidad de un plan.
// Vive aparte de planSchema para poder gestionarse en su propio apartado
// (/admin/planes/[id]/disponibilidad) sin arrastrar el contenido del plan.
export const availabilitySchema = z
  .object({
    availabilityMode: z.enum(["EXCLUSIVE", "CAPACITY"]).default("EXCLUSIVE"),
    capacity: z.number().int().positive().nullable().optional(),
    bookingMode: z.enum(["SINGLE_DAY", "DATE_RANGE"]).default("SINGLE_DAY"),
    bookingsOpen: z.boolean().default(true),
    // Solo DATE_RANGE: duración permitida en días (inicio y fin incluidos).
    minDays: z.number().int().min(1).max(60).nullable().optional(),
    maxDays: z.number().int().min(1).max(60).nullable().optional(),
  })
  .refine(
    (d) => d.availabilityMode !== "CAPACITY" || (d.capacity ?? 0) > 0,
    { message: "El aforo (capacity) es obligatorio y > 0 en modo CAPACITY", path: ["capacity"] },
  )
  .refine(
    (d) =>
      d.bookingMode !== "DATE_RANGE" ||
      (d.minDays != null && d.maxDays != null && d.minDays <= d.maxDays),
    {
      message: "En modo rango indica el mínimo y el máximo de días (mínimo ≤ máximo)",
      path: ["minDays"],
    },
  );

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
