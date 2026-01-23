"use client";

import Image from "next/image";

interface Props {
  author: string;
  phrase: string;
  image: string;
}

export function QuoteSection({ author, phrase, image }: Props) {
  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image - Guajira Style (Desert/Ocean contrast) */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Paisaje de la Guajira"
          fill
          className="object-cover"
        />
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white max-w-4xl">
        <blockquote className="text-xl md:text-3xl font-medium leading-relaxed italic mb-6">
          &quot;{phrase}&quot;
        </blockquote>
        <cite className="block text-lg md:text-xl font-light not-italic">
          — {author}
        </cite>
      </div>
    </section>
  );
}
