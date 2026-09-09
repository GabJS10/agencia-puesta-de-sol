import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({ type: z.string().min(2).max(30) });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const existing = await prisma.planType.findUnique({ where: { type: parsed.data.type } });
  if (existing) return NextResponse.json({ error: "Ya existe" }, { status: 409 });

  const created = await prisma.planType.create({ data: { type: parsed.data.type } });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
