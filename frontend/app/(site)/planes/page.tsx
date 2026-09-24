import Link from "next/link";
import { DestinationCard } from "@/components/home/DestinationCard";
import { FilterBar } from "@/components/planes/FilterBar";
import { PaginationControls } from "@/components/planes/PaginationControls";
import { getPlanes } from "@/lib/get-planes";
import { getPlanLocations } from "@/lib/get-plan-locations";
import { getPlanTypes } from "@/lib/get-plan-types";
import { resolveMedia } from "@/lib/media-url";
import { Plane } from "@/types/Planes";

export const metadata = {
  title: "Planes | Puesta del Sol",
  description:
    "Descubre nuestros planes turísticos en La Guajira y alrededores.",
};

// Consulta la BD: renderizar en cada request (el build no alcanza el Postgres interno).
export const dynamic = "force-dynamic";

export default async function PlanesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const page = typeof sp.page === "string" ? parseInt(sp.page) : 1;
  const search = typeof sp.search === "string" ? sp.search.toLowerCase() : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "";

  const typeFilter =
    typeof sp.type === "string"
      ? [sp.type]
      : Array.isArray(sp.type)
        ? sp.type
        : [];
  const locationFilter =
    typeof sp.location === "string"
      ? [sp.location]
      : Array.isArray(sp.location)
        ? sp.location
        : [];

  const [planesRes, locations, types] = await Promise.all([
    getPlanes({
      page,
      search,
      sort,
      types: typeFilter,
      locations: locationFilter,
    }),
    getPlanLocations(),
    getPlanTypes(),
  ]);

  const { data: displayPlanes, meta } = planesRes;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <section className="px-6 pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2.5 text-sm font-semibold text-muted-foreground">
            <Link href="/" className="text-barro hover:text-primary">
              Inicio
            </Link>{" "}
            / Planes
          </div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Todos los planes
          </h1>
          <p className="mt-2.5 text-lg text-muted-foreground">
            {meta.pagination.total} destinos por el desierto y el Caribe guajiro.
            Filtra y encuentra tu próxima aventura.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-6 pt-7" id="planes">
        <div className="mx-auto max-w-7xl">
          <FilterBar types={types} locations={locations} />
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 px-6 pt-7">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            Mostrando {displayPlanes.length} de {meta.pagination.total} resultados
          </p>

          {displayPlanes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
              No se encontraron planes que coincidan con tus filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayPlanes.map((plan: Plane) => (
                <DestinationCard
                  key={plan.id}
                  image={resolveMedia(plan.photo.url)}
                  title={plan.title}
                  location={plan.location}
                  price={plan.price.toString()}
                  url={`/planes/${plan.url}`}
                  badge={plan.plan_type?.type || undefined}
                />
              ))}
            </div>
          )}

          <PaginationControls
            page={meta.pagination.page}
            pageCount={meta.pagination.pageCount}
          />
        </div>
      </section>
    </main>
  );
}
