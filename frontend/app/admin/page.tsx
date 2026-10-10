import Link from "next/link";
import { prisma } from "@/lib/db";
import { Package, Inbox, Users, Clock, Plus, Hourglass, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { expireStaleRequests } from "@/lib/request-workflow";
import { HOLDING_STATUSES, STATUS_CHART_COLOR, STATUS_META, STATUS_ORDER } from "@/lib/request-status";
import { eachDayKey, startOfDayUtc, toDayKey } from "@/lib/date-range";
import { formatDayKey, formatTravelRange } from "@/lib/format-dates";
import { RecentRequests } from "@/components/admin/RecentRequests";

export const dynamic = "force-dynamic";

const CHART_DAYS = 14;

export default async function AdminDashboard() {
  await expireStaleRequests();

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600_000);
  const today = startOfDayUtc(now);
  const in7d = new Date(today);
  in7d.setUTCDate(in7d.getUTCDate() + 7);
  const chartStart = new Date(today);
  chartStart.setUTCDate(chartStart.getUTCDate() - (CHART_DAYS - 1));

  const [plans, requests, inProgress, expiringSoon, upcoming, users, recent, lastDays, byStatus] =
    await Promise.all([
      prisma.plan.count(),
      prisma.planRequest.count(),
      prisma.planRequest.count({ where: { status: { in: HOLDING_STATUSES } } }),
      prisma.planRequest.count({
        where: { status: { in: HOLDING_STATUSES }, holdExpiresAt: { gt: now, lte: in24h } },
      }),
      prisma.planRequest.count({
        where: { status: "CONFIRMED", travelDate: { gte: today, lt: in7d } },
      }),
      prisma.user.count(),
      prisma.planRequest.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { plan: { select: { title: true, slug: true } } },
      }),
      prisma.planRequest.findMany({
        where: { createdAt: { gte: chartStart } },
        select: { createdAt: true },
      }),
      prisma.planRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  const cards = [
    { label: "Planes", value: plans, icon: Package, href: "/admin/planes", tone: "" },
    { label: "Solicitudes", value: requests, icon: Inbox, href: "/admin/solicitudes", tone: "" },
    { label: "En proceso", value: inProgress, icon: Clock, href: "/admin/solicitudes?estado=PENDING", tone: "text-barro" },
    { label: "Apartados por vencer (<24 h)", value: expiringSoon, icon: Hourglass, href: "/admin/solicitudes?estado=PENDING", tone: expiringSoon > 0 ? "text-[#b0283f] dark:text-[#f08a9c]" : "" },
    { label: "Viajes confirmados · 7 días", value: upcoming, icon: CalendarCheck, href: "/admin/solicitudes?estado=CONFIRMED", tone: "text-[#0f7a6f] dark:text-[#5fd3c5]" },
    { label: "Usuarios", value: users, icon: Users, href: "/admin/usuarios", tone: "" },
  ];

  // Solicitudes por día (UTC) de los últimos CHART_DAYS días.
  const perDay = new Map<string, number>();
  for (const r of lastDays) {
    const key = toDayKey(r.createdAt);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const dayKeys = eachDayKey(chartStart, new Date(today.getTime() + 86_400_000));
  const bars = dayKeys.map((key) => ({ key, value: perDay.get(key) ?? 0 }));
  const maxBar = Math.max(1, ...bars.map((b) => b.value));
  const chartTotal = bars.reduce((sum, b) => sum + b.value, 0);

  const counts = new Map(byStatus.map((g) => [g.status, g._count._all]));
  const segments = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_META[status].label,
    count: counts.get(status) ?? 0,
    color: STATUS_CHART_COLOR[status],
  }));
  const statusTotal = segments.reduce((sum, s) => sum + s.count, 0);

  const rows = recent.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    planTitle: r.plan?.title ?? null,
    planSlug: r.plan?.slug ?? null,
    travel: formatTravelRange(r.travelDate, r.endDate),
    guests: r.guests,
    status: r.status,
  }));

  const todayLabel = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const todayText = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{todayText}</p>
          <h1 className="mt-1 text-[40px] font-extrabold leading-tight tracking-[-0.035em]">Dashboard</h1>
        </div>
        <Link
          href="/admin/planes/nuevo"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-sol px-5 text-[15px] font-bold text-[#2a1a0a] transition-all hover:-translate-y-0.5 hover:bg-[#f7b456] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo plan
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, href, tone }, i) => (
          <Link
            key={label}
            href={href}
            className="anim-rise group rounded-[20px] bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-22px_rgba(74,45,20,0.35)]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-h-[34px] text-[13px] font-bold leading-snug text-muted-foreground">
                {label}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-sol" />
            </div>
            <p className={cn("mt-2.5 text-[34px] font-extrabold tracking-[-0.03em]", tone)}>{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-[22px] bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold">Solicitudes · últimos {CHART_DAYS} días</h2>
            <span className="text-sm text-muted-foreground">{chartTotal} en total</span>
          </div>
          <div
            className="mt-10 flex h-[200px] items-end gap-1.5 sm:gap-2.5"
            role="img"
            aria-label={`Solicitudes por día en los últimos ${CHART_DAYS} días: ${chartTotal} en total`}
          >
            {bars.map((b, i) => (
              <div
                key={b.key}
                className={cn(
                  "anim-grow-y group relative flex-1 rounded-t-lg rounded-b-sm transition-colors hover:bg-barro",
                  i === bars.length - 1 ? "bg-sol" : "bg-secondary",
                )}
                style={{
                  height: `${Math.max(3, Math.round((b.value / maxBar) * 100))}%`,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-xs font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {formatDayKey(b.key, "d MMM")} · {b.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
            <span>{formatDayKey(dayKeys[0], "d MMM")}</span>
            <span>Hoy</span>
          </div>
        </section>

        <section className="flex flex-col rounded-[22px] bg-card p-6">
          <h2 className="text-lg font-extrabold">Estado de las solicitudes</h2>
          {statusTotal > 0 ? (
            <div className="mt-6 flex h-3.5 gap-[3px] overflow-hidden rounded-full" aria-hidden="true">
              {segments
                .filter((s) => s.count > 0)
                .map((s) => (
                  <span key={s.status} style={{ flexGrow: s.count, background: s.color }} />
                ))}
            </div>
          ) : (
            <div className="mt-6 h-3.5 rounded-full bg-secondary" aria-hidden="true" />
          )}
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {segments.map((s) => (
              <li key={s.status} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
                <strong className="ml-auto tabular-nums">{s.count}</strong>
              </li>
            ))}
          </ul>
          {expiringSoon > 0 && (
            <Link
              href="/admin/solicitudes?estado=PENDING"
              className="mt-6 flex items-center gap-2.5 rounded-[14px] bg-[#f8d7dd] px-4 py-3.5 text-sm font-bold text-[#7a1a2e] transition-transform hover:-translate-y-0.5 lg:mt-auto"
            >
              <Hourglass className="h-4 w-4" />
              {expiringSoon === 1
                ? "1 apartado vence en menos de 24 h"
                : `${expiringSoon} apartados vencen en menos de 24 h`}
            </Link>
          )}
        </section>
      </div>

      <div className="mt-3.5">
        <RecentRequests rows={rows} />
      </div>
    </div>
  );
}
