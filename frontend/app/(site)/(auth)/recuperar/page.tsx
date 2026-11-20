import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Recuperar contraseña | Puesta del Sol",
  description: "Recibe un enlace para restablecer tu contraseña.",
};

export default function RecuperarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 pt-28 pb-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-10">
        <Eyebrow className="text-sol">Recuperar acceso</Eyebrow>
        <h1 className="mt-3 mb-3 font-display text-3xl font-semibold">¿Olvidaste tu contraseña?</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Escribe tu correo y te enviaremos un enlace para definir una nueva.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
