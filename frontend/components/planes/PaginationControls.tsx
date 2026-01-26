"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  pageCount: number;
  page: number;
}

export function PaginationControls({
  pageCount,
  page,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}#planes`, { scroll: false });
  };

  if (pageCount <= 1) {
    return (
      <div className="mt-16 flex justify-center gap-2">
        <button
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors font-medium text-sm",
            "bg-primary text-primary-foreground shadow-md font-bold",
          )}
        >
          {page}
        </button>
      </div>
    );
  }
  return (
    <div className="mt-16 flex justify-center gap-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors font-medium text-sm",
            p === page
              ? "bg-primary text-primary-foreground shadow-md font-bold"
              : "bg-surface border border-border hover:bg-surface-hover",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
