import { resolveMedia } from "@/lib/media-url";
import { getPlanBySlug } from "@/lib/get-plan-by-slug";
import { getPlanes } from "@/lib/get-planes";
import { getPlanCalendar } from "@/lib/get-plan-availability";
import { notFound } from "next/navigation";
import { MapPin, Users, CheckCircle2, ShieldCheck, Award } from "lucide-react";
import { PlanGallery } from "@/components/planes/PlanGallery";
import { PlanTabs } from "@/components/planes/PlanTabs";
import { ReservationForm } from "@/components/planes/ReservationForm";
import { AvailabilitySummary } from "@/components/planes/AvailabilitySummary";
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

  const availability = await getPlanCalendar({
    id: plan.id,
    availabilityMode: plan.availabilityMode,
    capacity: plan.capacity,
    bookingsOpen: plan.bookingsOpen,
  });

  const relatedPlanes = planesRes.data
    .filter((p: Plane) => p.url !== slug)
    .slice(0, 3)
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

  const pill =
    "inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-sm font-bold";

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <PlanGallery
          mainImage={plan.photo}
          gallery={plan.gallery}
          baseUrl=""
          title={plan.title}
          typeLabel={plan.plan_type.type || undefined}
        />

        {/* Body: info + tabs (izq) / reserva (der) */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className={pill}>
                <MapPin className="h-4 w-4 text-barro" />
                {plan.plan_location.location}
              </span>
              <span className={pill}>
                <Users className="h-4 w-4 text-barro" />
                {plan.availabilityMode === "CAPACITY"
                  ? `Cupo de ${plan.capacity} personas por día`
                  : "Salida privada"}
              </span>
              <span className={pill}>
                <ShieldCheck className="h-4 w-4 text-barro" />
                Guías Wayúu certificados
              </span>
              {plan.plan_type.type && (
                <span className="inline-flex items-center rounded-full bg-foreground px-3.5 py-2 text-sm font-bold text-background">
                  {plan.plan_type.type}
                </span>
              )}
              {plan.tags.map((tag) => (
                <span key={tag.id} className={pill}>
                  {tag.element}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <PlanTabs items={tabsItems} />
            </div>
          </div>

          {/* Reserva */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[26px] bg-card p-7 shadow-[0_30px_60px_-36px_rgba(74,45,20,0.45)]">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-muted-foreground">desde</span>
                <span className="text-[32px] font-extrabold tracking-[-0.03em]">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-sm text-muted-foreground">por persona</span>
              </div>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">
                Elige tu fecha y te confirmamos por correo.
              </p>

              <AvailabilitySummary
                availabilityMode={plan.availabilityMode}
                capacity={plan.capacity}
                bookingMode={plan.bookingMode}
                bookingsOpen={plan.bookingsOpen}
                minDays={plan.minDays}
                maxDays={plan.maxDays}
                availability={availability}
              />

              <ReservationForm
                planId={plan.id}
                planTitle={plan.title}
                price={plan.price}
                type={plan.plan_type.type}
                availabilityMode={plan.availabilityMode}
                capacity={plan.capacity}
                bookingMode={plan.bookingMode}
                bookingsOpen={plan.bookingsOpen}
                minDays={plan.minDays}
                maxDays={plan.maxDays}
                unavailableDates={availability.unavailableDays}
                tentativeDates={availability.tentativeDays}
                remainingByDay={availability.remainingByDay}
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
          </aside>
        </div>

        {/* Relacionados */}
        <div className="mt-24">
          <RelatedPlanes planes={relatedPlanes} />
        </div>
      </div>
    </main>
  );
}
