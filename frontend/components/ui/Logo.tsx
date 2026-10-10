import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo oficial de la agencia (public/favicon.jpg), recortado en círculo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/70",
        className,
      )}
    >
      <Image src="/favicon.jpg" alt="" fill sizes="64px" className="object-contain p-0.5" />
    </span>
  );
}
