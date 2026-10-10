"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Blackout {
  id: number;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd (exclusivo)
  reason: string | null;
}

export function BlackoutManager({
  planId,
  initial,
}: {
  planId: number;
  initial: Blackout[];
}) {
  const router = useRouter();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!start) {
      setError("Indica la fecha de inicio");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/planes/${planId}/blackouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: start,
          endDate: end || start,
          reason: reason || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? "No se pudo crear el bloqueo");
        return;
      }
      setStart("");
      setEnd("");
      setReason("");
      toast.success("Fechas bloqueadas");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/planes/${planId}/blackouts/${id}`, { method: "DELETE" });
    if (res.ok) toast.success("Bloqueo eliminado");
    else toast.error("No se pudo eliminar el bloqueo");
    router.refresh();
  }

  const field =
    "h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus:border-primary";

  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Fechas bloqueadas</h2>
        <p className="text-sm text-muted-foreground">
          Bloquea días por mantenimiento, clima o cupo. La fecha fin es exclusiva
          (déjala vacía para bloquear un solo día).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {initial.length === 0 && (
          <li className="text-sm text-muted-foreground">No hay fechas bloqueadas.</li>
        )}
        {initial.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
          >
            <span>
              <strong>{b.startDate}</strong> → {b.endDate}{" "}
              <span className="text-muted-foreground">(fin exclusivo)</span>
              {b.reason && <span className="text-muted-foreground"> · {b.reason}</span>}
            </span>
            <button
              type="button"
              onClick={() => remove(b.id)}
              className="text-brasa hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Inicio</label>
          <input type="date" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Fin (exclusivo, opcional)</label>
          <input type="date" className={field} value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium">Motivo (opcional)</label>
          <input className={field} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mantenimiento" />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Añadiendo…" : "Añadir bloqueo"}
          </button>
        </div>
      </form>
    </section>
  );
}
