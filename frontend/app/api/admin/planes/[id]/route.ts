import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { planSchema } from "@/lib/plan-schema";

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
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Verifica que el slug no colisione con otro plan.
  const clash = await prisma.plan.findFirst({
    where: { slug: d.slug, NOT: { id: planId } },
  });
  if (clash) {
    return NextResponse.json({ error: "El slug ya existe" }, { status: 409 });
  }

  try {
    await prisma.plan.update({
      where: { id: planId },
      data: {
        title: d.title,
        slug: d.slug,
        price: d.price,
        location: d.location,
        description: d.description,
        itinerary: d.itinerary || null,
        includes: d.includes,
        recommendations: d.recommendations,
        photoUrl: d.photoUrl,
        galleryUrls: d.galleryUrls,
        tags: d.tags,
        published: d.published,
        planTypeId: d.planTypeId ?? null,
        planLocationId: d.planLocationId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const planId = Number(id);
  if (Number.isNaN(planId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.plan.delete({ where: { id: planId } });
  } catch {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
