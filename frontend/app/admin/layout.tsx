import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  Inbox,
  Users,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/planes", label: "Planes", icon: Package },
  { href: "/admin/tipos", label: "Tipos", icon: Tags },
  { href: "/admin/ubicaciones", label: "Ubicaciones", icon: MapPin },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar — chrome índigo, distinto del sitio público */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#332a47] bg-noche p-4 text-arena">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <span className="h-8 w-8 shrink-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,#f5a538,#d6455f)]" />
          <div>
            <p className="font-display text-lg font-semibold text-arena">
              Puesta del Sol
            </p>
            <p className="text-xs text-[#9a8c74]">Panel de administración</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#cdbfa6] transition-colors hover:bg-[#211a33] hover:text-arena"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-3 border-t border-[#332a47] pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 text-xs text-[#9a8c74] transition-colors hover:text-arena"
          >
            <ExternalLink className="h-3 w-3" />
            Ver sitio
          </Link>
          <div className="px-1 [&_button]:border-[#332a47] [&_button]:text-[#cdbfa6] [&_button:hover]:border-brasa/50 [&_button:hover]:text-brasa">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}
