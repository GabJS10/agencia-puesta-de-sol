import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { Package, Inbox, Users, Clock, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-sol/15 text-sol" },
  CONTACTED: { label: "Contactado", className: "bg-mar/15 text-mar" },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  CANCELLED: { label: "Cancelado", className: "bg-brasa/15 text-brasa" },
};

export default async function AdminDashboard() {
  const [plans, requests, pending, users, recent] = await Promise.all([
    prisma.plan.count(),
    prisma.planRequest.count(),
    prisma.planRequest.count({ where: { status: "PENDING" } }),
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
    { label: "Pendientes", value: pending, icon: Clock, href: "/admin/solicitudes" },
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  const status = STATUS[r.status] ?? STATUS.PENDING;
                  return (
                    <tr key={r.id} className="border-t border-border/70">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{r.name}</div>
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
                        {format(r.travelDate, "PP", { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-center text-foreground/90">
                        {r.guests}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
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
