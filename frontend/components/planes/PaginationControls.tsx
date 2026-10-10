"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  pageCount: number;
  page: number;
}

// Construye la ventana de páginas: 1 … actual-1, actual, actual+1 … última,
// con "…" donde hay saltos. Devuelve números y marcadores de elipsis.
function buildPages(page: number, pageCount: number): (number | "…")[] {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function PaginationControls({ pageCount, page }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Una sola página (o ninguna): no hay nada que paginar.
  if (pageCount <= 1) return null;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}#planes`, { scroll: false });
  };

  const pages = buildPages(page, pageCount);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <nav
      aria-label="Paginación"
      className="mt-16 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={atStart}
        aria-label="Página anterior"
        className={arrow}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-label={`Ir a la página ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold transition-colors",
              p === page
                ? "bg-sol text-[#2a1a0a] shadow-sm"
                : "border-[1.5px] border-border text-foreground hover:border-foreground",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={atEnd}
        aria-label="Página siguiente"
        className={arrow}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
