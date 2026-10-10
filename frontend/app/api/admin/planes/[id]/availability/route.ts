import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { availabilitySchema } from "@/lib/availability-schema";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  try {
    await prisma.plan.update({
      where: { id: planId },
      data: {
        availabilityMode: d.availabilityMode,
        capacity: d.availabilityMode === "CAPACITY" ? (d.capacity ?? null) : null,
        bookingMode: d.bookingMode,
        bookingsOpen: d.bookingsOpen,
        minDays: d.bookingMode === "DATE_RANGE" ? (d.minDays ?? null) : null,
        maxDays: d.bookingMode === "DATE_RANGE" ? (d.maxDays ?? null) : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
