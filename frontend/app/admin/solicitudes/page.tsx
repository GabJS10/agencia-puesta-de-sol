import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { expireStaleRequests } from "@/lib/request-workflow";
import { STATUS_META, STATUS_ORDER, type RequestStatus } from "@/lib/request-status";
import { formatInstant, formatTravelRange } from "@/lib/format-dates";
import { startOfDayUtc } from "@/lib/date-range";
import { RequestActions } from "@/components/admin/RequestActions";
import { HoldBadge, StatusBadge } from "@/components/requests/StatusBadge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SP = {
  estado?: string;
  plan?: string;
  q?: string;
  desde?: string;
  hasta?: string;
  page?: string;
};

function parseDay(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await expireStaleRequests();

  const sp = await searchParams;
  const estado = STATUS_ORDER.includes(sp.estado as RequestStatus)
    ? (sp.estado as RequestStatus)
    : null;
  const planId = Number(sp.plan) || null;
  const q = sp.q?.trim() || "";
  const desde = parseDay(sp.desde);
  const hasta = parseDay(sp.hasta);
  const page = Math.max(1, Number(sp.page) || 1);

  // Filtros comunes (sin estado): los conteos de las pestañas los respetan.
  const base: Prisma.PlanRequestWhereInput = {
    ...(planId ? { planId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
    ...(desde || hasta
      ? {
          travelDate: {
            ...(desde ? { gte: desde } : {}),
            ...(hasta ? { lte: hasta } : {}),
          },
        }
      : {}),
  };
  const where: Prisma.PlanRequestWhereInput = estado ? { ...base, status: estado } : base;

  const [requests, total, counts, plans] = await Promise.all([
    prisma.planRequest.findMany({
      where,
      include: {
        plan: { select: { title: true } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.planRequest.count({ where }),
    prisma.planRequest.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
    prisma.plan.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Partial<
    Record<RequestStatus, number>
  >;
  const allCount = counts.reduce((acc, c) => acc + c._count._all, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const today = startOfDayUtc(new Date());

  const href = (patch: Partial<SP>) => {
    const params = new URLSearchParams();
    const merged: SP = { ...sp, page: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, String(v));
    const qs = params.toString();
    return qs ? `/admin/solicitudes?${qs}` : "/admin/solicitudes";
  };

  const tabs: { key: RequestStatus | null; label: string; count: number }[] = [
    { key: null, label: "Todas", count: allCount },
    ...STATUS_ORDER.map((s) => ({ key: s, label: STATUS_META[s].plural, count: countBy[s] ?? 0 })),
  ];

  const field =
    "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold">Solicitudes</h1>

      {/* Pestañas por estado */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.key ?? "all"}
            href={href({ estado: t.key ?? undefined })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              estado === t.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-surface text-foreground/70 hover:border-primary/40",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 tabular-nums",
                estado === t.key ? "bg-black/10" : "bg-muted",
              )}
            >
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Filtros (GET, sin JS) */}
      <form className="mb-6 flex flex-wrap items-end gap-3" action="/admin/solicitudes">
        {estado && <input type="hidden" name="estado" value={estado} />}
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Buscar
          <input name="q" defaultValue={q} placeholder="Nombre, correo o teléfono" className={cn(field, "w-60")} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Plan
          <select name="plan" defaultValue={planId ?? ""} className={cn(field, "w-52")}>
            <option value="">Todos</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Viaje desde
          <input type="date" name="desde" defaultValue={sp.desde ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          hasta
          <input type="date" name="hasta" defaultValue={sp.hasta ?? ""} className={field} />
        </label>
        <button className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          Filtrar
        </button>
        {(q || planId || desde || hasta) && (
          <Link href={href({ q: undefined, plan: undefined, desde: undefined, hasta: undefined })} className="h-10 px-2 text-sm leading-10 text-muted-foreground hover:text-foreground">
            Limpiar
          </Link>
        )}
      </form>

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No hay solicitudes en esta vista.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Cliente</th>
                <th className="p-3 font-medium">Plan</th>
                <th className="p-3 font-medium">Viaje</th>
                <th className="p-3 font-medium">Pers.</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <Link href={`/admin/solicitudes/${r.id}`} className="font-semibold text-barro hover:text-primary">
                      #{r.id}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/solicitudes/${r.id}`} className="font-medium text-foreground hover:text-primary">
                      {r.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.email} · {r.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.user ? "Registrado" : "Invitado"} · solicitó el{" "}
                      {formatInstant(r.createdAt, "d MMM")}
                    </p>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.plan?.title ?? "—"}</td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {formatTravelRange(r.travelDate, r.endDate)}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.guests}</td>
                  <td className="p-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={r.status} />
                      <HoldBadge status={r.status} holdExpiresAt={r.holdExpiresAt} />
                    </div>
                  </td>
                  <td className="p-3">
                    <RequestActions
                      id={r.id}
                      status={r.status}
                      canComplete={r.travelDate <= today}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {pages} · {total} solicitudes
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href({ page: String(page - 1) })} className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface-hover">
                ← Anterior
              </Link>
            )}
            {page < pages && (
              <Link href={href({ page: String(page + 1) })} className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface-hover">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
