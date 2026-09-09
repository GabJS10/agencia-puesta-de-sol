import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editar datos | Puesta del Sol" };

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/ingresar?redirect=/cuenta/perfil");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) redirect("/ingresar");

  return (
    <main className="min-h-screen bg-background px-6 pt-32 pb-20 text-foreground">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/cuenta"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mi cuenta
        </Link>
        <Eyebrow className="text-sol">Mis datos</Eyebrow>
        <h1 className="mb-8 mt-3 font-display text-3xl font-semibold">
          Editar mis datos
        </h1>
        <ProfileForm
          initial={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
        />
      </div>
    </main>
  );
}
