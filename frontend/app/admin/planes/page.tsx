import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Plus, Pencil } from "lucide-react";
import { formatPrice } from "@/helpers/formatPrice";

export const dynamic = "force-dynamic";

export default async function AdminPlanesPage() {
  const plans = await prisma.plan.findMany({
    include: { planType: true, planLocation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Planes</h1>
        <Link
          href="/admin/planes/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay planes. Crea el primero.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Plan</th>
                <th className="p-3 font-medium">Tipo</th>
                <th className="p-3 font-medium">Precio</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {p.photoUrl && (
                          <Image src={p.photoUrl} alt={p.title} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.planType?.type ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.published
                          ? "bg-green-500/15 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/planes/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <DeleteButton
                        endpoint={`/api/admin/planes/${p.id}`}
                        confirmText={`¿Eliminar "${p.title}"?`}
                        iconOnly
                      />
                    </div>
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
