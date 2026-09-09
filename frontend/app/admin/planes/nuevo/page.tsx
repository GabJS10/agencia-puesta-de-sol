import { prisma } from "@/lib/db";
import { PlanForm } from "@/components/admin/PlanForm";

export const dynamic = "force-dynamic";

export default async function NuevoPlanPage() {
  const [types, locations] = await Promise.all([
    prisma.planType.findMany({ orderBy: { type: "asc" } }),
    prisma.planLocation.findMany({ orderBy: { location: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Nuevo plan</h1>
      <PlanForm types={types} locations={locations} />
    </div>
  );
}
