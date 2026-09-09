"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  endpoint: string;
  confirmText?: string;
  redirectTo?: string;
  label?: string;
  iconOnly?: boolean;
}

export function DeleteButton({
  endpoint,
  confirmText = "¿Eliminar? Esta acción no se puede deshacer.",
  redirectTo,
  label = "Eliminar",
  iconOnly = false,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "No se pudo eliminar");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brasa/30 px-3 py-1.5 text-sm font-medium text-brasa transition-colors hover:bg-brasa/10 disabled:opacity-50"
      title={label}
    >
      <Trash2 className="h-4 w-4" />
      {!iconOnly && (loading ? "…" : label)}
    </button>
  );
}
