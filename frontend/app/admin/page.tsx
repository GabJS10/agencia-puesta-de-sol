import Link from "next/link";
import { prisma } from "@/lib/db";
import { Package, Inbox, Users, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [plans, requests, pending, users] = await Promise.all([
    prisma.plan.count(),
    prisma.planRequest.count(),
    prisma.planRequest.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
  ]);

  const cards = [
    { label: "Planes", value: plans, icon: Package, href: "/admin/planes" },
    { label: "Solicitudes", value: requests, icon: Inbox, href: "/admin/solicitudes" },
    { label: "Pendientes", value: pending, icon: Clock, href: "/admin/solicitudes" },
    { label: "Usuarios", value: users, icon: Users, href: "/admin/usuarios" },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 font-display text-4xl font-semibold text-atardecer">
              {value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
