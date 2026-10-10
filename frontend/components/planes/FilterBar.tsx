"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlanLocation, PlanType } from "@/types/Planes";

interface Props {
  types: PlanType[];
  locations: PlanLocation[];
}

// Barra de filtros del listado: chips de tipo + ubicación + orden + vista.
// La búsqueda vive en el encabezado. Todo vía query params.
export function FilterBar({ types, locations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeType = searchParams.get("type") || "";
  const activeLocation = searchParams.get("location") || "";
  const activeSort = searchParams.get("sort") || "";
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  const push = (params: URLSearchParams, resetPage = true) => {
    if (resetPage) params.set("page", "1");
    router.push(`?${params.toString()}#planes`, { scroll: false });
  };

  const setParam = (name: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    push(params, resetPage);
  };

  const chip = (active: boolean) =>
    cn(
      "min-h-11 rounded-full border-[1.5px] px-[18px] text-[15px] font-semibold transition-all",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border text-foreground hover:border-foreground",
    );

  const selectClass =
    "min-h-11 cursor-pointer appearance-none rounded-full border-[1.5px] border-border bg-card pl-4 pr-10 text-[15px] font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sol";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b-[1.5px] border-border pb-7">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setParam("type", "")} aria-pressed={!activeType} className={chip(!activeType)}>
          Todos
        </button>
        {types.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setParam("type", t.type)}
            aria-pressed={activeType === t.type}
            className={chip(activeType === t.type)}
          >
            {t.type}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {locations.length > 0 && (
          <div className="relative">
            <label htmlFor="filter-location" className="sr-only">Ubicación</label>
            <select
              id="filter-location"
              value={activeLocation}
              onChange={(e) => setParam("location", e.target.value)}
              className={selectClass}
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map((l) => (
                <option key={l.location} value={l.location}>
                  {l.location}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )}
        <div className="relative">
          <label htmlFor="filter-sort" className="sr-only">Ordenar por</label>
          <select
            id="filter-sort"
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className={selectClass}
          >
            <option value="">Más recientes</option>
            <option value="price:asc">Precio: bajo a alto</option>
            <option value="price:desc">Precio: alto a bajo</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div role="group" aria-label="Vista" className="inline-flex rounded-full bg-secondary p-1">
          {(
            [
              { id: "grid", label: "Vista en cuadrícula", Icon: LayoutGrid },
              { id: "list", label: "Vista en lista", Icon: List },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setParam("view", id === "list" ? "list" : "", false)}
              aria-label={label}
              aria-pressed={view === id}
              className={cn(
                "flex h-[38px] w-11 items-center justify-center rounded-full transition-all",
                view === id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
