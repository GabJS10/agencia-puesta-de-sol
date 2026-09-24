import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDayUtc } from "@/lib/date-range";
import { checkRangeAvailable, withPlanLock, availabilitySelect } from "@/lib/availability";

export const runtime = "nodejs";

const schema = z.object({
  planId: z.number().int().positive().optional().nullable(),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  travelDate: z.string().min(1),
  endDate: z.string().min(1).optional().nullable(),
  guests: z.number().int().min(1).max(50),
  message: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { planId, name, email, phone, travelDate, endDate, guests, message } = parsed.data;

  const start = new Date(travelDate);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  const startDay = startOfDayUtc(start);

  // Solicitud sin plan (contacto general): se crea sin chequeo de disponibilidad.
  if (!planId) {
    const session = await getSession();
    const request = await prisma.planRequest.create({
      data: {
        planId: null,
        userId: session?.id ?? null,
        name,
        email,
        phone,
        travelDate: startDay,
        endDate: null,
        guests,
        message: message || null,
      },
    });
    return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: availabilitySelect,
  });
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  // Normaliza el rango según el modo del plan.
  let endDay: Date | null = null;
  if (plan.bookingMode === "DATE_RANGE") {
    if (!endDate) {
      return NextResponse.json(
        { error: "Este plan requiere fecha de inicio y fin" },
        { status: 400 },
      );
    }
    const parsedEnd = new Date(endDate);
    if (Number.isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: "Fecha fin inválida" }, { status: 400 });
    }
    // endDate es EXCLUSIVO: la última noche seleccionada + 1 día.
    endDay = startOfDayUtc(parsedEnd);
    if (endDay <= startDay) {
      return NextResponse.json(
        { error: "La fecha fin debe ser posterior a la de inicio" },
        { status: 400 },
      );
    }
  }

  const session = await getSession();

  // Reserva atómica: advisory lock por plan + re-chequeo dentro de la transacción.
  const result = await withPlanLock(planId, async (tx) => {
    const check = await checkRangeAvailable(plan, startDay, endDay, guests, tx);
    if (!check.ok) return { conflict: check.reason };

    const request = await tx.planRequest.create({
      data: {
        planId,
        userId: session?.id ?? null,
        name,
        email,
        phone,
        travelDate: startDay,
        endDate: endDay,
        guests,
        message: message || null,
      },
    });
    return { id: request.id };
  });

  if ("conflict" in result) {
    return NextResponse.json({ error: result.conflict }, { status: 409 });
  }
  return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
}
