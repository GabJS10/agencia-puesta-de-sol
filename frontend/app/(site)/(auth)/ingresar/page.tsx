import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ingresar | Puesta del Sol",
  description: "Accede a tu cuenta de Puesta del Sol.",
};

export default function IngresarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 pt-28 pb-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-10">
        <Eyebrow className="text-sol">Bienvenido</Eyebrow>
        <h1 className="mt-3 mb-8 font-display text-3xl font-semibold">
          Inicia sesión
        </h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
