import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReviewCardProps {
  description: string;
  rating: number;
  name: string;
  photo: string; // URL string for avatar
  className?: string;
}

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
        "bg-surface rounded-2xl p-8 border border-border flex flex-col justify-between h-full transition-all hover:border-primary/50",
        className,
      )}
    >
      <div>
        <Quote className="h-8 w-8 text-primary/30 mb-6 fill-current" />
        <p className="text-foreground/80 font-light leading-relaxed mb-6 italic">
          &quot;{description}&quot;
        </p>
      </div>

      <div>
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(rating)
                  ? "text-primary fill-primary"
                  : "text-muted/20 fill-muted/20",
              )}
            />
          ))}
          <span className="ml-2 text-sm font-bold text-foreground">{rating}</span>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-surface-hover">
            <Image src={photo} alt={name} fill className="object-cover" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{name}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Viajero verificado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
