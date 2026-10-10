import { DestinationCard } from "@/components/home/DestinationCard";
import { HomeTour } from "@/types/HomeTours";

interface RelatedPlanesProps {
  planes: HomeTour[];
}

export function RelatedPlanes({ planes }: RelatedPlanesProps) {
  if (planes.length === 0) return null;

  return (
    <section>
      <h2 className="mb-7 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        También te puede gustar
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {planes.map((plane, i) => (
          <DestinationCard
            key={plane.id}
            index={i}
            image={plane.image}
            location={plane.location}
            title={plane.title}
            url={plane.url}
            price={String(plane.price)}
          />
        ))}
      </div>
    </section>
  );
}
