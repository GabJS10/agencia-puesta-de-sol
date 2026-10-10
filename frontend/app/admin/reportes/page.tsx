import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { expireStaleRequests } from "@/lib/request-workflow";
import { getPipelineCards, getReport, getUpcomingOccupancy, parseReportFilters } from "@/lib/reports";
import { PipelineBoard } from "@/components/admin/pipeline/PipelineBoard";
import { STATUS_META } from "@/lib/request-status";
import { formatPrice } from "@/helpers/formatPrice";
import { formatTravelDay } from "@/lib/format-dates";
import { StatusBadge } from "@/components/requests/StatusBadge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Paleta validada (light #fbf5e9 y dark #211a33): barro = solicitudes, mar = confirmadas.
const C_REQ = "bg-barro";
const C_WON = "bg-mar";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const toInput = (d: Date) => d.toISOString().slice(0, 10);

type SP = Record<string, string | undefined>;

export default async function ReportesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await expireStaleRequests();
  const sp = await searchParams;
  const filters = parseReportFilters(sp);

  const [report, pipeline, occupancy, plans] = await Promise.all([
    getReport(filters),
    getPipelineCards(filters),
    getUpcomingOccupancy(filters.planId),
    prisma.plan.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  const { kpis, byStatus, series, monthly, perPlan, topPlan } = report;

  const qs = new URLSearchParams({
    desde: toInput(filters.from),
    hasta: toInput(filters.to),
    base: filters.base,
    ...(filters.planId ? { plan: String(filters.planId) } : {}),
  }).toString();

  const presets = [30, 90, 365].map((d) => {
    const params = new URLSearchParams({
      dias: String(d),
      base: filters.base,
      ...(filters.planId ? { plan: String(filters.planId) } : {}),
    });
    return { label: `${d} días`, href: `/admin/reportes?${params}`, active: sp.dias === String(d) || (!sp.dias && !sp.desde && d === 90) };
  });

  const seriesMax = Math.max(1, ...series.map((s) => s.total));
  const statusMax = Math.max(1, ...byStatus.map((s) => s.count));
  const soldPlans = perPlan.filter((p) => p.planId !== null).slice(0, 8);
  const planMax = Math.max(1, ...soldPlans.map((p) => p.requests));

  const field =
    "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

  // Métricas principales (las que pide el profesor).
  const mainTiles = [
    { label: "Solicitudes", value: String(kpis.total), hint: `${kpis.inProgress} en proceso` },
    {
      label: "Clientes contactados",
      value: String(kpis.contactedClients),
      hint: `${kpis.contactedRequests} solicitudes contactadas`,
    },
    { label: "Solicitudes efectivas", value: String(kpis.won), hint: "confirmadas + completadas" },
    {
      label: "Efectividad",
      value: pct(kpis.conversion),
      hint: `efectivas / solicitudes · ${pct(kpis.contactedConversion)} de las contactadas`,
    },
  ];

  const detailTiles = [
    { label: "Personas confirmadas", value: String(kpis.guests), hint: "viajeros" },
    { label: "Ingreso estimado", value: formatPrice(kpis.revenue), hint: "precio × personas" },
    {
      label: "Primera respuesta",
      value: kpis.avgResponseHours === null ? "—" : kpis.avgResponseHours < 24 ? `${kpis.avgResponseHours.toFixed(1)} h` : `${(kpis.avgResponseHours / 24).toFixed(1)} d`,
      hint: "promedio hasta la primera acción",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTravelDay(filters.from, "d MMM yyyy")} – {formatTravelDay(filters.to, "d MMM yyyy")} · por fecha de{" "}
            {filters.base === "viaje" ? "viaje" : "solicitud"}
          </p>
        </div>
        <a
          href={`/api/admin/reportes/export?${qs}`}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold hover:bg-surface-hover"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </a>
      </div>

      {/* Filtros: una fila sobre los gráficos */}
      <form action="/admin/reportes" className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1.5">
          {presets.map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className={cn(
                "h-10 rounded-lg px-3 text-sm font-semibold leading-10",
                p.active ? "bg-primary text-primary-foreground" : "border border-border bg-surface hover:bg-surface-hover",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Desde
          <input type="date" name="desde" defaultValue={toInput(filters.from)} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Hasta
          <input type="date" name="hasta" defaultValue={toInput(filters.to)} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Según fecha de
          <select name="base" defaultValue={filters.base} className={field}>
            <option value="solicitud">Solicitud</option>
            <option value="viaje">Viaje</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Plan
          <select name="plan" defaultValue={filters.planId ?? ""} className={cn(field, "w-52")}>
            <option value="">Todos</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
        <button className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          Aplicar
        </button>
      </form>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {mainTiles.map((t) => (
          <Tile key={t.label} {...t} />
        ))}
        <div className="col-span-2 rounded-2xl border border-primary/40 bg-primary/5 p-5 lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Plan más vendido</p>
          {topPlan ? (
            <>
              <p className="mt-2 font-display text-lg font-semibold leading-tight">{topPlan.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {topPlan.won} {topPlan.won === 1 ? "venta" : "ventas"} · {topPlan.guests} personas
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Sin ventas en el periodo</p>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Pipeline de solicitudes</h2>
          <p className="text-sm text-muted-foreground">
            Cada columna es una etapa. Arrastra una tarjeta a otra columna para cambiar su estado: solo se
            resaltan los cambios permitidos y siempre se confirma antes de avisar al cliente.
          </p>
        </div>
        <PipelineBoard cards={pipeline} />
      </section>

      {/* Planes vendidos */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Planes vendidos</h2>
          <Legend wonLabel="Vendidas" />
        </div>
        {soldPlans.length === 0 ? (
          <Empty />
        ) : (
          <ul className="space-y-3">
            {soldPlans.map((p, i) => (
              <li key={p.planId ?? "none"} title={`${p.title}: ${p.won} vendidas de ${p.requests} solicitudes`}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="truncate">
                    <span className="mr-1.5 tabular-nums text-muted-foreground">{i + 1}.</span>
                    {p.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    <strong className="text-foreground">{p.won}</strong> vendidas · {p.requests} solicitudes
                  </span>
                </div>
                <div className="space-y-[2px]">
                  <div className={cn("h-2 rounded-r-[4px]", C_REQ)} style={{ width: `${(p.requests / planMax) * 100}%` }} />
                  <div className={cn("h-2 rounded-r-[4px]", C_WON)} style={{ width: `${Math.max(p.won ? 1 : 0, (p.won / planMax) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Detalle */}
      <h2 className="border-t border-border pt-8 font-display text-xl font-semibold">Detalle</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {detailTiles.map((t) => (
          <Tile key={t.label} {...t} />
        ))}
      </div>

      {/* Solicitudes en el tiempo */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            Solicitudes por {monthly ? "mes" : "semana"}
          </h2>
          <Legend />
        </div>
        {kpis.total === 0 ? (
          <Empty />
        ) : (
          <div className="flex h-56 items-end gap-[2px] border-b border-border">
            {series.map((s) => (
              <div
                key={s.label}
                className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${s.label}: ${s.total} solicitudes, ${s.won} confirmadas`}
              >
                <span className="mb-1 text-center text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100">
                  {s.total}
                </span>
                <div className="flex items-end justify-center gap-[2px] rounded-t-[4px] group-hover:bg-muted/50">
                  <div className={cn("w-full max-w-5 rounded-t-[4px]", C_REQ)} style={{ height: `${(s.total / seriesMax) * 190}px` }} />
                  <div className={cn("w-full max-w-5 rounded-t-[4px]", C_WON)} style={{ height: `${(s.won / seriesMax) * 190}px` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {kpis.total > 0 && (
          <div className="mt-2 flex gap-[2px] text-[10px] text-muted-foreground">
            {series.map((s, i) => (
              <span key={s.label} className="min-w-0 flex-1 truncate text-center">
                {i % Math.ceil(series.length / 8) === 0 ? s.label : ""}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Embudo por estado */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Por estado</h2>
          <ul className="space-y-2.5">
            {byStatus.map((s) => (
              <li key={s.status} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm" title={`${STATUS_META[s.status].plural}: ${s.count}`}>
                <StatusBadge status={s.status} className="justify-center px-2 py-0.5" />
                <div className="h-3 rounded-r-[4px] bg-muted/40">
                  <div className={cn("h-3 rounded-r-[4px]", C_REQ)} style={{ width: `${(s.count / statusMax) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Rechazo {pct(kpis.rejectedRate)} · Cancelación {pct(kpis.cancelledRate)} · Vencimiento {pct(kpis.expiredRate)}
          </p>
        </section>

        {/* Ocupación próxima */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Ocupación confirmada · próximos 30 días</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Aforo: cupos confirmados sobre cupo × 30 días. Exclusivos: días reservados sobre 30.
          </p>
          {occupancy.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2.5">
              {occupancy.map((o) => (
                <li key={o.id} className="grid grid-cols-[minmax(0,10rem)_1fr_7.5rem] items-center gap-3 text-sm" title={`${o.title}: ${o.used} de ${o.available} ${o.unit}`}>
                  <Link href={`/admin/planes/${o.id}/disponibilidad`} className="truncate hover:text-primary">
                    {o.title}
                  </Link>
                  <div className="h-3 rounded-r-[4px] bg-muted/40">
                    <div className={cn("h-3 rounded-r-[4px]", C_WON)} style={{ width: `${Math.min(100, o.ratio * 100)}%` }} />
                  </div>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {pct(o.ratio)} · {o.used}/{o.available} {o.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>


      {/* Tabla por plan */}
      <section className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 text-right font-medium">Solicitudes</th>
              <th className="p-3 text-right font-medium">Confirmadas</th>
              <th className="p-3 text-right font-medium">Conversión</th>
              <th className="p-3 text-right font-medium">Personas</th>
              <th className="p-3 text-right font-medium">Ingreso estimado</th>
            </tr>
          </thead>
          <tbody>
            {perPlan.map((p) => (
              <tr key={p.planId ?? "none"} className="border-t border-border">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-right tabular-nums">{p.requests}</td>
                <td className="p-3 text-right tabular-nums">{p.won}</td>
                <td className="p-3 text-right tabular-nums">{pct(p.conversion)}</td>
                <td className="p-3 text-right tabular-nums">{p.guests}</td>
                <td className="p-3 text-right tabular-nums">{formatPrice(p.revenue)}</td>
              </tr>
            ))}
            {perPlan.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">Sin datos en este periodo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Legend({ wonLabel = "Confirmadas" }: { wonLabel?: string }) {
  return (
    <div className="flex gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-2.5 w-2.5 rounded-sm", C_REQ)} /> Solicitudes
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-2.5 w-2.5 rounded-sm", C_WON)} /> {wonLabel}
      </span>
    </div>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos en este periodo.</p>;
}
