"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { toast } from "sonner";

export function CancelRequestButton({ id, planTitle }: { id: number; planTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function cancel() {
    setSaving(true);
    try {
      const res = await fetch(`/api/mis-solicitudes/${id}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo cancelar la solicitud");
        return;
      }
      toast.success("Solicitud cancelada", { description: "Liberamos el cupo que tenías apartado." });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !saving && setOpen(o)}>
      <Dialog.Trigger className="text-xs font-semibold text-brasa hover:underline">
        Cancelar solicitud
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-noche/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border border-border bg-popover p-6 text-foreground shadow-xl">
          <div>
            <Dialog.Title className="font-display text-xl font-semibold">
              ¿Cancelar tu solicitud?
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Cancelarás la solicitud de <strong>{planTitle}</strong> y se liberará el cupo
              apartado. Esta acción no se puede deshacer.
            </Dialog.Description>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Motivo (opcional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Dialog.Close
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Volver
            </Dialog.Close>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="rounded-lg bg-brasa px-4 py-2 text-sm font-bold text-white hover:bg-brasa/90 disabled:opacity-60"
            >
              {saving ? "Cancelando…" : "Sí, cancelar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
