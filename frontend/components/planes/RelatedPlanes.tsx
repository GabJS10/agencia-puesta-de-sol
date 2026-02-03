"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DestinationCard } from "@/components/home/DestinationCard";
import { Button } from "@/components/ui/button";
import { HomeTour } from "@/types/HomeTours";

interface RelatedPlanesProps {
  planes: HomeTour[];
}

export function RelatedPlanes({ planes }: RelatedPlanesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 400;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (planes.length === 0) return null;

  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              También te podría interesar
            </h2>
            <p className="text-muted-foreground">
              Descubre otros planes increíbles en la región
            </p>
          </div>

          <div className="flex gap-4 self-end md:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-surface border-border hover:bg-surface-hover hover:border-primary/50 text-foreground transition-all duration-300 w-10 h-10"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-surface border-border hover:bg-surface-hover hover:border-primary/50 text-foreground transition-all duration-300 w-10 h-10"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {planes.map((plane) => (
            <div key={plane.id} className="snap-start flex-none w-[280px] md:w-[320px]">
              <DestinationCard
                image={plane.image}
                location={plane.location}
                title={plane.title}
                url={plane.url}
                price={String(plane.price)}
                className="w-full h-[400px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
