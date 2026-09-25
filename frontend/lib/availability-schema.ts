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
  })
  .refine(
    (d) => d.availabilityMode !== "CAPACITY" || (d.capacity ?? 0) > 0,
    { message: "El aforo (capacity) es obligatorio y > 0 en modo CAPACITY", path: ["capacity"] },
  );

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
