import Link from "next/link";
import { DestinationCard } from "./DestinationCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HomeTour } from "@/types/HomeTours";

export function Destinations({ tours }: { tours: HomeTour[] }) {
  return (
    <section className="relative bg-background px-4 py-24 text-foreground md:px-20">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <Eyebrow className="mb-4">Planes destacados</Eyebrow>
            <h2 className="font-display max-w-xl text-3xl font-semibold leading-[1.08] md:text-5xl">
              Elige tu próxima aventura
            </h2>
          </div>

          <Link
            href="/planes"
            className="text-sm font-bold text-barro transition-colors hover:text-primary"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((destination) => (
            <DestinationCard
              key={destination.id}
              image={destination.image}
              location={destination.location}
              title={destination.title}
              url={destination.url}
              price={String(destination.price)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
