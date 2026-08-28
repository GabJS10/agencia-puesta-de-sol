import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** Alinea el tick a la derecha (para bloques alineados a la derecha) */
  align?: "left" | "right";
}

/**
 * Etiqueta "eyebrow": texto corto en mayúsculas con tracking amplio y un
 * tick con el degradado de atardecer. Precede a los titulares de sección.
 */
export function Eyebrow({ children, className, align = "left" }: EyebrowProps) {
  const tick = (
    <span className="h-px w-8 rounded-full bg-gradient-to-r from-sol to-brasa" />
  );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-barro",
        className,
      )}
    >
      {align === "left" && tick}
      {children}
      {align === "right" && tick}
    </span>
  );
}
