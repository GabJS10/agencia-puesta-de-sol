"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo cambiar la contraseña");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div role="status" className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Tu contraseña fue actualizada. Ya puedes iniciar sesión.
        </div>
        <Link href="/ingresar" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}{" "}
          <Link href="/recuperar" className="font-medium underline">Solicitar otro enlace</Link>
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">Nueva contraseña</label>
        <PasswordInput id="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">Confirmar contraseña</label>
        <PasswordInput id="confirmPassword" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
