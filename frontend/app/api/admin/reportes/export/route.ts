import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getReport, getReportRows, parseReportFilters, type ReportFilters } from "@/lib/reports";
import { STATUS_META } from "@/lib/request-status";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";
import { lastDayUtc, toDayKey } from "@/lib/date-range";
import { formatInstant } from "@/lib/format-dates";

export const runtime = "nodejs";

type Value = string | number | null | undefined;

// Excel en español usa ";" como separador; el BOM asegura UTF-8 (tildes).
function cell(value: Value): string {
  const s = value == null ? "" : String(value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: Value[][]): string {
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
}

const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const round = (n: number) => Math.round(n);

async function solicitudes(f: ReportFilters): Promise<string> {
  const rows = await getReportRows(f);
  return toCsv(
    [
      "ID", "Fecha solicitud", "Plan", "Cliente", "Correo", "Teléfono",
      "Inicio", "Fin", "Personas", "Estado", "Precio por persona", "Valor estimado",
    ],
    rows.map((r) => [
      r.id,
      formatInstant(r.createdAt, "yyyy-MM-dd HH:mm"),
      r.plan?.title ?? "",
      r.name,
      r.email,
      r.phone,
      toDayKey(r.travelDate),
      toDayKey(lastDayUtc(r.travelDate, r.endDate)),
      r.guests,
      STATUS_META[r.status].label,
      r.unitPrice ?? "",
      r.unitPrice ? r.unitPrice * r.guests : "",
    ]),
  );
}

async function resumen(f: ReportFilters): Promise<string> {
  const [{ kpis, topPlan }, plan] = await Promise.all([
    getReport(f),
    f.planId ? prisma.plan.findUnique({ where: { id: f.planId }, select: { title: true } }) : null,
  ]);
  return toCsv(
    ["Métrica", "Valor"],
    [
      ["Periodo", `${toDayKey(f.from)} a ${toDayKey(f.to)}`],
      ["Según fecha de", f.base === "viaje" ? "Viaje" : "Solicitud"],
      ["Plan", plan?.title ?? "Todos"],
      ["Solicitudes", kpis.total],
      ["En proceso", kpis.inProgress],
      ["Clientes contactados", kpis.contactedClients],
      ["Solicitudes contactadas", kpis.contactedRequests],
      ["Solicitudes efectivas", kpis.won],
      ["Efectividad (efectivas / solicitudes)", pct(kpis.conversion)],
      ["Efectividad sobre contactadas", pct(kpis.contactedConversion)],
      ["Plan más vendido", topPlan?.title ?? "—"],
      ["Ventas del plan más vendido", topPlan?.won ?? 0],
      ["Personas confirmadas", kpis.guests],
      ["Ingreso estimado", round(kpis.revenue)],
      [
        "Primera respuesta promedio (h)",
        kpis.avgResponseHours === null ? "" : Math.round(kpis.avgResponseHours * 10) / 10,
      ],
      ["Tasa de rechazo", pct(kpis.rejectedRate)],
      ["Tasa de cancelación", pct(kpis.cancelledRate)],
      ["Tasa de vencimiento", pct(kpis.expiredRate)],
    ],
  );
}

async function planes(f: ReportFilters): Promise<string> {
  const { perPlan } = await getReport(f);
  return toCsv(
    ["Plan", "Solicitudes", "Vendidas", "Conversión", "Personas", "Ingreso estimado"],
    perPlan.map((p) => [p.title, p.requests, p.won, pct(p.conversion), p.guests, round(p.revenue)]),
  );
}

async function estados(f: ReportFilters): Promise<string> {
  const { byStatus, kpis } = await getReport(f);
  const count = new Map(byStatus.map((s) => [s.status, s.count]));
  return toCsv(
    ["Etapa del pipeline", "Estado", "Cantidad", "% del total"],
    PIPELINE_STAGES.flatMap((stage) =>
      stage.statuses.map((status) => {
        const n = count.get(status) ?? 0;
        return [stage.title, STATUS_META[status].label, n, kpis.total ? pct(n / kpis.total) : "0%"];
      }),
    ),
  );
}

async function serie(f: ReportFilters): Promise<string> {
  const { series, monthly } = await getReport(f);
  return toCsv(
    [monthly ? "Mes" : "Semana (desde el lunes)", "Solicitudes", "Efectivas"],
    series.map((s) => [s.label, s.total, s.won]),
  );
}

const EXPORTS = { solicitudes, resumen, planes, estados, serie } as const;
type Tipo = keyof typeof EXPORTS;

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return new Response("No autorizado", { status: 403 });

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const tipo = (sp.tipo || "solicitudes") as Tipo;
  if (!Object.hasOwn(EXPORTS, tipo)) return new Response("Tipo de reporte inválido", { status: 400 });

  const filters = parseReportFilters(sp);
  const csv = await EXPORTS[tipo](filters);
  const name = `${tipo}_${toDayKey(filters.from)}_${toDayKey(filters.to)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
