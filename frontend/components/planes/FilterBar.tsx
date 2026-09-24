"use client";

import { Search, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlanLocation, PlanType } from "@/types/Planes";

interface Props {
  types: PlanType[];
  locations: PlanLocation[];
}

// Barra de filtros horizontal del listado (mockup dirección 1):
// búsqueda + chips de tipo + ubicación + orden. Todo vía query params.
export function FilterBar({ types, locations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const activeType = searchParams.get("type") || "";
  const activeLocation = searchParams.get("location") || "";
  const activeSort = searchParams.get("sort") || "";

  const push = (params: URLSearchParams) => {
    params.set("page", "1");
    router.push(`?${params.toString()}#planes`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) params.set("search", searchValue);
    else params.delete("search");
    push(params);
  };

  const setType = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    if (value) params.set("type", value);
    push(params);
  };

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    push(params);
  };

  const selectClass =
    "appearance-none rounded-lg border border-border bg-background py-2.5 pl-4 pr-10 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Búsqueda */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar destino…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </form>

        {/* Chips de tipo */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setType("")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              !activeType
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground/80 hover:border-primary/50",
            )}
          >
            Todos
          </button>
          {types.map((t) => (
            <button
              key={t.type}
              onClick={() => setType(t.type)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                activeType === t.type
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground/80 hover:border-primary/50",
              )}
            >
              {t.type}
            </button>
          ))}
        </div>

        {/* Ubicación + orden */}
        <div className="flex items-center gap-2">
          {locations.length > 0 && (
            <div className="relative">
              <select
                value={activeLocation}
                onChange={(e) => setParam("location", e.target.value)}
                className={selectClass}
              >
                <option value="">Ubicación</option>
                {locations.map((l) => (
                  <option key={l.location} value={l.location}>
                    {l.location}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => setParam("sort", e.target.value)}
              className={selectClass}
            >
              <option value="">Ordenar</option>
              <option value="price:asc">Precio: bajo a alto</option>
              <option value="price:desc">Precio: alto a bajo</option>
              <option value="createdAt:desc">Más recientes</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
