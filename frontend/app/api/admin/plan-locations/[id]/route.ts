import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const locId = Number(id);
  if (Number.isNaN(locId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  await prisma.plan.updateMany({ where: { planLocationId: locId }, data: { planLocationId: null } });
  try {
    await prisma.planLocation.delete({ where: { id: locId } });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
