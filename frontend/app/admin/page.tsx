import Link from "next/link";
import { prisma } from "@/lib/db";
import { Package, Inbox, Users, Clock, Plus, Hourglass, CalendarCheck } from "lucide-react";
import { expireStaleRequests } from "@/lib/request-workflow";
import { HOLDING_STATUSES } from "@/lib/request-status";
import { startOfDayUtc } from "@/lib/date-range";
import { formatTravelRange } from "@/lib/format-dates";
import { StatusBadge } from "@/components/requests/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await expireStaleRequests();

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600_000);
  const today = startOfDayUtc(now);
  const in7d = new Date(today);
  in7d.setUTCDate(in7d.getUTCDate() + 7);

  const [plans, requests, inProgress, expiringSoon, upcoming, users, recent] = await Promise.all([
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
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { title: true, slug: true } } },
    }),
  ]);

  const cards = [
    { label: "Planes", value: plans, icon: Package, href: "/admin/planes" },
    { label: "Solicitudes", value: requests, icon: Inbox, href: "/admin/solicitudes" },
    { label: "En proceso", value: inProgress, icon: Clock, href: "/admin/solicitudes?estado=PENDING" },
    { label: "Apartados por vencer (<24 h)", value: expiringSoon, icon: Hourglass, href: "/admin/solicitudes?estado=PENDING" },
    { label: "Viajes confirmados · 7 días", value: upcoming, icon: CalendarCheck, href: "/admin/solicitudes?estado=CONFIRMED" },
    { label: "Usuarios", value: users, icon: Users, href: "/admin/usuarios" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <Link
          href="/admin/planes/nuevo"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo plan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 font-display text-4xl font-semibold text-atardecer">
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Solicitudes recientes */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Solicitudes recientes</h2>
          <Link
            href="/admin/solicitudes"
            className="text-sm font-semibold text-barro hover:text-primary"
          >
            Ver todas →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Aún no hay solicitudes.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Fecha viaje</th>
                  <th className="px-6 py-3 text-center">Personas</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  return (
                    <tr key={r.id} className="border-t border-border/70">
                      <td className="px-6 py-4">
                        <Link href={`/admin/solicitudes/${r.id}`} className="font-semibold text-foreground hover:text-primary">
                          {r.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground/90">
                        {r.plan ? (
                          <Link
                            href={`/planes/${r.plan.slug}`}
                            className="hover:text-primary"
                          >
                            {r.plan.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground/90">
                        {formatTravelRange(r.travelDate, r.endDate)}
                      </td>
                      <td className="px-6 py-4 text-center text-foreground/90">
                        {r.guests}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
