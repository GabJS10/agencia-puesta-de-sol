"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative group">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-surface border border-border hover:border-primary/50 rounded-full px-6 py-2.5 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-foreground"
      >
        <option value="">Ordenar por</option>
        <option value="price:asc">Precio: bajo a alto</option>
        <option value="price:desc">Precio: alto a bajo</option>
        <option value="createdAt:desc">Más recientes</option>
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
    </div>
  );
}
