"use client";

import { DropdownMenu } from "radix-ui";
import { ChevronDown, Download } from "lucide-react";

const OPTIONS = [
  { tipo: "solicitudes", title: "Solicitudes (detalle)", desc: "Una fila por solicitud: cliente, plan, fechas, estado y valor." },
  { tipo: "resumen", title: "Resumen de métricas", desc: "Solicitudes, contactados, efectivas, efectividad, plan más vendido…" },
  { tipo: "planes", title: "Planes vendidos", desc: "Por plan: solicitudes, vendidas, conversión, personas e ingreso." },
  { tipo: "estados", title: "Pipeline y estados", desc: "Cantidad por etapa del pipeline y por estado." },
  { tipo: "serie", title: "Serie temporal", desc: "Solicitudes y efectivas por semana o mes." },
] as const;

/** Menú de exportación: cada opción descarga un CSV con los filtros actuales (`qs`). */
export function ExportMenu({ qs }: { qs: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/40">
        <Download className="h-4 w-4" />
        Exportar
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-80 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
        >
          <DropdownMenu.Label className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">
            Descargar CSV
          </DropdownMenu.Label>
          {OPTIONS.map((o) => (
            <DropdownMenu.Item key={o.tipo} asChild>
              <a
                href={`/api/admin/reportes/export?tipo=${o.tipo}&${qs}`}
                download
                className="block cursor-pointer rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-surface-hover"
              >
                <span className="block text-sm font-semibold">{o.title}</span>
                <span className="block text-xs text-muted-foreground">{o.desc}</span>
              </a>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <p className="px-3 pb-1.5 pt-1 text-xs text-muted-foreground">
            Se aplican los filtros actuales (periodo, base de fecha y plan).
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
