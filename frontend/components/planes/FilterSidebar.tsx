import { ChevronDown } from "lucide-react";

interface FilterSectionProps {
  title: string;
  options: string[];
}

function FilterSection({ title, options }: FilterSectionProps) {
  return (
    <details className="group py-5 border-b border-border/50 last:border-0" open>
      <summary className="flex items-center justify-between cursor-pointer list-none text-foreground font-semibold text-lg hover:text-primary transition-colors">
        {title}
        <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="mt-4 flex flex-col gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer group/item hover:bg-surface-hover p-2 rounded-md -mx-2 transition-colors">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary" 
            />
            <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors font-medium">
              {option}
            </span>
          </label>
        ))}
      </div>
    </details>
  );
}

export function FilterSidebar() {
  const filters = [
    { title: "Tipo de producto", options: ["Tour", "Pasadia"] },
    { title: "Ubicación", options: ["La Guajira", "Santa Marta", "Valledupar"] },
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-surface rounded-2xl border border-border p-6 h-fit lg:sticky lg:top-24 shadow-sm">
      {filters.map((f) => (
        <FilterSection key={f.title} {...f} />
      ))}
    </aside>
  );
}
