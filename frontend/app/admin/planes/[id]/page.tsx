import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Editar plan</h1>
        <Link
          href={`/admin/planes/${plan.id}/disponibilidad`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <CalendarClock className="h-4 w-4" />
          Configurar disponibilidad
        </Link>
      </div>
      <PlanForm types={types} locations={locations} initial={initial} />
    </div>
  );
}
