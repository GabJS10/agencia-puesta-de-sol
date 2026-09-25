import { resolveMedia } from "@/lib/media-url";
import { getPlanBySlug } from "@/lib/get-plan-by-slug";
import { getPlanes } from "@/lib/get-planes";
import { getPlanCalendar } from "@/lib/get-plan-availability";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, CheckCircle2, ShieldCheck, Award } from "lucide-react";
import { PlanGallery } from "@/components/planes/PlanGallery";
import { PlanTabs } from "@/components/planes/PlanTabs";
import { ReservationForm } from "@/components/planes/ReservationForm";
import { RelatedPlanes } from "@/components/planes/RelatedPlanes";
import { formatPrice } from "@/helpers/formatPrice";
import { Plane } from "@/types/Planes";

// Consulta la BD: renderizar en cada request (el build no alcanza el Postgres interno).
export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [plan, planesRes] = await Promise.all([
    getPlanBySlug(slug),
    getPlanes({ page: 1 }),
  ]);

  if (!plan) {
    notFound();
  }

  const { unavailableDays, remainingByDay } = await getPlanCalendar({
    id: plan.id,
    availabilityMode: plan.availabilityMode,
    capacity: plan.capacity,
    bookingsOpen: plan.bookingsOpen,
  });

  const relatedPlanes = planesRes.data
    .filter((p: Plane) => p.url !== slug)
    .slice(0, 5)
    .map((p: Plane) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      location: p.plan_location?.location || "Guajira",
      image: resolveMedia(p.photo?.url),
      url: `/planes/${p.url}`,
    }));

  const tabsItems = [
    { id: "description", label: "Descripción", content: plan.description },
    { id: "itinerary", label: "Itinerario", content: plan.itinerary },
    { id: "includes", label: "Incluye", content: plan.includes },
    {
      id: "recommendations",
      label: "Recomendaciones",
      content: plan.recommendations,
    },
  ];

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-28">
        {/* Breadcrumb */}
        <nav className="mb-5 text-sm font-semibold text-muted-foreground">
          <Link href="/" className="text-barro hover:text-primary">
            Inicio
          </Link>{" "}
          /{" "}
          <Link href="/planes" className="text-barro hover:text-primary">
            Planes
          </Link>{" "}
          / {plan.title}
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-barro">
                {plan.plan_type.type}
              </span>
              {plan.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
                >
                  {tag.element}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] md:text-5xl">
              {plan.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {plan.plan_location.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Salidas programadas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-mar" />
                Guías Wayúu certificados
              </span>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-sm font-semibold text-muted-foreground">desde</div>
            <div className="font-display text-4xl font-semibold text-barro">
              {formatPrice(plan.price)}
            </div>
            <div className="text-sm text-muted-foreground">por persona</div>
          </div>
        </div>

        {/* Body: galería + tabs (izq) / reserva (der) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <PlanGallery mainImage={plan.photo} gallery={plan.gallery} baseUrl="" />

            <div className="mt-12">
              <PlanTabs items={tabsItems} />
            </div>
          </div>

          {/* Reserva */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-2xl font-semibold">
                  Solicita este plan
                </h2>
                <p className="mb-5 mt-1 text-sm text-muted-foreground">
                  Te contactamos para confirmar disponibilidad.
                </p>

                <ReservationForm
                  planId={plan.id}
                  planTitle={plan.title}
                  price={plan.price}
                  type={plan.plan_type.type}
                  availabilityMode={plan.availabilityMode}
                  capacity={plan.capacity}
                  bookingMode={plan.bookingMode}
                  bookingsOpen={plan.bookingsOpen}
                  unavailableDates={unavailableDays}
                  remainingByDay={remainingByDay}
                />

                <div className="mt-6 space-y-3 border-t border-border pt-5">
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-mar" />
                    Sin pagos por adelantado
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <ShieldCheck className="h-4 w-4 text-mar" />
                    Reserva sujeta a confirmación
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 text-mar" />
                    Guías locales expertos
                  </div>
                  {/* TODO: reemplazar los placeholders con los datos reales de la agencia */}
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Award className="h-4 w-4 text-mar" />
                    RNT [NÚMERO RNT] · [AÑOS] años operando
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Relacionados */}
        <div className="mt-20">
          <RelatedPlanes planes={relatedPlanes} />
        </div>
      </div>
    </main>
  );
}
