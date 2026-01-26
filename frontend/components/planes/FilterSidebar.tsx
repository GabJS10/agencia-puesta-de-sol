"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanLocation, PlanType } from "@/types/Planes";

interface FilterSidebarProps {
  locations: PlanLocation[];
  types: PlanType[];
}

interface FilterSectionProps {
  title: string;
  options: { label: string; value: string }[];
  paramName: string;
}

function FilterSection({ title, options, paramName }: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValues = searchParams.getAll(paramName);

  const handleCheckboxChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const values = new Set(currentValues);

    if (values.has(value)) {
      console.log(`Deleting value: ${value}`, values);
      console.log(params);
      values.delete(value);
      params.delete(paramName);
      values.forEach((v) => params.append(paramName, v));
    } else {
      params.append(paramName, value);
    }

    // Reset page to 1 on filter change
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  return (
    <details
      className="group py-5 border-b border-border/50 last:border-0"
      open
    >
      <summary className="flex items-center justify-between cursor-pointer list-none text-foreground font-semibold text-lg hover:text-primary transition-colors">
        {title}
        <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="mt-4 flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer group/item hover:bg-surface-hover p-2 rounded-md -mx-2 transition-colors"
          >
            <input
              type="checkbox"
              checked={currentValues.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors font-medium">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </details>
  );
}

export function FilterSidebar({ locations, types }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-surface rounded-2xl border border-border p-6 h-fit lg:sticky lg:top-24 shadow-sm">
      <FilterSection
        title="Tipo de producto"
        paramName="type"
        options={types.map((t) => ({ label: t.type, value: t.type }))}
      />
      <FilterSection
        title="Ubicación"
        paramName="location"
        options={locations.map((l) => ({
          label: l.location,
          value: l.location,
        }))}
      />
    </aside>
  );
}
