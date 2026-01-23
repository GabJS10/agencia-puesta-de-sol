"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DestinationCard } from "./DestinationCard";
import { Button } from "@/components/ui/button";
import { HomeTour } from "@/types/HomeTours";

export function Destinations({ tours }: { tours: HomeTour[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 400; // Adjust scroll amount as needed
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="py-24 bg-background px-4 md:px-20 text-foreground relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
             <span className="text-primary text-xs font-bold tracking-widest uppercase mb-4 block">
              Explora
            </span>
            <h2 className="text-3xl md:text-5xl font-bold max-w-xl leading-tight">
              Descubre las maravillas de la Guajira
            </h2>
          </div>

          <div className="flex gap-4 self-end md:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-surface border-foreground/10 hover:bg-surface-hover hover:border-primary/50 text-foreground transition-all duration-300 w-12 h-12"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-primary border-primary hover:bg-primary/80 hover:border-primary text-white shadow-[0_0_15px_var(--color-brand-glow)] transition-all duration-300 w-12 h-12"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pt-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tours.map((destination) => (
            <div key={destination.id} className="snap-center">
              <DestinationCard
                image={destination.image}
                location={destination.location}
                title={destination.title}
                url={destination.url}
                price={String(destination.price)}
                className="w-[300px] md:w-[400px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
