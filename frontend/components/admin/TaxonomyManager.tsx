"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface TaxonomyManagerProps {
  items: { id: number; label: string }[];
  createEndpoint: string; // p.ej. /api/admin/plan-types
  deleteBase: string; // p.ej. /api/admin/plan-types
  fieldName: string; // "type" | "location"
  placeholder: string;
}

export function TaxonomyManager({
  items,
  createEndpoint,
  deleteBase,
  fieldName,
  placeholder,
}: TaxonomyManagerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!value.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(createEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo agregar");
        return;
      }
      setValue("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("¿Eliminar? Los planes que lo usen quedarán sin esta categoría.")) return;
    const res = await fetch(`${deleteBase}/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleAdd} className="mb-6 flex gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-brasa">{error}</p>}

      {items.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay elementos.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-foreground">{item.label}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-brasa transition-colors hover:text-brasa/70"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
