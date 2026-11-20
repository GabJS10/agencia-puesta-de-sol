"use client";

import { useState } from "react";
import Link from "next/link";
import { fieldClass } from "@/components/auth/PasswordInput";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar la solicitud");
        return;
      }
      setMessage(data.message);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return (
      <div className="space-y-5">
        <div role="status" className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {message}
        </div>
        <Link href="/ingresar" className="block text-center text-sm font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">{error}</div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">Correo</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="tucorreo@ejemplo.com" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/ingresar" className="font-medium text-primary hover:underline">Volver a iniciar sesión</Link>
      </p>
    </form>
  );
}
