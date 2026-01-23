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
  className?: string;
}

export function DestinationCard({
  image,
  title,
  location,
  price,
  url,
  className,
}: DestinationCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(price));

  return (
    <Link href={url}>
      <div
        className={cn(
          "group relative h-80 w-64 md:h-96 md:w-full md:min-w-72 overflow-hidden rounded-2xl bg-surface border border-border transition-all hover:shadow-lg",
          className,
        )}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Minimalist Overlay - subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-70" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors">{title}</h3>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide">{location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
            <span className="text-xs uppercase tracking-widest text-white/60">Desde</span>
            <div className="text-lg font-bold text-white">
              {formattedPrice}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
