import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { checkRangeAvailable, withPlanLock, availabilitySelect } from "@/lib/availability";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "CONFIRMED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const reqId = Number(id);
  if (Number.isNaN(reqId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  const nextStatus = parsed.data.status;

  const current = await prisma.planRequest.findUnique({
    where: { id: reqId },
    select: { planId: true, travelDate: true, endDate: true, guests: true },
  });
  if (!current) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // Confirmar una reserva ligada a un plan: hazlo bajo lock re-validando cupo/exclusividad.
  if (nextStatus === "CONFIRMED" && current.planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: current.planId },
      select: availabilitySelect,
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const result = await withPlanLock(current.planId, async (tx) => {
      const check = await checkRangeAvailable(
        plan,
        current.travelDate,
        current.endDate,
        current.guests,
        tx,
      );
      if (!check.ok) return { conflict: check.reason };
      await tx.planRequest.update({ where: { id: reqId }, data: { status: nextStatus } });
      return { ok: true as const };
    });

    if ("conflict" in result) {
      return NextResponse.json({ error: result.conflict }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  await prisma.planRequest.update({ where: { id: reqId }, data: { status: nextStatus } });
  return NextResponse.json({ ok: true });
}
