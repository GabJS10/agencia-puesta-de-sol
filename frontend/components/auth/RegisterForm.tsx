"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput, fieldClass as field } from "@/components/auth/PasswordInput";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta");
        return;
      }
      router.push("/cuenta");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Nombre</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Tu nombre" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Correo</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="tucorreo@ejemplo.com" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Teléfono (opcional)</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="3001234567" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">Contraseña</label>
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
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingresar" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
