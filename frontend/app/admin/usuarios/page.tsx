import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getSession } from "@/lib/auth";
import { RoleSelect } from "@/components/admin/RoleSelect";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const [me, users] = await Promise.all([
    getSession(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { requests: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold">Usuarios</h1>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Nombre</th>
              <th className="p-3 font-medium">Correo</th>
              <th className="p-3 font-medium">Solicitudes</th>
              <th className="p-3 font-medium">Registro</th>
              <th className="p-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium text-foreground">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u._count.requests}</td>
                <td className="p-3 text-muted-foreground">
                  {format(u.createdAt, "P", { locale: es })}
                </td>
                <td className="p-3">
                  <RoleSelect id={u.id} role={u.role} disabled={u.id === me?.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
