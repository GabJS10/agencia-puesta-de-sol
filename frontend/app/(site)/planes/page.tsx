import Link from "next/link";
import { DestinationCard } from "@/components/home/DestinationCard";
import { FilterBar } from "@/components/planes/FilterBar";
import { PaginationControls } from "@/components/planes/PaginationControls";
import { SearchInput } from "@/components/planes/SearchInput";
import { PageHero } from "@/components/ui/PageHero";
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

function availabilityTag(plan: Plane) {
  if (!plan.bookingsOpen) return { label: "Reservas cerradas", muted: true };
  return plan.availabilityMode === "CAPACITY"
    ? { label: `Cupo ${plan.capacity}/día` }
    : { label: "Salida privada" };
}

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

  const view = sp.view === "list" ? "list" : "grid";
  const total = meta.pagination.total;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        eyebrow="Planes"
        title="Todos los planes"
        description={`${total} ${total === 1 ? "destino" : "destinos"} por el desierto, el mar y la cultura Wayúu. Encuentra la salida que va con tu ritmo.`}
      >
        <SearchInput />
      </PageHero>

      <section className="flex-1 scroll-mt-24 px-6 pb-28 pt-10" id="planes">
        <div className="mx-auto max-w-7xl">
          <FilterBar types={types} locations={locations} />

          <p className="mb-6 mt-8 text-[15px] font-semibold text-muted-foreground">
            Mostrando {displayPlanes.length} de {total}{" "}
            {total === 1 ? "plan" : "planes"}
          </p>

          {displayPlanes.length === 0 ? (
            <div className="rounded-[22px] border-[1.5px] border-dashed border-border px-5 py-20 text-center">
              <p className="text-2xl font-extrabold">Ningún plan coincide</p>
              <p className="mb-6 mt-2 text-muted-foreground">
                Prueba con otro destino o quita los filtros.
              </p>
              <Link
                href="/planes"
                className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 font-semibold text-background"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div
              className={
                view === "list"
                  ? "grid grid-cols-1 gap-6"
                  : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {displayPlanes.map((plan: Plane, i: number) => (
                <DestinationCard
                  key={plan.id}
                  index={i}
                  layout={view}
                  image={resolveMedia(plan.photo.url)}
                  title={plan.title}
                  location={plan.location}
                  price={plan.price.toString()}
                  url={`/planes/${plan.url}`}
                  badge={plan.plan_type?.type || undefined}
                  availabilityTag={availabilityTag(plan)}
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
