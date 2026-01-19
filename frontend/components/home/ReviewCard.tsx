import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReviewCardProps {
  quote: string;
  rating: number;
  author: string;
  avatar: string; // URL string for avatar
  className?: string;
}

export function ReviewCard({
  quote,
  rating,
  author,
  avatar,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between h-full transition-transform hover:-translate-y-1 duration-300",
        className,
      )}
    >
      <div>
        <Quote className="h-10 w-10 text-blue-200 mb-6 fill-current opacity-50" />
        <p className="text-gray-700 font-medium leading-relaxed mb-6">
          &quot;{quote}&quot;
        </p>
      </div>

      <div>
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200 fill-gray-200",
              )}
            />
          ))}
          <span className="ml-2 text-sm font-bold text-gray-900">{rating}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
            <Image src={avatar} alt={author} fill className="object-cover" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{author}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
