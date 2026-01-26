"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

    router.push(`?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex items-center shadow-2xl md:mb-2"
    >
      <div className="pl-4 pr-2 text-white/70">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="Buscar experiencia..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none px-2 py-2 text-base font-light"
      />
    </form>
  );
}
