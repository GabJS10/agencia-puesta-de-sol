import { prisma } from "@/lib/db";

// Devuelve [{ type }] como antes (para poblar los filtros).
export async function getPlanTypes() {
  return prisma.planType.findMany({
    select: { type: true },
    orderBy: { type: "asc" },
  });
}
