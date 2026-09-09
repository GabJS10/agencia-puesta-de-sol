import { prisma } from "@/lib/db";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function UbicacionesPage() {
  const locations = await prisma.planLocation.findMany({ orderBy: { location: "asc" } });
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Ubicaciones</h1>
      <TaxonomyManager
        items={locations.map((l) => ({ id: l.id, label: l.location }))}
        createEndpoint="/api/admin/plan-locations"
        deleteBase="/api/admin/plan-locations"
        fieldName="location"
        placeholder="Ej: Cabo de la Vela"
      />
    </div>
  );
}
