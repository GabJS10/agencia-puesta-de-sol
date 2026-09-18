import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { dayRangeUtc, startOfDayUtc } from "@/lib/date-range";

export const runtime = "nodejs";

const schema = z.object({
  planId: z.number().int().positive().optional().nullable(),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  travelDate: z.string().min(1),
  guests: z.number().int().min(1).max(50),
  message: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { planId, name, email, phone, travelDate, guests, message } = parsed.data;

  const date = new Date(travelDate);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  // Disponibilidad exclusiva por día: una reserva CONFIRMED ocupa el día.
  if (planId) {
    const { gte, lt } = dayRangeUtc(date);
    const taken = await prisma.planRequest.findFirst({
      where: { planId, status: "CONFIRMED", travelDate: { gte, lt } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Esa fecha ya no está disponible para este plan" },
        { status: 409 },
      );
    }
  }

  // Solicitud abierta: si hay sesión, se liga a la cuenta.
  const session = await getSession();

  const request = await prisma.planRequest.create({
    data: {
      planId: planId ?? null,
      userId: session?.id ?? null,
      name,
      email,
      phone,
      travelDate: startOfDayUtc(date),
      guests,
      message: message || null,
    },
  });

  return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
}
