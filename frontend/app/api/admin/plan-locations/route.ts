import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({ location: z.string().min(2).max(50) });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const existing = await prisma.planLocation.findUnique({
    where: { location: parsed.data.location },
  });
  if (existing) return NextResponse.json({ error: "Ya existe" }, { status: 409 });

  const created = await prisma.planLocation.create({ data: { location: parsed.data.location } });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
