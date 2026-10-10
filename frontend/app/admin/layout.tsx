import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationsProvider } from "@/components/admin/notifications/NotificationsProvider";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden px-5 py-8 md:px-10">{children}</main>
      </div>
    </NotificationsProvider>
  );
}
