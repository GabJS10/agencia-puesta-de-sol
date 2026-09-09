import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { planSchema } from "@/lib/plan-schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const existing = await prisma.plan.findUnique({ where: { slug: d.slug } });
  if (existing) {
    return NextResponse.json({ error: "El slug ya existe" }, { status: 409 });
  }

  const plan = await prisma.plan.create({
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

  return NextResponse.json({ id: plan.id }, { status: 201 });
}
