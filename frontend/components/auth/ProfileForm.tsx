"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

interface ProfileFormProps {
  initial: { name: string; email: string; phone: string };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [changePw, setChangePw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          ...(changePw ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      setSuccess(true);
      setChangePw(false);
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "h-12 w-full rounded-xl border border-border bg-surface px-4 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Datos actualizados.
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Correo</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Teléfono</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="3001234567" />
      </div>

      {!changePw ? (
        <button
          type="button"
          onClick={() => setChangePw(true)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Cambiar contraseña
        </button>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">Contraseña actual</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">Nueva contraseña</label>
            <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={field} placeholder="Mínimo 6 caracteres" />
          </div>
          <button
            type="button"
            onClick={() => {
              setChangePw(false);
              setCurrentPassword("");
              setNewPassword("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancelar cambio de contraseña
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
