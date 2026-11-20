import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nueva contraseña | Puesta del Sol",
  description: "Define una nueva contraseña para tu cuenta.",
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 pt-28 pb-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-10">
        <Eyebrow className="text-sol">Recuperar acceso</Eyebrow>
        <h1 className="mt-3 mb-8 font-display text-3xl font-semibold">Nueva contraseña</h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Falta el enlace de recuperación.{" "}
            <Link href="/recuperar" className="font-medium text-primary hover:underline">Solicita uno nuevo</Link>.
          </p>
        )}
      </div>
    </main>
  );
}
