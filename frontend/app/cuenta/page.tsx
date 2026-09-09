import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mi cuenta | Puesta del Sol" };

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-sol/15 text-sol" },
  CONTACTED: { label: "Contactado", className: "bg-mar/15 text-mar" },
  CONFIRMED: { label: "Confirmado", className: "bg-green-500/15 text-green-600" },
  CANCELLED: { label: "Cancelado", className: "bg-brasa/15 text-brasa" },
};

export default async function CuentaPage() {
  const user = await getSession();
  if (!user) redirect("/ingresar?redirect=/cuenta");

  const requests = await prisma.planRequest.findMany({
    where: { userId: user.id },
    include: { plan: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background px-6 pt-32 pb-20 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Eyebrow className="text-sol">Mi cuenta</Eyebrow>
            <h1 className="mt-3 font-display text-3xl font-semibold">
              Hola, {user.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Panel admin
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        <h2 className="mb-4 mt-12 font-display text-2xl font-semibold">
          Mis solicitudes
        </h2>

        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface px-8 py-12 text-center">
            <p className="text-muted-foreground">
              Aún no has solicitado ningún plan.{" "}
              <Link href="/planes" className="font-medium text-primary hover:underline">
                Explora nuestros planes
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => {
              const status = STATUS[r.status] ?? STATUS.PENDING;
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {r.plan ? (
                        <Link href={`/planes/${r.plan.slug}`} className="hover:text-primary">
                          {r.plan.title}
                        </Link>
                      ) : (
                        "Plan no disponible"
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Viaje: {format(r.travelDate, "PPP", { locale: es })} · {r.guests}{" "}
                      {r.guests === 1 ? "persona" : "personas"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solicitado el {format(r.createdAt, "PPP", { locale: es })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
