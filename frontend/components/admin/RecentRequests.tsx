"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/requests/StatusBadge";
import type { RequestStatus } from "@/lib/request-status";

export interface RecentRequestRow {
  id: number;
  name: string;
  email: string;
  planTitle: string | null;
  planSlug: string | null;
  travel: string;
  guests: number;
  status: RequestStatus;
}

const FILTERS: { id: string; label: string; statuses: RequestStatus[] | null }[] = [
  { id: "all", label: "Todas", statuses: null },
  { id: "open", label: "Abiertas", statuses: ["PENDING", "CONTACTED"] },
  { id: "confirmed", label: "Confirmadas", statuses: ["CONFIRMED"] },
  { id: "closed", label: "Cerradas", statuses: ["COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"] },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Tabla de solicitudes recientes del dashboard, filtrable por grupo de estados.
export function RecentRequests({ rows }: { rows: RecentRequestRow[] }) {
  const [filter, setFilter] = useState("all");
  const statuses = FILTERS.find((f) => f.id === filter)?.statuses;
  const visible = statuses ? rows.filter((r) => statuses.includes(r.status)) : rows;

  return (
    <section className="overflow-hidden rounded-[22px] bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-extrabold">Solicitudes recientes</h2>
          <Link href="/admin/solicitudes" className="text-sm font-bold text-barro hover:text-primary">
            Ver todas →
          </Link>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "min-h-10 rounded-full px-3.5 text-sm font-bold transition-colors",
                filter === f.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border-t border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? "Aún no hay solicitudes." : "No hay solicitudes recientes en este grupo."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <th className="py-2.5 pl-6 pr-4">Cliente</th>
                <th className="px-4 py-2.5">Plan</th>
                <th className="px-4 py-2.5">Fecha viaje</th>
                <th className="px-4 py-2.5 text-center">Personas</th>
                <th className="py-2.5 pl-4 pr-6">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border/60 transition-colors hover:bg-background/60">
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-extrabold">
                        {initials(r.name)}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/admin/solicitudes/${r.id}`} className="font-bold text-foreground hover:text-primary">
                          {r.name}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-foreground/90">
                    {r.planSlug ? (
                      <Link href={`/planes/${r.planSlug}`} className="hover:text-primary">
                        {r.planTitle}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-foreground/90">{r.travel}</td>
                  <td className="px-4 py-4 text-center text-foreground/90">{r.guests}</td>
                  <td className="py-4 pl-4 pr-6">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
