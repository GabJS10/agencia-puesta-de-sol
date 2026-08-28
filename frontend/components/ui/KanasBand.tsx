import { useId } from "react";
import { cn } from "@/lib/utils";

interface KanasBandProps {
  /** Altura de la banda en px */
  height?: number;
  className?: string;
  /** Opacidad del motivo (0–1) */
  opacity?: number;
}

/**
 * Motivo "kanas" del tejido Wayúu: una red de rombos.
 * Firma visual del sitio — se usa como banda divisoria entre secciones,
 * subrayado del hero y acento decorativo. Es puramente ornamental.
 */
export function KanasBand({ height = 20, className, opacity = 1 }: KanasBandProps) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      role="presentation"
      aria-hidden="true"
      width="100%"
      height={height}
      viewBox={`0 0 40 ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`kanas-${id}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0 0)"
        >
          {/* Rombo exterior */}
          <path
            d="M10 1 L19 10 L10 19 L1 10 Z"
            fill="none"
            stroke="var(--barro)"
            strokeWidth="1.25"
          />
          {/* Rombo interior alterno (sol) */}
          <path d="M10 6 L14 10 L10 14 L6 10 Z" fill="var(--sol)" />
          {/* Semirrombos de conexión en los bordes (brasa) */}
          <path d="M0 10 L1 10 L0 11 Z M20 10 L19 10 L20 11 Z" fill="var(--brasa)" />
          <path d="M10 0 L10 1 L9 0 Z M10 20 L10 19 L11 20 Z" fill="var(--mar)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#kanas-${id})`} />
    </svg>
  );
}
