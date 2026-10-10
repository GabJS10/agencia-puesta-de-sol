// Notificaciones in-app para los admins (toast + apartado /admin/notificaciones).
// Se crea una fila por admin para que cada uno tenga su estado de lectura.
import "server-only";
import type { Notification, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HOLDING_STATUSES } from "@/lib/request-status";
import { formatRemaining, formatTravelRange } from "@/lib/format-dates";
import type { AdminNotification } from "@/lib/notification-meta";

const TITLE: Record<NotificationType, string> = {
  REQUEST_CREATED: "Nueva solicitud",
  REQUEST_CANCELLED: "Solicitud cancelada por el cliente",
  REQUEST_EXPIRED: "Apartado vencido",
  HOLD_EXPIRING: "Apartado por vencer",
};

/** Notifica a todos los admins sobre una solicitud. Nunca lanza. */
export async function notifyAdmins(type: NotificationType, requestId: number): Promise<void> {
  try {
    const [r, admins] = await Promise.all([
      prisma.planRequest.findUnique({
        where: { id: requestId },
        include: { plan: { select: { title: true } } },
      }),
      prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
    ]);
    if (!r || admins.length === 0) return;

    const plan = r.plan?.title ?? "Consulta general";
    const people = `${r.guests} ${r.guests === 1 ? "persona" : "personas"}`;
    const dates = formatTravelRange(r.travelDate, r.endDate);
    const extra =
      type === "HOLD_EXPIRING" && r.holdExpiresAt
        ? ` · vence en ${formatRemaining(r.holdExpiresAt)}`
        : "";

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type,
        requestId,
        title: `${TITLE[type]} · ${plan}`,
        body: `#${r.id} · ${r.name} · ${people} · ${dates}${extra}`,
      })),
    });
  } catch (err) {
    console.error(`[notificaciones] ${type} #${requestId}:`, err);
  }
}

/**
 * Avisa una sola vez cuando a una solicitud en proceso le quedan < 24 h de
 * apartado. El updateMany condicional "reclama" el aviso de forma atómica, así
 * dos polls simultáneos no lo duplican; si el apartado se renueva, se vuelve a avisar.
 */
export async function warnExpiringHolds(): Promise<void> {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 3600_000);
  const candidates = await prisma.planRequest.findMany({
    where: { status: { in: HOLDING_STATUSES }, holdExpiresAt: { gt: now, lte: soon } },
    select: { id: true, holdExpiresAt: true, expiryWarnedFor: true },
  });
  for (const c of candidates) {
    if (c.expiryWarnedFor?.getTime() === c.holdExpiresAt!.getTime()) continue;
    const claimed = await prisma.planRequest.updateMany({
      where: {
        id: c.id,
        holdExpiresAt: c.holdExpiresAt,
        OR: [{ expiryWarnedFor: null }, { expiryWarnedFor: { not: c.holdExpiresAt! } }],
      },
      data: { expiryWarnedFor: c.holdExpiresAt },
    });
    if (claimed.count === 1) await notifyAdmins("HOLD_EXPIRING", c.id);
  }
}

export function serializeNotification(n: Notification): AdminNotification {
  return {
    id: n.id,
    type: n.type,
    requestId: n.requestId,
    title: n.title,
    body: n.body,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  };
}

export function countUnread(userId: number) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
