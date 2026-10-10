"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTION_LABEL,
  STATUS_META,
  noteRequired,
  type RequestStatus,
} from "@/lib/request-status";

// Qué provoca cada acción (se muestra antes de confirmar).
const EFFECT: Partial<Record<RequestStatus, string>> = {
  CONTACTED: "Renueva el apartado del cupo por 72 h y avisa al cliente por correo.",
  CONFIRMED:
    "Ocupa el cupo en firme (se vuelve a validar la disponibilidad) y envía la confirmación al cliente.",
  COMPLETED: "Marca el viaje como realizado y envía un agradecimiento al cliente.",
  REJECTED: "Libera el cupo apartado. El motivo se envía al cliente por correo.",
  CANCELLED: "Anula la reserva confirmada y libera el cupo. El motivo se envía al cliente por correo.",
};

/**
 * Diálogo de confirmación de un cambio de estado (con nota para el cliente).
 * Lo usan los botones de acción y el pipeline. Hace el PATCH y avisa con toasts.
 */
export function TransitionDialog({
  id,
  from,
  target,
  onClose,
  onDone,
}: {
  id: number;
  from: RequestStatus;
  /** Estado destino; null = cerrado. */
  target: RequestStatus | null;
  onClose: () => void;
  /** Tras guardar con éxito (o `ok: false` si falló). */
  onDone?: (ok: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const required = target ? noteRequired(target, "ADMIN") : false;

  function close() {
    setNote("");
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    if (required && !note.trim()) {
      toast.error("Escribe el motivo para el cliente");
      return;
    }
    setSaving(true);
    let ok = false;
    try {
      const res = await fetch(`/api/admin/solicitudes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target, note: note.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo actualizar la solicitud");
      } else {
        ok = true;
        toast.success(`Solicitud #${id}: ${STATUS_META[target].label}`, {
          description: "Se notificó al cliente por correo.",
        });
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
    setNote("");
    onDone?.(ok);
  }

  return (
    <Dialog.Root
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !saving) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-noche/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-popover p-6 text-foreground shadow-xl">
          {target && (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="font-display text-xl font-semibold">
                    {ACTION_LABEL[target]} · #{id}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                    {STATUS_META[from].label} → {STATUS_META[target].label}.{" "}
                    {EFFECT[target]}
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Cerrar"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  {required ? "Motivo (obligatorio)" : "Mensaje para el cliente (opcional)"}
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  required={required}
                  autoFocus
                  placeholder={
                    required
                      ? "Ej.: No tenemos guías disponibles para esa fecha."
                      : "Ej.: Te escribimos por WhatsApp para coordinar el punto de encuentro."
                  }
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Se incluirá en el correo al cliente y en el historial.
                </span>
              </label>

              <div className="flex justify-end gap-2">
                <Dialog.Close
                  type="button"
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Volver
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60",
                    target === "REJECTED" || target === "CANCELLED"
                      ? "bg-brasa text-white hover:bg-brasa/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {saving ? "Guardando…" : ACTION_LABEL[target]}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
