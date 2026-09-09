import { prisma } from "@/lib/db";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function TiposPage() {
  const types = await prisma.planType.findMany({ orderBy: { type: "asc" } });
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Tipos de plan</h1>
      <TaxonomyManager
        items={types.map((t) => ({ id: t.id, label: t.type }))}
        createEndpoint="/api/admin/plan-types"
        deleteBase="/api/admin/plan-types"
        fieldName="type"
        placeholder="Ej: Aventura"
      />
    </div>
  );
}
