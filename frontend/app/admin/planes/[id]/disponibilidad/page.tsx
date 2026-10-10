import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { AvailabilityForm } from "@/components/admin/AvailabilityForm";
import { BlackoutManager } from "@/components/admin/BlackoutManager";

export const dynamic = "force-dynamic";

export default async function DisponibilidadPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) notFound();

  const [plan, blackouts] = await Promise.all([
    prisma.plan.findUnique({ where: { id: planId } }),
    prisma.planBlackout.findMany({
      where: { planId },
      orderBy: { startDate: "asc" },
    }),
  ]);

  if (!plan) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href={`/admin/planes/${plan.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a editar plan
        </Link>
        <h1 className="font-display text-3xl font-semibold">Disponibilidad</h1>
        <p className="mt-1 text-muted-foreground">{plan.title}</p>
      </div>

      <AvailabilityForm
        planId={plan.id}
        initial={{
          availabilityMode: plan.availabilityMode,
          capacity: plan.capacity,
          bookingMode: plan.bookingMode,
          bookingsOpen: plan.bookingsOpen,
          minDays: plan.minDays,
          maxDays: plan.maxDays,
        }}
      />

      <BlackoutManager
        planId={plan.id}
        initial={blackouts.map((b) => ({
          id: b.id,
          startDate: b.startDate.toISOString().slice(0, 10),
          endDate: b.endDate.toISOString().slice(0, 10),
          reason: b.reason,
        }))}
      />
    </div>
  );
}
