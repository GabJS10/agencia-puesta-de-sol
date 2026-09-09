import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlanForm, type PlanFormData } from "@/components/admin/PlanForm";

export const dynamic = "force-dynamic";

export default async function EditarPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) notFound();

  const [plan, types, locations] = await Promise.all([
    prisma.plan.findUnique({ where: { id: planId } }),
    prisma.planType.findMany({ orderBy: { type: "asc" } }),
    prisma.planLocation.findMany({ orderBy: { location: "asc" } }),
  ]);

  if (!plan) notFound();

  const initial: PlanFormData = {
    id: plan.id,
    title: plan.title,
    slug: plan.slug,
    price: plan.price,
    location: plan.location,
    description: plan.description,
    itinerary: plan.itinerary ?? "",
    includes: plan.includes,
    recommendations: plan.recommendations,
    photoUrl: plan.photoUrl,
    galleryUrls: plan.galleryUrls,
    tags: plan.tags,
    published: plan.published,
    planTypeId: plan.planTypeId,
    planLocationId: plan.planLocationId,
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Editar plan</h1>
      <PlanForm types={types} locations={locations} initial={initial} />
    </div>
  );
}
