"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AvailabilityData {
  availabilityMode: "EXCLUSIVE" | "CAPACITY";
  capacity: number | null;
  bookingMode: "SINGLE_DAY" | "DATE_RANGE";
  bookingsOpen: boolean;
}

export function AvailabilityForm({
  planId,
  initial,
}: {
  planId: number;
  initial: AvailabilityData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AvailabilityData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof AvailabilityData>(key: K, val: AvailabilityData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setOk(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (form.availabilityMode === "CAPACITY" && !(form.capacity && form.capacity > 0)) {
      setError("Indica un cupo mayor que 0 para el modo Aforo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/planes/${planId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo guardar");
        return;
      }
      setOk(true);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Disponibilidad</h2>
        <p className="text-sm text-muted-foreground">
          Modo de ocupación, cupo y estado de las reservas de este plan.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Disponibilidad guardada.
        </div>
      )}

      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Modo de ocupación</label>
            <select
              className={field}
              value={form.availabilityMode}
              onChange={(e) =>
                set("availabilityMode", e.target.value as AvailabilityData["availabilityMode"])
              }
            >
              <option value="EXCLUSIVE">Exclusivo (un grupo por día)</option>
              <option value="CAPACITY">Aforo (cupo de personas por día)</option>
            </select>
          </div>
          {form.availabilityMode === "CAPACITY" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Cupo por día (personas)</label>
              <input
                type="number"
                min={1}
                className={field}
                value={form.capacity ?? ""}
                onChange={(e) =>
                  set("capacity", e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Reserva por</label>
            <select
              className={field}
              value={form.bookingMode}
              onChange={(e) =>
                set("bookingMode", e.target.value as AvailabilityData["bookingMode"])
              }
            >
              <option value="SINGLE_DAY">Día único</option>
              <option value="DATE_RANGE">Rango de fechas</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.bookingsOpen}
            onChange={(e) => set("bookingsOpen", e.target.checked)}
          />
          Reservas abiertas (desmarcar = “agotado”, sin despublicar)
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-lg bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar disponibilidad"}
      </button>
    </form>
  );
}
