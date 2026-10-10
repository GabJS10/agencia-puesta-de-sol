"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  Inbox,
  Users,
  BookOpen,
  BarChart3,
  Bell,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LogoMark } from "@/components/ui/Logo";
import { useNotifications } from "@/components/admin/notifications/NotificationsProvider";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/planes", label: "Planes", icon: Package },
  { href: "/admin/tipos", label: "Tipos", icon: Tags },
  { href: "/admin/ubicaciones", label: "Ubicaciones", icon: MapPin },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/manual", label: "Manual de usuario", icon: BookOpen },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

// Store externo sobre localStorage: useSyncExternalStore lo lee sin provocar
// mismatch de hidratación (usa el snapshot de servidor en el primer render) y
// sincroniza entre pestañas vía el evento `storage`.
const listeners = new Set<() => void>();

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function setCollapsedStore(next: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* storage no disponible: no persiste, pero igual notificamos */
  }
  listeners.forEach((l) => l());
}

export function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const { unread } = useNotifications();

  const toggle = () => setCollapsedStore(!collapsed);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-noche p-4 text-arena transition-[width] duration-[450ms] ease-[cubic-bezier(.6,0,.2,1)]",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "mb-8 flex items-center pt-2",
          collapsed ? "flex-col gap-3" : "gap-3 px-2",
        )}
      >
        <LogoMark className="h-10 w-10" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-[-0.02em] text-[#fbf5e9]">
              Puesta del Sol
            </p>
            <p className="truncate text-xs text-[#9a8c74]">
              Panel de administración
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        className={cn(
          "mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#9a8c74] transition-colors hover:bg-[#211a33] hover:text-arena",
          collapsed && "justify-center px-0",
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4 shrink-0" />
            Colapsar
          </>
        )}
      </button>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3.5 rounded-xl px-3.5 text-[15px] font-semibold transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-[#2c2440] text-[#fbf5e9] before:absolute before:-left-4 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-r before:bg-sol"
                  : "text-[#d9ccb3] hover:bg-[#211a33] hover:text-[#fbf5e9]",
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-5 w-5" />
                {href === "/admin/notificaciones" && unread > 0 && collapsed && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brasa" />
                )}
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && href === "/admin/notificaciones" && unread > 0 && (
                <span
                  className="ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-brasa px-1.5 text-xs font-extrabold tabular-nums text-white"
                  aria-label={`${unread} sin leer`}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#332a47] pt-4">
        <Link
          href="/"
          title={collapsed ? "Ver sitio" : undefined}
          className={cn(
            "flex items-center gap-2 text-xs text-[#9a8c74] transition-colors hover:text-arena",
            collapsed ? "justify-center" : "px-3",
          )}
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          {!collapsed && "Ver sitio"}
        </Link>
        <div
          className={cn(
            "[&_button]:border-[#332a47] [&_button]:text-[#cdbfa6] [&_button:hover]:border-brasa/50 [&_button:hover]:text-brasa",
            collapsed ? "flex justify-center" : "px-1",
          )}
        >
          <LogoutButton collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}
