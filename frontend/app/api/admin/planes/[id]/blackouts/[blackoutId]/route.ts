import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; blackoutId: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id, blackoutId } = await params;
  const planId = Number(id);
  const bId = Number(blackoutId);
  if (Number.isNaN(planId) || Number.isNaN(bId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { count } = await prisma.planBlackout.deleteMany({
    where: { id: bId, planId },
  });
  if (count === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
