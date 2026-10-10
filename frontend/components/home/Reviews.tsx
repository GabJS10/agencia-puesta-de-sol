"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Review } from "@/types/Reviews";

// Reseñas como una sola cita grande que se recorre con flechas. Colores fijos
// oscuros (banda índigo) independientes del tema.
export function Reviews({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  if (reviews.length === 0) return null;

  const review = reviews[index];
  const go = (delta: number) =>
    setIndex((i) => (i + delta + reviews.length) % reviews.length);

  return (
    <section className="bg-noche px-6 py-24 text-arena md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sol">
            Lo que viven nuestros viajeros
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">
            El desierto y el mar no se cuentan, se viven.
          </h2>
          {reviews.length > 1 && (
            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Reseña anterior"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-arena/35 transition-colors hover:border-sol hover:bg-sol hover:text-[#2a1a0a]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Reseña siguiente"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-arena/35 transition-colors hover:border-sol hover:bg-sol hover:text-[#2a1a0a]"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="ml-3 flex gap-1.5" aria-hidden="true">
                {reviews.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all duration-400",
                      i === index ? "w-8 bg-sol" : "w-2 bg-arena/35",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <figure key={index} className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-500" aria-live="polite">
          <div className="flex gap-1" role="img" aria-label={`${Math.floor(review.rating)} de 5 estrellas`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-[22px] w-[22px]",
                  i < Math.floor(review.rating) ? "fill-sol text-sol" : "fill-[#3a3050] text-[#3a3050]",
                )}
              />
            ))}
          </div>
          <blockquote className="mt-7 text-2xl font-medium leading-[1.35] tracking-[-0.02em] md:text-4xl">
            &ldquo;{review.description}&rdquo;
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            <span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-sol">
              <Image src={review.photo} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <strong className="text-[17px]">{review.name}</strong>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
