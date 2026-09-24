import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DestinationCardProps {
  image: string;
  title: string;
  location: string;
  price: string;
  url: string;
  badge?: string;
  description?: string;
  className?: string;
}

export function DestinationCard({
  image,
  title,
  location,
  price,
  url,
  badge,
  description,
  className,
}: DestinationCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(price));

  return (
    <Link href={url} className="block h-full">
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
          className,
        )}
      >
        {/* Imagen */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-noche/75 px-3 py-1 text-xs font-bold text-arena backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="tracking-wide">{location}</span>
          </div>

          <h3 className="font-display text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-barro">
            {title}
          </h3>

          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-lg font-extrabold text-foreground">
              {formattedPrice}
            </span>
            <span className="text-sm font-bold text-primary transition-transform group-hover:translate-x-0.5">
              Reservar →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
