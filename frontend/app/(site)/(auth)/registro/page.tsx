import { RegisterForm } from "@/components/auth/RegisterForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Registro | Puesta del Sol",
  description: "Crea tu cuenta en Puesta del Sol.",
};

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 pt-28 pb-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-10">
        <Eyebrow className="text-sol">Únete</Eyebrow>
        <h1 className="mt-3 mb-8 font-display text-3xl font-semibold">
          Crea tu cuenta
        </h1>
        <RegisterForm />
      </div>
    </main>
  );
}
