import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { expireStaleRequests } from "@/lib/request-workflow";
import { countUnread, serializeNotification, warnExpiringHolds } from "@/lib/admin-notifications";

export const runtime = "nodejs";

/**
 * Lista/poll de notificaciones del admin en sesión.
 * - `after=<id>`: solo las más nuevas que ese id (polling de toasts).
 * - sin `after`: las últimas `limit` (filtro=no-leidas opcional).
 * De paso pone al día vencimientos y avisos "por vencer" (sin cron).
 */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await expireStaleRequests();
  await warnExpiringHolds();

  const sp = new URL(req.url).searchParams;
  const after = Number(sp.get("after"));
  const limit = Math.min(200, Math.max(1, Number(sp.get("limit")) || 50));

  const where: Prisma.NotificationWhereInput = { userId: admin.id };
  const [items, unread, latest] = await Promise.all([
    after > 0
      ? prisma.notification.findMany({
          where: { ...where, id: { gt: after } },
          orderBy: { id: "asc" },
          take: 20,
        })
      : prisma.notification.findMany({
          where: sp.get("filtro") === "no-leidas" ? { ...where, readAt: null } : where,
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
    countUnread(admin.id),
    prisma.notification.aggregate({ where, _max: { id: true } }),
  ]);

  return NextResponse.json({
    unread,
    latestId: latest._max.id ?? 0,
    items: items.map(serializeNotification),
  });
}

const selection = z
  .object({
    ids: z.array(z.number().int().positive()).max(500).optional(),
    all: z.boolean().optional(),
  })
  .refine((d) => d.all || (d.ids && d.ids.length > 0), { message: "Sin selección" });

function scope(adminId: number, d: { ids?: number[]; all?: boolean }): Prisma.NotificationWhereInput {
  return d.all ? { userId: adminId } : { userId: adminId, id: { in: d.ids } };
}

/** Marca leídas / no leídas: { ids | all, read }. */
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = selection
    .and(z.object({ read: z.boolean() }))
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { read } = parsed.data;
  const res = await prisma.notification.updateMany({
    where: { ...scope(admin.id, parsed.data), readAt: read ? null : { not: null } },
    data: { readAt: read ? new Date() : null },
  });
  return NextResponse.json({ ok: true, count: res.count, unread: await countUnread(admin.id) });
}

/** Elimina: { ids | all, onlyRead? }. */
export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = selection
    .and(z.object({ onlyRead: z.boolean().optional() }))
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const res = await prisma.notification.deleteMany({
    where: {
      ...scope(admin.id, parsed.data),
      ...(parsed.data.onlyRead ? { readAt: { not: null } } : {}),
    },
  });
  return NextResponse.json({ ok: true, count: res.count, unread: await countUnread(admin.id) });
}
