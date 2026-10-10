"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTIFICATION_META, type AdminNotification } from "@/lib/notification-meta";

const POLL_MS = 15_000;
/** Más de esto a la vez → un único toast resumen. */
const MAX_TOASTS = 3;
/** Vistas del admin que se refrescan al llegar novedades. */
const LIVE_PATHS = [/^\/admin$/, /^\/admin\/solicitudes/, /^\/admin\/reportes/, /^\/admin\/notificaciones/];

type Ctx = {
  unread: number;
  setUnread: (n: number) => void;
  /** Se incrementa cada vez que llegan notificaciones nuevas (para recargar listas). */
  version: number;
  /** Marca leída y navega a la solicitud (o al apartado si no tiene). */
  open: (n: Pick<AdminNotification, "id" | "requestId">) => Promise<void>;
};

const NotificationsContext = React.createContext<Ctx>({
  unread: 0,
  setUnread: () => {},
  version: 0,
  open: async () => {},
});

export function useNotifications() {
  return React.useContext(NotificationsContext);
}

/**
 * Polling de notificaciones del admin: mantiene el contador de no leídas,
 * muestra un toast clickeable por cada notificación nueva y refresca las
 * vistas vivas. La primera consulta solo fija la línea base (sin toasts).
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = React.useState(0);
  const [version, setVersion] = React.useState(0);
  const baseline = React.useRef<number | null>(null);
  const polling = React.useRef(false);
  const pathRef = React.useRef(pathname);

  React.useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const open = React.useCallback(
    async (n: Pick<AdminNotification, "id" | "requestId">) => {
      try {
        const res = await fetch(`/api/admin/notificaciones/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });
        const data = await res.json().catch(() => null);
        if (typeof data?.unread === "number") setUnread(data.unread);
      } catch {
        /* navegar igual */
      }
      router.push(n.requestId ? `/admin/solicitudes/${n.requestId}` : "/admin/notificaciones");
    },
    [router],
  );

  const showToasts = React.useCallback(
    (items: AdminNotification[]) => {
      if (items.length > MAX_TOASTS) {
        toast.custom(
          (t) => (
            <ToastCard
              title={`${items.length} notificaciones nuevas`}
              body="Abre el apartado de notificaciones para verlas."
              cta="Ver notificaciones →"
              onClick={() => {
                toast.dismiss(t);
                router.push("/admin/notificaciones");
              }}
            />
          ),
          { duration: 10_000 },
        );
        return;
      }
      for (const n of items) {
        toast.custom(
          (t) => (
            <ToastCard
              badge={NOTIFICATION_META[n.type]}
              title={n.title}
              body={n.body}
              onClick={() => {
                toast.dismiss(t);
                void open(n);
              }}
            />
          ),
          { duration: 10_000 },
        );
      }
    },
    [open, router],
  );

  const poll = React.useCallback(async () => {
    if (polling.current) return;
    polling.current = true;
    try {
      const first = baseline.current === null;
      const qs = first ? "limit=1" : `after=${baseline.current}`;
      const res = await fetch(`/api/admin/notificaciones?${qs}`, { cache: "no-store" });
      if (!res.ok) return;
      const data: { unread: number; latestId: number; items: AdminNotification[] } =
        await res.json();
      setUnread(data.unread);
      const fresh = first ? [] : data.items;
      baseline.current = Math.max(baseline.current ?? 0, data.latestId);
      if (fresh.length > 0) {
        showToasts(fresh);
        setVersion((v) => v + 1);
        if (LIVE_PATHS.some((re) => re.test(pathRef.current))) router.refresh();
      }
    } catch {
      /* sin red: se reintenta en el próximo ciclo */
    } finally {
      polling.current = false;
    }
  }, [router, showToasts]);

  React.useEffect(() => {
    void poll();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void poll();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  const value = React.useMemo(
    () => ({ unread, setUnread, version, open }),
    [unread, version, open],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

function ToastCard({
  title,
  body,
  badge,
  cta = "Ver solicitud →",
  onClick,
}: {
  title: string;
  body: string;
  cta?: string;
  badge?: { label: string; className: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[356px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-border bg-popover p-4 text-left text-popover-foreground shadow-lg transition-colors hover:bg-surface-hover"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Bell className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        {badge && (
          <span className={cn("mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold", badge.className)}>
            {badge.label}
          </span>
        )}
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{body}</span>
        <span className="mt-1.5 block text-xs font-semibold text-primary">{cta}</span>
      </span>
    </button>
  );
}
