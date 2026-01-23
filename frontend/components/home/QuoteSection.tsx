"use client";

import Image from "next/image";

interface Props {
  author: string;
  phrase: string;
  image: string;
}

export function QuoteSection({ author, phrase, image }: Props) {
  return (
    <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image - Guajira Style (Desert/Ocean contrast) */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Paisaje de la Guajira"
          fill
          className="object-cover"
        />
        {/* Dark Overlay for text readability - Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-background/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-foreground max-w-5xl">
        <div className="w-16 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
        <blockquote className="text-2xl md:text-5xl font-bold leading-tight mb-8 font-serif tracking-tight">
          &quot;{phrase}&quot;
        </blockquote>
        <cite className="block text-xl md:text-2xl text-primary font-medium not-italic tracking-wide uppercase">
          — {author}
        </cite>
      </div>
    </section>
  );
}
