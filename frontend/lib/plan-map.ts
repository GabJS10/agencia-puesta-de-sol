import type { Plan, PlanType, PlanLocation } from "@prisma/client";
import { Plane } from "@/types/Planes";

export type PlanWithRelations = Plan & {
  planType: PlanType | null;
  planLocation: PlanLocation | null;
};

// Mapea un Plan de Prisma a la forma `Plane` que ya consume el frontend
// (antes venía de Strapi). Las URLs de media son absolutas (Cloudinary/Unsplash).
export function toPlane(p: PlanWithRelations): Plane {
  return {
    id: p.id,
    documentId: String(p.id),
    title: p.title,
    location: p.location,
    price: p.price,
    description: p.description,
    recommendations: p.recommendations,
    includes: p.includes,
    itinerary: p.itinerary ?? "",
    url: p.slug,
    photo: { url: p.photoUrl, name: p.title },
    gallery: p.galleryUrls.map((url) => ({ url, name: p.title })),
    tags: p.tags.map((element, i) => ({ id: i, element })),
    plan_location: { location: p.planLocation?.location ?? p.location },
    plan_type: { type: p.planType?.type ?? "" },
  };
}

export const planInclude = { planType: true, planLocation: true } as const;
