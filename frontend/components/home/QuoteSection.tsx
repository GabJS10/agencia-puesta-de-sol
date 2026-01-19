"use client";

import Image from "next/image";

export function QuoteSection() {
  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image - Guajira Style (Desert/Ocean contrast) */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?authuser=0&auto=format&fit=crop&q=80&w=2000"
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
          &quot;El viaje no es algo en lo que eres bueno. Es algo que haces.
          Como respirar.&quot;
        </blockquote>
        <cite className="block text-lg md:text-xl font-light not-italic">
          — Gayle Forman
        </cite>
      </div>
    </section>
  );
}
