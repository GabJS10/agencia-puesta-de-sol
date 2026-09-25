import { ManualContent } from "@/components/admin/ManualContent";

export const metadata = { title: "Manual de usuario | Puesta del Sol" };

export default function ManualPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Manual de usuario</h1>
        <p className="mt-2 text-muted-foreground">
          Guía de uso del panel de administración.
        </p>
      </header>
      <ManualContent />
    </div>
  );
}
