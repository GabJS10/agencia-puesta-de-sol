import { PlanesHero } from "@/components/planes/PlanesHero";
import { FilterSidebar } from "@/components/planes/FilterSidebar";
import { DestinationCard } from "@/components/home/DestinationCard";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: "Planes | Puesta del Sol",
  description:
    "Descubre nuestros planes turísticos en La Guajira y alrededores.",
};

const PLANS = [
  {
    id: 1,
    title:
      "Naturaleza, Gastronomía, Historia y Cultura: Valledupar y La Guajira",
    location: "Valledupar",
    price: 2750000,
    image:
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2070",
    url: "#",
  },
  {
    id: 2,
    title: "Experiencia de Tejeduría Wayuu en la Alta Guajira",
    location: "Cabo de la Vela",
    price: 1350000,
    image:
      "https://images.unsplash.com/photo-1544015759-42b78a9466f3?q=80&w=2070",
    url: "#",
  },
  {
    id: 3,
    title: "Ruta Artesanal: Descubre el origen del tejido Wayuu",
    location: "Riohacha",
    price: 1780000,
    image:
      "https://images.unsplash.com/photo-1563299796-b729d0af54a5?q=80&w=2070",
    url: "#",
  },
  {
    id: 4,
    title: "Aventura en el Desierto: Cabo de la Vela y Punta Gallinas",
    location: "Punta Gallinas",
    price: 2100000,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070",
    url: "#",
  },
  {
    id: 5,
    title: "Santuario de Flamencos y Cultura Wayuu",
    location: "Camarones",
    price: 950000,
    image:
      "https://images.unsplash.com/photo-1547990422-520e55712f67?q=80&w=2070",
    url: "#",
  },
  {
    id: 6,
    title: "Palomino: Río, Mar y Sierra Nevada",
    location: "Palomino",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?q=80&w=2070",
    url: "#",
  },
];

export default function PlanesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <PlanesHero />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <p className="text-muted font-medium">
                Mostrando 1–{PLANS.length} de {PLANS.length} resultados
              </p>

              <div className="relative group">
                <select className="appearance-none bg-surface border border-border hover:border-primary/50 rounded-full px-6 py-2.5 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-foreground">
                  <option>Ordenar por precio: bajo a alto</option>
                  <option>Ordenar por precio: alto a bajo</option>
                  <option>Más populares</option>
                  <option>Más recientes</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {PLANS.map((plan) => (
                <DestinationCard
                  key={plan.id}
                  image={plan.image}
                  title={plan.title}
                  location={plan.location}
                  price={plan.price.toString()}
                  url={plan.url}
                />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-16 flex justify-center gap-2">
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shadow-md flex items-center justify-center">
                1
              </button>
              <button className="w-10 h-10 rounded-full bg-surface border border-border hover:bg-surface-hover transition-colors flex items-center justify-center">
                2
              </button>
              <button className="w-10 h-10 rounded-full bg-surface border border-border hover:bg-surface-hover transition-colors flex items-center justify-center">
                3
              </button>
              <span className="flex items-end px-2 text-muted">...</span>
              <button className="w-10 h-10 rounded-full bg-surface border border-border hover:bg-surface-hover transition-colors flex items-center justify-center">
                12
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
