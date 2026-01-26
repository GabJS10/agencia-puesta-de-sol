import { PlanesHero } from "@/components/planes/PlanesHero";
import { FilterSidebar } from "@/components/planes/FilterSidebar";
import { DestinationCard } from "@/components/home/DestinationCard";
import { getPlanes } from "@/lib/get-planes";
import { getPlanLocations } from "@/lib/get-plan-locations";
import { getPlanTypes } from "@/lib/get-plan-types";
import { STRAPI_HOST } from "@/lib/strapi";
import { Plane } from "@/types/Planes";
import { PaginationControls } from "@/components/planes/PaginationControls";
import { SortSelect } from "@/components/planes/SortSelect";

export const metadata = {
  title: "Planes | Puesta del Sol",
  description:
    "Descubre nuestros planes turísticos en La Guajira y alrededores.",
};

export default async function PlanesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const page =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page)
      : 1;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search.toLowerCase()
      : "";
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "";

  // Obtener filtros de la URL (pueden ser string o array)
  const typeFilter =
    typeof resolvedSearchParams.type === "string"
      ? [resolvedSearchParams.type]
      : Array.isArray(resolvedSearchParams.type)
        ? resolvedSearchParams.type
        : [];

  const locationFilter =
    typeof resolvedSearchParams.location === "string"
      ? [resolvedSearchParams.location]
      : Array.isArray(resolvedSearchParams.location)
        ? resolvedSearchParams.location
        : [];

  // 1. Obtener datos (Planes, Locations, Types) en paralelo
  const [planesRes, locations, types] = await Promise.all([
    getPlanes(page),
    getPlanLocations(),
    getPlanTypes(),
  ]);

  const { data: planes, meta } = planesRes;

  // 2. Filtrado Local (Sobre los items recibidos de la API en esta página)
  let displayPlanes = planes;

  // Filtrar por búsqueda (Título)
  if (search) {
    displayPlanes = displayPlanes.filter((plan: Plane) =>
      plan.title.toLowerCase().includes(search),
    );
  }

  // Filtrar por Tipo (checkboxes)
  if (typeFilter.length > 0) {
    displayPlanes = displayPlanes.filter(
      (plan: Plane) =>
        plan.plan_type && typeFilter.includes(plan.plan_type.type),
    );
  }

  // Filtrar por Ubicación (checkboxes)
  if (locationFilter.length > 0) {
    displayPlanes = displayPlanes.filter(
      (plan: Plane) =>
        plan.plan_location &&
        locationFilter.includes(plan.plan_location.location),
    );
  }

  // 3. Ordenamiento Local
  if (sort === "price:asc") {
    displayPlanes.sort((a: Plane, b: Plane) => a.price - b.price);
  } else if (sort === "price:desc") {
    displayPlanes.sort((a: Plane, b: Plane) => b.price - a.price);
  } else if (sort === "createdAt:desc") {
    displayPlanes.sort((a: Plane, b: Plane) => b.id - a.id);
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <PlanesHero />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar con filtros dinámicos */}
          <FilterSidebar locations={locations} types={types} />

          {/* Main Content */}
          <div className="flex-1" id="planes">
            {/* Header Controls */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <p className="text-muted font-medium">
                Mostrando {displayPlanes.length} de {meta.pagination.total}{" "}
                resultados
              </p>

              <SortSelect />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayPlanes.map((plan: Plane) => (
                <DestinationCard
                  key={plan.id}
                  image={`${STRAPI_HOST}${plan.photo.url}`}
                  title={plan.title}
                  location={plan.location}
                  price={plan.price.toString()}
                  url={`/planes/${plan.url}`}
                />
              ))}
              {displayPlanes.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No se encontraron planes que coincidan con tus filtros en esta
                  página.
                </div>
              )}
            </div>

            {/* Pagination */}
            <PaginationControls
              page={meta.pagination.page}
              pageCount={meta.pagination.pageCount}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
