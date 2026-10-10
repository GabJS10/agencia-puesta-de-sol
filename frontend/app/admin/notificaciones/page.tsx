import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { serializeNotification } from "@/lib/admin-notifications";
import { NotificationsList } from "@/components/admin/notifications/NotificationsList";

export const dynamic = "force-dynamic";

const LIMIT = 100;

export default async function NotificacionesPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: LIMIT,
  });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 font-display text-3xl font-semibold">Notificaciones</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nuevas solicitudes, cancelaciones de clientes y apartados por vencer o vencidos.
      </p>
      <NotificationsList initialItems={items.map(serializeNotification)} limit={LIMIT} />
    </div>
  );
}
