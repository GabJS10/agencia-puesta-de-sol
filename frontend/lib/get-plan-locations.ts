import { prisma } from "@/lib/db";

// Devuelve [{ location }] como antes (para poblar los filtros).
export async function getPlanLocations() {
  return prisma.planLocation.findMany({
    select: { location: true },
    orderBy: { location: "asc" },
  });
}
