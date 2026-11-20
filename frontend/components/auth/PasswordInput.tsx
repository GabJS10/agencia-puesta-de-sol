"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const fieldClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${fieldClass} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
