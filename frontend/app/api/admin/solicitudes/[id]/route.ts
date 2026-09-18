import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dayRangeUtc } from "@/lib/date-range";

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
  const current = await prisma.planRequest.findUnique({
    where: { id: reqId },
    select: { planId: true, travelDate: true },
  });
  if (!current) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // Reserva exclusiva por día: evitar dos confirmadas del mismo plan/día.
  if (parsed.data.status === "CONFIRMED" && current.planId) {
    const { gte, lt } = dayRangeUtc(current.travelDate);
    const conflict = await prisma.planRequest.findFirst({
      where: {
        id: { not: reqId },
        planId: current.planId,
        status: "CONFIRMED",
        travelDate: { gte, lt },
      },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Ya hay una reserva confirmada para ese plan en esa fecha" },
        { status: 409 },
      );
    }
  }

  await prisma.planRequest.update({
    where: { id: reqId },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}
