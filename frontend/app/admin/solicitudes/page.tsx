import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  const requests = await prisma.planRequest.findMany({
    include: {
      plan: { select: { title: true, slug: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Solicitudes</h1>

      {requests.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay solicitudes.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Cliente</th>
                <th className="p-3 font-medium">Contacto</th>
                <th className="p-3 font-medium">Plan</th>
                <th className="p-3 font-medium">Viaje</th>
                <th className="p-3 font-medium">Pers.</th>
                <th className="p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.user ? "Registrado" : "Invitado"} ·{" "}
                      {format(r.createdAt, "P", { locale: es })}
                    </p>
                    {r.message && (
                      <p className="mt-1 max-w-xs text-xs italic text-muted-foreground">
                        “{r.message}”
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    <p>{r.email}</p>
                    <p>{r.phone}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {r.plan?.title ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {format(r.travelDate, "PPP", { locale: es })}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.guests}</td>
                  <td className="p-3">
                    <StatusSelect id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
