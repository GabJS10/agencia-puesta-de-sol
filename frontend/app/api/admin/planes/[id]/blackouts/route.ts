import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { startOfDayUtc } from "@/lib/date-range";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().max(200).optional(),
});

export async function GET(_req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const blackouts = await prisma.planBlackout.findMany({
    where: { planId },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json({ blackouts });
}

export async function POST(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
  }
  // endDate es EXCLUSIVO: para bloquear un solo día, fin = inicio + 1 día.
  const startDay = startOfDayUtc(start);
  const endDay = startOfDayUtc(end);
  const normalizedEnd =
    endDay > startDay ? endDay : new Date(startDay.getTime() + 86_400_000);

  const blackout = await prisma.planBlackout.create({
    data: {
      planId,
      startDate: startDay,
      endDate: normalizedEnd,
      reason: parsed.data.reason || null,
    },
  });
  return NextResponse.json({ blackout }, { status: 201 });
}
