import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/helpers/formatPrice";

interface DestinationCardProps {
  image: string;
  title: string;
  location: string;
  price: string;
  url: string;
  badge?: string;
  /** Condición de disponibilidad (p. ej. "Cupos limitados"); `muted` = reservas cerradas. */
  availabilityTag?: { label: string; muted?: boolean };
  description?: string;
  /** `list`: imagen a la izquierda y cuerpo a la derecha (en móvil vuelve a apilarse). */
  layout?: "grid" | "list";
  /** Posición en el listado, para escalonar la entrada. */
  index?: number;
  className?: string;
}

export function DestinationCard({
  image,
  title,
  location,
  price,
  url,
  badge,
  availabilityTag,
  description,
  layout = "grid",
  index = 0,
  className,
}: DestinationCardProps) {
  const list = layout === "list";

  return (
    <Link
      href={url}
      className={cn(
        "anim-rise group flex h-full flex-col overflow-hidden rounded-[22px] bg-card text-card-foreground transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(74,45,20,0.35)]",
        list && "sm:flex-row",
        className,
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div
        className={cn(
          "relative h-60 w-full shrink-0 overflow-hidden",
          list && "sm:h-auto sm:min-h-[200px] sm:w-[340px]",
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes={list ? "340px" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.08]"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {availabilityTag && (
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold",
                availabilityTag.muted ? "bg-noche/75 text-arena/85" : "bg-arena text-[#2a1a0a]",
              )}
            >
              {availabilityTag.label}
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-noche/70 px-3 py-1.5 text-xs font-bold text-arena">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </span>
        <h3 className="mt-2 text-[26px] font-extrabold leading-[1.15] tracking-[-0.025em]">
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-sm text-muted-foreground">
            Desde{" "}
            <strong className="text-xl text-foreground">{formatPrice(Number(price))}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-barro transition-all duration-300 group-hover:gap-3">
            Ver plan
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
