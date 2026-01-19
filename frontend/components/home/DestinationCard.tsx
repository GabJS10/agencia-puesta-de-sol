import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  image: string;
  title: string;
  location: string;
  price: string;
  className?: string;
}

export function DestinationCard({
  image,
  title,
  location,
  price,
  className,
}: DestinationCardProps) {
  return (
    <div
      className={cn(
        "group relative h-80 w-64 md:h-100 md:w-full md:min-w-75 overflow-hidden rounded-3xl md:rounded-4xl",
        className,
      )}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay - Gradient for better readability if needed, mostly handled by the glass card */}
      <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />

      {/* Glassmorphism details card */}
      <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/20 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-white">{title}</h3>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">${price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
