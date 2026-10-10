import { requireAdmin } from "@/lib/auth";
import { getReportRows, parseReportFilters } from "@/lib/reports";
import { STATUS_META } from "@/lib/request-status";
import { lastDayUtc, toDayKey } from "@/lib/date-range";
import { formatInstant } from "@/lib/format-dates";

export const runtime = "nodejs";

// Excel en español usa ";" como separador; el BOM asegura UTF-8 (tildes).
function cell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return new Response("No autorizado", { status: 403 });

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const filters = parseReportFilters(sp);
  const rows = await getReportRows(filters);

  const header = [
    "ID", "Fecha solicitud", "Plan", "Cliente", "Correo", "Teléfono",
    "Inicio", "Fin", "Personas", "Estado", "Precio por persona", "Valor estimado",
  ];
  const lines = rows.map((r) =>
    [
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
    ]
      .map(cell)
      .join(";"),
  );
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const name = `solicitudes_${toDayKey(filters.from)}_${toDayKey(filters.to)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
