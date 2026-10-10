import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MailX, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { expireStaleRequests } from "@/lib/request-workflow";
import { checkRangeAvailable, getPlanAvailability, availabilitySelect } from "@/lib/availability";
import { eachDayKey, effectiveEndUtc, startOfDayUtc } from "@/lib/date-range";
import { formatDayKey, formatInstant, formatTravelRange } from "@/lib/format-dates";
import { ACTOR_LABEL, STATUS_META, isHolding } from "@/lib/request-status";
import { formatPrice } from "@/helpers/formatPrice";
import { RequestActions } from "@/components/admin/RequestActions";
import { HoldBadge, StatusBadge } from "@/components/requests/StatusBadge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Rangos largos: no listamos día a día más allá de esto.
const MAX_DAY_ROWS = 14;

export default async function SolicitudDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqId = Number(id);
  if (Number.isNaN(reqId)) notFound();

  await expireStaleRequests();

  const r = await prisma.planRequest.findUnique({
    where: { id: reqId },
    include: {
      plan: { select: { ...availabilitySelect, title: true, slug: true } },
      user: { select: { email: true } },
      events: {
        orderBy: { createdAt: "asc" },
        include: { actorUser: { select: { name: true } } },
      },
    },
  });
  if (!r) notFound();

  // Disponibilidad de las fechas de la solicitud, sin contar la propia.
  const start = startOfDayUtc(r.travelDate);
  const end = effectiveEndUtc(r.travelDate, r.endDate);
  const days = eachDayKey(start, end);
  const plan = r.plan;
  const pendingDecision = plan && ["PENDING", "CONTACTED", "EXPIRED"].includes(r.status);
  const [availability, verdict] = plan
    ? await Promise.all([
        getPlanAvailability({ ...plan, bookingsOpen: true }, start, end, prisma, r.id),
        pendingDecision
          ? checkRangeAvailable({ ...plan, bookingsOpen: true }, start, r.endDate, r.guests, prisma, r.id)
          : null,
      ])
    : [null, null];
  const blocked = new Set(availability?.unavailableDays);
  const tentative = new Set(availability?.tentativeDays);

  const total = r.unitPrice ? r.unitPrice * r.guests : null;
  const canComplete = start <= startOfDayUtc(new Date());
  const whatsapp = `https://wa.me/${r.phone.replace(/\D/g, "").replace(/^(?=3\d{9}$)/, "57")}`;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/solicitudes"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a solicitudes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">Solicitud #{r.id}</h1>
          <StatusBadge status={r.status} />
          <HoldBadge status={r.status} holdExpiresAt={r.holdExpiresAt} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Recibida el {formatInstant(r.createdAt)} · {r.user ? "Cliente registrado" : "Invitado"}
        </p>
      </div>

      {/* Acciones */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Acciones</h2>
        <RequestActions id={r.id} status={r.status} canComplete={canComplete} />
        {r.status === "CONFIRMED" && !canComplete && (
          <p className="mt-3 text-xs text-muted-foreground">
            Podrás marcarla como completada a partir del día del viaje.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Reserva</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">
              {r.plan ? (
                <Link href={`/planes/${r.plan.slug}`} className="hover:text-primary" target="_blank">
                  {r.plan.title}
                </Link>
              ) : (
                "Consulta general"
              )}
            </dd>
            <dt className="text-muted-foreground">Fechas</dt>
            <dd className="font-medium">{formatTravelRange(r.travelDate, r.endDate)}</dd>
            <dt className="text-muted-foreground">Personas</dt>
            <dd className="font-medium">{r.guests}</dd>
            {r.unitPrice != null && (
              <>
                <dt className="text-muted-foreground">Precio por persona</dt>
                <dd className="font-medium">{formatPrice(r.unitPrice)}</dd>
                <dt className="text-muted-foreground">Valor estimado</dt>
                <dd className="font-semibold text-barro">{formatPrice(total!)}</dd>
              </>
            )}
            {r.holdExpiresAt && (
              <>
                <dt className="text-muted-foreground">
                  {isHolding(r.status, r.holdExpiresAt) ? "Aparta cupo hasta" : "Apartado vencía"}
                </dt>
                <dd className="font-medium">{formatInstant(r.holdExpiresAt)}</dd>
              </>
            )}
          </dl>

          <h3 className="mb-3 mt-6 font-display text-base font-semibold">Cliente</h3>
          <p className="font-medium">{r.name}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-surface-hover">
              <Mail className="h-3.5 w-3.5" /> {r.email}
            </a>
            <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-surface-hover">
              <Phone className="h-3.5 w-3.5" /> {r.phone}
            </a>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-surface-hover">
              WhatsApp
            </a>
          </div>
          {r.message && (
            <blockquote className="mt-4 rounded-xl border-l-4 border-barro bg-muted/40 px-4 py-3 text-sm italic text-foreground/80">
              “{r.message}”
            </blockquote>
          )}
        </section>

        {/* Disponibilidad de esas fechas */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-1 font-display text-lg font-semibold">Disponibilidad de esas fechas</h2>
          {!plan || !availability ? (
            <p className="text-sm text-muted-foreground">Solicitud sin plan asociado.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {plan.availabilityMode === "CAPACITY"
                  ? `Aforo de ${plan.capacity} personas por día. Cifras sin contar esta solicitud.`
                  : "Salida exclusiva: un grupo por día. Sin contar esta solicitud."}
              </p>

              {verdict && (
                <div
                  className={cn(
                    "mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm",
                    verdict.ok ? "bg-mar/10 text-mar" : "bg-brasa/10 text-brasa",
                  )}
                >
                  {verdict.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  {verdict.ok ? "Hay disponibilidad para confirmarla." : verdict.reason}
                </div>
              )}

              <ul className="divide-y divide-border rounded-xl border border-border text-sm">
                {days.slice(0, MAX_DAY_ROWS).map((key) => {
                  const remaining = availability.remainingByDay?.[key];
                  let label: string;
                  let tone = "text-foreground";
                  if (tentative.has(key)) {
                    label = "Apartado por otra solicitud";
                    tone = "text-sol";
                  } else if (blocked.has(key)) {
                    label = remaining !== undefined && remaining <= 0 ? "Sin cupo" : "No disponible";
                    tone = "text-brasa";
                  } else if (remaining !== undefined) {
                    const after = remaining - r.guests;
                    label = `${remaining} de ${plan.capacity} libres${pendingDecision ? ` · quedarían ${after}` : ""}`;
                    tone = after < 0 ? "text-brasa" : "text-foreground";
                  } else {
                    label = "Libre";
                    tone = "text-mar";
                  }
                  return (
                    <li key={key} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">{formatDayKey(key, "EEE d MMM yyyy")}</span>
                      <span className={cn("font-medium", tone)}>{label}</span>
                    </li>
                  );
                })}
                {days.length > MAX_DAY_ROWS && (
                  <li className="px-4 py-2.5 text-xs text-muted-foreground">
                    … y {days.length - MAX_DAY_ROWS} días más
                  </li>
                )}
              </ul>
              <Link
                href={`/admin/planes/${plan.id}/disponibilidad`}
                className="mt-3 inline-block text-sm font-semibold text-barro hover:text-primary"
              >
                Configurar disponibilidad del plan →
              </Link>
            </>
          )}
        </section>
      </div>

      {/* Historial */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Historial</h2>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {r.events.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {ev.fromStatus ? (
                  <>
                    <span className="text-muted-foreground">{STATUS_META[ev.fromStatus].label}</span>
                    <span className="text-muted-foreground">→</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Creada como</span>
                )}
                <StatusBadge status={ev.toStatus} className="px-2.5 py-0.5" />
                <span className="text-xs text-muted-foreground">
                  {formatInstant(ev.createdAt)} · {ACTOR_LABEL[ev.actor]}
                  {ev.actorUser && ev.actor !== "CLIENT" ? ` (${ev.actorUser.name})` : ""}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    ev.emailSentAt ? "text-mar" : "text-muted-foreground",
                  )}
                  title={ev.emailSentAt ? `Correo enviado ${formatInstant(ev.emailSentAt)}` : "Sin correo enviado"}
                >
                  {ev.emailSentAt ? <Mail className="h-3 w-3" /> : <MailX className="h-3 w-3" />}
                  {ev.emailSentAt ? "correo enviado" : "sin correo"}
                </span>
              </div>
              {ev.note && (
                <p className="mt-1.5 whitespace-pre-line rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground/80">
                  {ev.note}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
