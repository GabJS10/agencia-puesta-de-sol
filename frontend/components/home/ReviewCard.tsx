import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReviewCardProps {
  description: string;
  rating: number;
  name: string;
  photo: string; // URL string for avatar
  className?: string;
}

// Tarjeta de testimonio para la banda índigo del home: colores fijos oscuros
// (no dependen del tema) para mantener el contraste del mockup.
export function ReviewCard({
  description,
  rating,
  name,
  photo,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-[#332a47] bg-[#211a33] p-6",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(rating)
                ? "fill-primary text-primary"
                : "fill-[#3a3050] text-[#3a3050]",
            )}
          />
        ))}
      </div>

      <p className="mb-5 flex-1 text-[15px] leading-relaxed text-[#e9d9bc]">
        &ldquo;{description}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <Image src={photo} alt={name} fill className="object-cover" />
        </div>
        <span className="text-sm font-bold text-arena">{name}</span>
      </div>
    </div>
  );
}
