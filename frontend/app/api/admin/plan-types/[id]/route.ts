import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const typeId = Number(id);
  if (Number.isNaN(typeId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  // Desvincula los planes que lo usaban, luego borra.
  await prisma.plan.updateMany({ where: { planTypeId: typeId }, data: { planTypeId: null } });
  try {
    await prisma.planType.delete({ where: { id: typeId } });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
