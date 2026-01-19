"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DestinationCard } from "./DestinationCard";
import { Button } from "@/components/ui/button";

const DESTINATIONS = [
  {
    id: 1,
    title: "Cabo de la Vela",
    location: "Uribia, La Guajira",
    price: "450,000",
    image:
      "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?authuser=0&auto=format&fit=crop&q=80&w=1000", // Placeholder
  },
  {
    id: 2,
    title: "Punta Gallinas",
    location: "Uribia, La Guajira",
    price: "650,000",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000", // Placeholder
  },
  {
    id: 3,
    title: "Palomino",
    location: "Dibulla, La Guajira",
    price: "350,000",
    image:
      "https://images.unsplash.com/photo-1544551763-46a42a462691?auto=format&fit=crop&q=80&w=1000", // Placeholder
  },
  {
    id: 4,
    title: "Manaure",
    location: "Manaure, La Guajira",
    price: "300,000",
    image:
      "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&q=80&w=1000", // Placeholder
  },
];

export function Destinations() {
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
    <section className="py-20 bg-[#2a2d2c] px-4 md:px-20 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-6">
          <h2 className="text-3xl md:text-5xl font-bold max-w-xl leading-tight">
            Descubre las maravillas de la guajira
          </h2>

          <div className="flex gap-4 self-end md:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent border-white/20 hover:bg-white/10 text-white hover:text-white"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 text-white hover:text-white"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {DESTINATIONS.map((destination) => (
            <div key={destination.id} className="snap-center">
              <DestinationCard {...destination} className="w-75 md:w-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
