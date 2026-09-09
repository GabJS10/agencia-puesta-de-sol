import { z } from "zod";

// Esquema compartido para crear/editar un plan desde el admin.
export const planSchema = z.object({
  title: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  price: z.number().nonnegative(),
  location: z.string().min(2).max(80),
  description: z.string().min(1),
  itinerary: z.string().optional().default(""),
  includes: z.string().min(1),
  recommendations: z.string().min(1),
  photoUrl: z.string().url(),
  galleryUrls: z.array(z.string().url()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  published: z.boolean().default(true),
  planTypeId: z.number().int().positive().nullable().optional(),
  planLocationId: z.number().int().positive().nullable().optional(),
});

export type PlanInput = z.infer<typeof planSchema>;
