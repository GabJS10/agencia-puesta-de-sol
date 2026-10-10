"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Check, CheckCheck, Mail, MailOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTIFICATION_META, type AdminNotification } from "@/lib/notification-meta";
import { useNotifications } from "@/components/admin/notifications/NotificationsProvider";

type Filter = "all" | "unread";

export function NotificationsList({
  initialItems,
  limit,
}: {
  initialItems: AdminNotification[];
  limit: number;
}) {
  const { setUnread, version, open } = useNotifications();
  const [items, setItems] = React.useState(initialItems);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [busy, setBusy] = React.useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = React.useState(false);

  // Llegaron notificaciones nuevas (polling): recarga la lista.
  React.useEffect(() => {
    if (version === 0) return;
    let cancelled = false;
    fetch(`/api/admin/notificaciones?limit=${limit}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setItems(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [version, limit]);

  const visible = filter === "unread" ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;
  const selectedIds = visible.filter((n) => selected.has(n.id)).map((n) => n.id);
  const allSelected = visible.length > 0 && selectedIds.length === visible.length;

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function call(
    method: "PATCH" | "DELETE",
    url: string,
    body: object,
    success: string,
    apply: () => void,
  ) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo completar la acción");
        return;
      }
      apply();
      if (typeof data?.unread === "number") setUnread(data.unread);
      toast.success(success);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  const setRead = (ids: number[] | "all", read: boolean) =>
    call(
      "PATCH",
      "/api/admin/notificaciones",
      ids === "all" ? { all: true, read } : { ids, read },
      read ? "Marcadas como leídas" : "Marcadas como no leídas",
      () => {
        setItems((list) =>
          list.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read } : n)),
        );
        setSelected(new Set());
      },
    );

  const remove = (ids: number[] | "all") =>
    call(
      "DELETE",
      "/api/admin/notificaciones",
      ids === "all" ? { all: true } : { ids },
      ids === "all" ? "Notificaciones eliminadas" : ids.length === 1 ? "Notificación eliminada" : "Notificaciones eliminadas",
      () => {
        setItems((list) => (ids === "all" ? [] : list.filter((n) => !ids.includes(n.id))));
        setSelected(new Set());
        setConfirmDeleteAll(false);
      },
    );

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-surface-hover disabled:opacity-50";

  return (
    <div>
      {/* Filtro + acciones masivas */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setSelected(new Set());
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-surface text-foreground/70 hover:border-primary/40",
            )}
          >
            {f === "all" ? `Todas (${items.length})` : `No leídas (${unreadCount})`}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={busy || unreadCount === 0} onClick={() => setRead("all", true)}>
            <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como leídas
          </button>
          <button type="button" className={cn(btn, "text-brasa")} disabled={busy || items.length === 0} onClick={() => setConfirmDeleteAll(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Eliminar todas
          </button>
        </div>
      </div>

      {visible.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() =>
                setSelected(allSelected ? new Set() : new Set(visible.map((n) => n.id)))
              }
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {selectedIds.length > 0 ? `${selectedIds.length} seleccionadas` : "Seleccionar todas"}
          </label>
          {selectedIds.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" className={btn} disabled={busy} onClick={() => setRead(selectedIds, true)}>
                <MailOpen className="h-3.5 w-3.5" /> Marcar leídas
              </button>
              <button type="button" className={btn} disabled={busy} onClick={() => setRead(selectedIds, false)}>
                <Mail className="h-3.5 w-3.5" /> Marcar no leídas
              </button>
              <button type="button" className={cn(btn, "text-brasa")} disabled={busy} onClick={() => remove(selectedIds)}>
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-14 text-center text-muted-foreground">
          {filter === "unread" ? "No tienes notificaciones sin leer." : "No tienes notificaciones."}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {visible.map((n) => {
            const meta = NOTIFICATION_META[n.type];
            return (
              <li
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover",
                  !n.read && "bg-primary/5",
                )}
              >
                <input
                  type="checkbox"
                  aria-label={`Seleccionar: ${n.title}`}
                  checked={selected.has(n.id)}
                  onChange={() => toggle(n.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!n.read) setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                    void open(n);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brasa" aria-label="Sin leer" />}
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", meta.className)}>
                      {meta.label}
                    </span>
                    <span
                      className="text-xs text-muted-foreground"
                      suppressHydrationWarning
                      title={new Date(n.createdAt).toLocaleString("es-CO")}
                    >
                      hace {formatDistanceToNowStrict(new Date(n.createdAt), { locale: es })}
                    </span>
                  </span>
                  <span className={cn("mt-1 block text-sm", n.read ? "text-foreground/80" : "font-semibold text-foreground")}>
                    {n.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">{n.body}</span>
                </button>
                <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRead([n.id], !n.read)}
                    title={n.read ? "Marcar como no leída" : "Marcar como leída"}
                    aria-label={n.read ? "Marcar como no leída" : "Marcar como leída"}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {n.read ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove([n.id])}
                    title="Eliminar"
                    aria-label="Eliminar notificación"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-brasa/10 hover:text-brasa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {items.length >= limit && (
        <p className="mt-3 text-xs text-muted-foreground">
          Se muestran las {limit} más recientes. Elimina las que ya no necesites para ver las anteriores.
        </p>
      )}

      <Dialog.Root open={confirmDeleteAll} onOpenChange={(o) => !busy && setConfirmDeleteAll(o)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-noche/50 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border border-border bg-popover p-6 text-foreground shadow-xl">
            <Dialog.Title className="font-display text-xl font-semibold">¿Eliminar todas?</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Se eliminarán todas tus notificaciones. Las solicitudes no se ven afectadas.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Volver
              </Dialog.Close>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove("all")}
                className="rounded-lg bg-brasa px-4 py-2 text-sm font-bold text-white hover:bg-brasa/90 disabled:opacity-60"
              >
                Eliminar todas
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
