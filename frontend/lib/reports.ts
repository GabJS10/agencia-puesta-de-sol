// Métricas del apartado de reportes. El volumen es pequeño (una agencia), así
// que se trae lo necesario con Prisma y se agrega en JS.
import "server-only";
import type { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { eachDayKey, startOfDayUtc, utcDayAsLocal } from "@/lib/date-range";
import { STATUS_ORDER } from "@/lib/request-status";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type ReportBase = "solicitud" | "viaje";

export type ReportFilters = {
  from: Date; // inclusive (día UTC)
  to: Date; // inclusive (día UTC)
  base: ReportBase;
  planId: number | null;
};

const WON: RequestStatus[] = ["CONFIRMED", "COMPLETED"];
const DAY = 24 * 3600_000;

/** Lee los filtros de los searchParams (por defecto: últimos 90 días por fecha de solicitud). */
export function parseReportFilters(sp: Record<string, string | undefined>): ReportFilters {
  const today = startOfDayUtc(new Date());
  const parse = (v?: string) => {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const days = Number(sp.dias);
  const to = parse(sp.hasta) ?? today;
  const from =
    parse(sp.desde) ?? new Date(to.getTime() - ((days > 0 ? days : 90) - 1) * DAY);
  return {
    from: from <= to ? from : to,
    to,
    base: sp.base === "viaje" ? "viaje" : "solicitud",
    planId: Number(sp.plan) || null,
  };
}

export function reportWhere(f: ReportFilters): Prisma.PlanRequestWhereInput {
  const range = { gte: f.from, lt: new Date(f.to.getTime() + DAY) };
  return {
    ...(f.planId ? { planId: f.planId } : {}),
    ...(f.base === "viaje" ? { travelDate: range } : { createdAt: range }),
  };
}

export async function getReport(f: ReportFilters) {
  const rows = await prisma.planRequest.findMany({
    where: reportWhere(f),
    select: {
      id: true,
      status: true,
      planId: true,
      guests: true,
      unitPrice: true,
      createdAt: true,
      travelDate: true,
      events: {
        where: { actor: "ADMIN" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  // KPIs
  const total = rows.length;
  const won = rows.filter((r) => WON.includes(r.status));
  const count = (s: RequestStatus) => rows.filter((r) => r.status === s).length;
  const responded = rows.filter((r) => r.events[0]);
  const avgResponseHours =
    responded.length > 0
      ? responded.reduce(
          (acc, r) => acc + (r.events[0].createdAt.getTime() - r.createdAt.getTime()),
          0,
        ) /
        responded.length /
        3600_000
      : null;
  const rate = (n: number) => (total ? n / total : 0);

  const kpis = {
    total,
    won: won.length,
    conversion: rate(won.length),
    guests: won.reduce((acc, r) => acc + r.guests, 0),
    revenue: won.reduce((acc, r) => acc + (r.unitPrice ?? 0) * r.guests, 0),
    inProgress: count("PENDING") + count("CONTACTED"),
    rejectedRate: rate(count("REJECTED")),
    cancelledRate: rate(count("CANCELLED")),
    expiredRate: rate(count("EXPIRED")),
    avgResponseHours,
  };

  // Embudo por estado
  const byStatus = STATUS_ORDER.map((status) => ({ status, count: count(status) }));

  // Serie temporal: semanas si el rango es corto, meses si es largo.
  const spanDays = Math.round((f.to.getTime() - f.from.getTime()) / DAY) + 1;
  const monthly = spanDays > 120;
  const bucketStart = (d: Date) => {
    const day = startOfDayUtc(d);
    if (monthly) return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
    const dow = (day.getUTCDay() + 6) % 7; // lunes = 0
    return new Date(day.getTime() - dow * DAY);
  };
  const buckets = new Map<number, { total: number; won: number }>();
  for (
    let b = bucketStart(f.from);
    b <= f.to;
    b = monthly
      ? new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + 1, 1))
      : new Date(b.getTime() + 7 * DAY)
  ) {
    buckets.set(b.getTime(), { total: 0, won: 0 });
  }
  for (const r of rows) {
    const key = bucketStart(f.base === "viaje" ? r.travelDate : r.createdAt).getTime();
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total++;
    if (WON.includes(r.status)) bucket.won++;
  }
  const series = Array.from(buckets, ([t, v]) => ({
    label: format(utcDayAsLocal(new Date(t)), monthly ? "MMM yyyy" : "d MMM", { locale: es }),
    ...v,
  }));

  // Por plan
  const plans = await prisma.plan.findMany({
    select: { id: true, title: true },
  });
  const title = new Map(plans.map((p) => [p.id, p.title]));
  const perPlanMap = new Map<
    number | null,
    { requests: number; won: number; guests: number; revenue: number }
  >();
  for (const r of rows) {
    const acc = perPlanMap.get(r.planId) ?? { requests: 0, won: 0, guests: 0, revenue: 0 };
    acc.requests++;
    if (WON.includes(r.status)) {
      acc.won++;
      acc.guests += r.guests;
      acc.revenue += (r.unitPrice ?? 0) * r.guests;
    }
    perPlanMap.set(r.planId, acc);
  }
  const perPlan = Array.from(perPlanMap, ([planId, v]) => ({
    planId,
    title: planId ? (title.get(planId) ?? `Plan #${planId}`) : "Sin plan",
    ...v,
    conversion: v.requests ? v.won / v.requests : 0,
  })).sort((a, b) => b.requests - a.requests);

  return { kpis, byStatus, series, monthly, perPlan };
}

const OCCUPANCY_DAYS = 30;

/** Ocupación confirmada de cada plan publicado en los próximos 30 días. */
export async function getUpcomingOccupancy(planId: number | null) {
  const from = startOfDayUtc(new Date());
  const to = new Date(from.getTime() + OCCUPANCY_DAYS * DAY);
  const plans = await prisma.plan.findMany({
    where: { published: true, ...(planId ? { id: planId } : {}) },
    select: {
      id: true,
      title: true,
      availabilityMode: true,
      capacity: true,
      requests: {
        where: {
          status: "CONFIRMED",
          travelDate: { lt: to },
          OR: [{ endDate: { gt: from } }, { endDate: null, travelDate: { gte: from } }],
        },
        select: { travelDate: true, endDate: true, guests: true },
      },
    },
    orderBy: { title: "asc" },
  });

  const windowDays = new Set(eachDayKey(from, to));
  return plans
    .map((p) => {
      const perDay = new Map<string, number>();
      for (const r of p.requests) {
        for (const key of eachDayKey(r.travelDate, r.endDate)) {
          if (windowDays.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + r.guests);
        }
      }
      const isCapacity = p.availabilityMode === "CAPACITY" && p.capacity;
      const used = isCapacity
        ? Array.from(perDay.values()).reduce((a, g) => a + Math.min(g, p.capacity!), 0)
        : perDay.size;
      const available = isCapacity ? p.capacity! * OCCUPANCY_DAYS : OCCUPANCY_DAYS;
      return {
        id: p.id,
        title: p.title,
        unit: isCapacity ? "cupos" : "días",
        used,
        available,
        ratio: available ? used / available : 0,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

/** Filas para exportar a CSV. */
export async function getReportRows(f: ReportFilters) {
  return prisma.planRequest.findMany({
    where: reportWhere(f),
    include: { plan: { select: { title: true } } },
    orderBy: { createdAt: "asc" },
  });
}
