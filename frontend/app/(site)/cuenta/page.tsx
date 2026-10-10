import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveMedia } from "@/lib/media-url";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { expireStaleRequests } from "@/lib/request-workflow";
import {
  ACTOR_LABEL,
  STATUS_META,
  STATUS_ORDER,
  allowedTransitions,
  isHolding,
  type RequestStatus,
} from "@/lib/request-status";
import { formatInstant, formatTravelRange } from "@/lib/format-dates";
import { HoldBadge, StatusBadge } from "@/components/requests/StatusBadge";
import { CancelRequestButton } from "@/components/cuenta/CancelRequestButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mi cuenta | Puesta del Sol" };

const FILTERS: { key: string; label: string; status?: RequestStatus }[] = [
  { key: "", label: "Todas" },
  ...STATUS_ORDER.map((s) => ({ key: s, label: STATUS_META[s].plural, status: s })),
];

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/ingresar?redirect=/cuenta");

  await expireStaleRequests();

  const { estado } = await searchParams;
  const active = FILTERS.find((f) => f.key === estado) ?? FILTERS[0];

  const requests = await prisma.planRequest.findMany({
    where: { userId: user.id, ...(active.status ? { status: active.status } : {}) },
    include: {
      plan: { select: { title: true, slug: true, photoUrl: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-background px-6 pb-20 pt-28 text-foreground">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-4xl font-semibold">
            Hola, {user.name} 👋
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Aquí puedes ver el estado de tus solicitudes y gestionar tu perfil.
          </p>
        </header>

        <div className="flex flex-col gap-7 lg:flex-row">
          {/* Sidebar perfil */}
          <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-3.5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#f5a538,#b85c38)] text-3xl font-extrabold text-white">
                {initial}
              </div>
              <div className="font-display text-xl font-semibold">{user.name}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{user.email}</div>
              <Link
                href="/cuenta/perfil"
                className="mt-4 block rounded-lg bg-secondary py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-surface-hover"
              >
                Editar perfil
              </Link>
            </div>

            <nav className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <Link
                href="/cuenta"
                aria-current="page"
                className="mb-1.5 block rounded-lg bg-primary px-3.5 py-3 text-sm font-bold text-primary-foreground"
              >
                Mis solicitudes
              </Link>
              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    className="mb-1.5 block rounded-lg px-3.5 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-hover"
                  >
                    Panel admin
                  </Link>
                  <Link
                    href="/admin/manual"
                    className="mb-1.5 flex items-center gap-2 rounded-lg px-3.5 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-hover"
                  >
                    <BookOpen className="h-4 w-4" />
                    Manual de usuario
                  </Link>
                </>
              )}
              <div className="px-1 pt-1">
                <LogoutButton />
              </div>
            </nav>
          </div>

          {/* Solicitudes */}
          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-semibold">Mis solicitudes</h2>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <Link
                    key={f.key}
                    href={f.key ? `/cuenta?estado=${f.key}` : "/cuenta"}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                      active.key === f.key
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground/70 hover:border-primary/40",
                    )}
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-16 text-center">
                <p className="text-muted-foreground">
                  No hay solicitudes en esta vista.{" "}
                  <Link href="/planes" className="font-semibold text-primary hover:underline">
                    Explora nuestros planes
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {requests.map((r) => {
                  const meta = STATUS_META[r.status];
                  const canCancel = allowedTransitions(r.status, "CLIENT").includes("CANCELLED");
                  return (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        {r.plan?.photoUrl && (
                          <div className="relative h-[72px] w-24 shrink-0 overflow-hidden rounded-xl">
                            <Image
                              src={resolveMedia(r.plan.photoUrl)}
                              alt={r.plan.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-semibold">
                            {r.plan ? (
                              <Link
                                href={`/planes/${r.plan.slug}`}
                                className="hover:text-primary"
                              >
                                {r.plan.title}
                              </Link>
                            ) : (
                              "Plan no disponible"
                            )}
                          </h3>
                          <div className="mt-0.5 text-sm text-muted-foreground">
                            📅 {formatTravelRange(r.travelDate, r.endDate)} · 👥{" "}
                            {r.guests} {r.guests === 1 ? "persona" : "personas"} ·
                            Solicitado el {formatInstant(r.createdAt, "d MMM yyyy")}
                          </div>
                          <p className="mt-1 text-sm text-foreground/80">{meta.description}</p>
                          {isHolding(r.status, r.holdExpiresAt) && (
                            <div className="mt-1">
                              <HoldBadge status={r.status} holdExpiresAt={r.holdExpiresAt} />
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <StatusBadge status={r.status} className="py-1.5" />
                          {canCancel && (
                            <CancelRequestButton id={r.id} planTitle={r.plan?.title ?? "tu plan"} />
                          )}
                        </div>
                      </div>

                      {r.events.length > 0 && (
                        <details className="group mt-3 border-t border-border pt-3">
                          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
                            Historial ({r.events.length})
                          </summary>
                          <ol className="mt-3 space-y-2.5 border-l border-border pl-4">
                            {r.events.map((ev) => (
                              <li key={ev.id} className="text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                  <StatusBadge status={ev.toStatus} className="px-2.5 py-0.5" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatInstant(ev.createdAt)} · {ev.actor === "CLIENT" ? "Tú" : ACTOR_LABEL[ev.actor]}
                                  </span>
                                </div>
                                {ev.note && (
                                  <p className="mt-1 whitespace-pre-line rounded-lg bg-muted/40 px-3 py-2 text-foreground/80">
                                    {ev.note}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
