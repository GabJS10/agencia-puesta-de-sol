"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./ReviewCard";
import { Review } from "@/types/Reviews";

export function Reviews({ reviews }: { reviews: Review[] }) {
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

  return (
    <section className="py-24 bg-white px-4 md:px-20 text-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="text-left max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              ¡Únete a cientos de clientes satisfechos!
            </h2>
            <p className="text-gray-600 text-lg">
              No dejes que el día a día te detenga. Únete a miles de personas
              que han vivido experiencias únicas.
            </p>
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent border-gray-300 hover:bg-gray-100 text-black"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-black border-black hover:bg-gray-800 text-white hover:text-white"
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
          {reviews.map((review, index) => (
            <div key={index} className="snap-center h-full">
              <ReviewCard
                {...review}
                className="w-80 md:w-96 min-h-75 shadow-lg border border-gray-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
