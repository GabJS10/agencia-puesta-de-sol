"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleSelect({
  id,
  role,
  disabled,
}: {
  id: number;
  role: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) router.refresh();
      else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "No se pudo cambiar el rol");
        setValue(role);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled || saving}
      className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
    >
      <option value="CLIENT">Cliente</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
