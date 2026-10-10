import { useId } from "react";
import { cn } from "@/lib/utils";

interface SunsetSceneProps {
  /** `full`: hero del home (sol a franjas, mar y dunas). `compact`: encabezados internos. */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * Atardecer ilustrado: firma visual del rediseño. Sol a franjas que baja
 * despacio, reflejos en el mar y dunas en primer plano. Puramente decorativo.
 */
export function SunsetScene({ variant = "full", className }: SunsetSceneProps) {
  const id = useId().replace(/:/g, "");

  if (variant === "compact") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      >
        <circle className="anim-sun" cx="1180" cy="330" r="150" fill="#f5a538" opacity="0.9" />
        <rect x="0" y="360" width="1440" height="60" fill="#120c20" />
        <path
          d="M760 420 C 900 330, 1060 340, 1200 380 S 1380 420, 1440 400 L1440 420 Z"
          fill="#2a1d45"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-[560px] w-full", className)}
    >
      <defs>
        <linearGradient id={`sun-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5a538" />
          <stop offset="1" stopColor="#d6455f" />
        </linearGradient>
        <mask id={`stripes-${id}`}>
          <rect x="0" y="0" width="1440" height="560" fill="#fff" />
          <rect x="0" y="232" width="1440" height="6" fill="#000" />
          <rect x="0" y="262" width="1440" height="9" fill="#000" />
          <rect x="0" y="292" width="1440" height="12" fill="#000" />
          <rect x="0" y="322" width="1440" height="16" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#stripes-${id})`}>
        <circle className="anim-sun" cx="1040" cy="250" r="190" fill={`url(#sun-${id})`} />
      </g>
      <rect x="0" y="350" width="1440" height="210" fill="#120c20" />
      <g fill="#f5a538">
        <rect className="anim-shimmer" x="930" y="372" width="220" height="3" rx="1.5" />
        <rect className="anim-shimmer" x="960" y="392" width="160" height="3" rx="1.5" />
        <rect className="anim-shimmer" x="985" y="414" width="110" height="3" rx="1.5" />
        <rect className="anim-shimmer" x="1005" y="438" width="70" height="3" rx="1.5" />
        <rect className="anim-shimmer" x="1022" y="464" width="36" height="3" rx="1.5" />
      </g>
      <path d="M0 410 C 180 330, 360 330, 560 400 S 820 470, 900 560 L0 560 Z" fill="#2a1d45" />
      <path d="M0 470 C 160 420, 330 430, 470 480 S 640 540, 700 560 L0 560 Z" fill="#3a2650" />
    </svg>
  );
}
