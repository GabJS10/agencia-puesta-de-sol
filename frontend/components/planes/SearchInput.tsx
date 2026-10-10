"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Buscador del encabezado de /planes: pastilla clara sobre el hero oscuro.
export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 on search

    router.push(`?${params.toString()}#planes`, { scroll: false });
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex h-[60px] w-full max-w-[560px] items-center gap-3 rounded-full bg-[#fbf5e9] pl-5 pr-2 text-[#2a2018] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] transition-shadow focus-within:shadow-[0_0_0_3px_#f5a538,0_18px_40px_-18px_rgba(0,0,0,0.5)]"
    >
      <Search className="h-[22px] w-[22px] shrink-0 text-[#7a6a55]" aria-hidden="true" />
      <label htmlFor="planes-search" className="sr-only">
        Buscar planes
      </label>
      <input
        id="planes-search"
        type="search"
        placeholder="Busca un destino: Cabo, Taroa, Manaure…"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[17px] font-medium placeholder:text-[#7a6a55] focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-11 shrink-0 rounded-full bg-sol px-5 text-[15px] font-bold text-[#2a1a0a] transition-colors hover:bg-[#f7b456]"
      >
        Buscar
      </button>
    </form>
  );
}
