// Notificaciones por correo de las solicitudes. Se ejecutan con `after()` desde
// las rutas/páginas: nunca lanzan ni bloquean la respuesta.
import "server-only";
import type { PlanRequest } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail, type Recipient } from "@/lib/email/brevo";
import {
  requestCancelledByClientAdmin,
  requestReceivedAdmin,
  requestReceivedClient,
  statusChangedClient,
  type RequestEmailData,
} from "@/lib/email/templates";
import { formatInstant, formatTravelRange } from "@/lib/format-dates";
import { isHolding } from "@/lib/request-status";

type RequestWithPlan = PlanRequest & { plan: { title: string; slug: string } | null };

const planSelect = { plan: { select: { title: true, slug: true } } } as const;

function appUrl(path: string): string {
  return new URL(path, process.env.APP_URL || "http://localhost:3000").toString();
}

function toEmailData(r: RequestWithPlan): RequestEmailData {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    planTitle: r.plan?.title ?? null,
    planUrl: r.plan ? appUrl(`/planes/${r.plan.slug}`) : null,
    dates: formatTravelRange(r.travelDate, r.endDate),
    guests: r.guests,
    message: r.message,
    holdUntil:
      r.holdExpiresAt && isHolding(r.status, r.holdExpiresAt)
        ? formatInstant(r.holdExpiresAt)
        : null,
    estimatedTotal: r.unitPrice ? r.unitPrice * r.guests : null,
    accountUrl: appUrl("/cuenta"),
    adminUrl: appUrl(`/admin/solicitudes/${r.id}`),
  };
}

/** Destinatarios de la agencia: ADMIN_NOTIFY_EMAILS o, si no hay, los usuarios ADMIN. */
async function adminRecipients(): Promise<Recipient[]> {
  const fromEnv = (process.env.ADMIN_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv.map((email) => ({ email }));
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true },
  });
}

/** Nueva solicitud: acuse al cliente + aviso a la agencia. */
export async function notifyRequestCreated(requestId: number): Promise<void> {
  try {
    const r = await prisma.planRequest.findUnique({
      where: { id: requestId },
      include: { ...planSelect, events: { orderBy: { createdAt: "asc" }, take: 1 } },
    });
    if (!r) return;
    const data = toEmailData(r);

    const [clientSent] = await Promise.all([
      sendEmail({ to: [{ email: r.email, name: r.name }], ...requestReceivedClient(data) }),
      adminRecipients().then((to) =>
        sendEmail({ to, replyTo: { email: r.email, name: r.name }, ...requestReceivedAdmin(data) }),
      ),
    ]);

    if (clientSent && r.events[0]) {
      await prisma.planRequestEvent.update({
        where: { id: r.events[0].id },
        data: { emailSentAt: new Date() },
      });
    }
  } catch (err) {
    console.error(`[notify] solicitud creada #${requestId}:`, err);
  }
}

/** Cambio de estado: correo al cliente (y a la agencia si el cliente canceló). */
export async function notifyStatusChanged(eventId: number): Promise<void> {
  try {
    const ev = await prisma.planRequestEvent.findUnique({
      where: { id: eventId },
      include: { request: { include: planSelect } },
    });
    if (!ev) return;
    const data = toEmailData(ev.request);

    const sent = await sendEmail({
      to: [{ email: ev.request.email, name: ev.request.name }],
      ...statusChangedClient(data, ev),
    });
    if (sent) {
      await prisma.planRequestEvent.update({
        where: { id: ev.id },
        data: { emailSentAt: new Date() },
      });
    }

    if (ev.actor === "CLIENT" && ev.toStatus === "CANCELLED") {
      await sendEmail({
        to: await adminRecipients(),
        replyTo: { email: ev.request.email, name: ev.request.name },
        ...requestCancelledByClientAdmin(data, ev.note),
      });
    }
  } catch (err) {
    console.error(`[notify] evento #${eventId}:`, err);
  }
}

export async function notifyStatusEvents(eventIds: number[]): Promise<void> {
  for (const id of eventIds) await notifyStatusChanged(id);
}
