import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDayUtc } from "@/lib/date-range";
import { checkRangeAvailable, withPlanLock, availabilitySelect } from "@/lib/availability";
import { createPlanRequest } from "@/lib/request-workflow";
import { HOLDING_STATUSES } from "@/lib/request-status";
import { notifyRequestCreated } from "@/lib/notifications";
import { notifyAdmins } from "@/lib/admin-notifications";

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
    const request = await createPlanRequest(prisma, {
      planId: null,
      userId: session?.id ?? null,
      name,
      email,
      phone,
      travelDate: startDay,
      endDate: null,
      guests,
      message: message || null,
    });
    await notifyAdmins("REQUEST_CREATED", request.id);
    after(() => notifyRequestCreated(request.id));
    return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { ...availabilitySelect, price: true },
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
    // Evita duplicados (doble envío): misma persona, plan y fecha aún en proceso.
    const duplicate = await tx.planRequest.findFirst({
      where: {
        planId,
        email: { equals: email, mode: "insensitive" },
        travelDate: startDay,
        status: { in: HOLDING_STATUSES },
      },
      select: { id: true },
    });
    if (duplicate) return { conflict: "Ya tienes una solicitud en proceso para esa fecha" };

    const check = await checkRangeAvailable(plan, startDay, endDay, guests, tx);
    if (!check.ok) return { conflict: check.reason };

    const request = await createPlanRequest(tx, {
      planId,
      userId: session?.id ?? null,
      name,
      email,
      phone,
      travelDate: startDay,
      endDate: endDay,
      guests,
      message: message || null,
      unitPrice: plan.price,
    });
    return { id: request.id };
  });

  if ("conflict" in result) {
    return NextResponse.json({ error: result.conflict }, { status: 409 });
  }
  await notifyAdmins("REQUEST_CREATED", result.id);
  after(() => notifyRequestCreated(result.id));
  return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
}
