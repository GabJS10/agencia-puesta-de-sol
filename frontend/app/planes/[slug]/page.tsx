import { STRAPI_HOST } from "@/lib/strapi";
import { getPlanBySlug } from "@/lib/get-plan-by-slug";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";
import { PlanGallery } from "@/components/planes/PlanGallery";
import { PlanTabs } from "@/components/planes/PlanTabs";
import { ReservationDate } from "@/components/planes/ReservationDate";

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan) {
    notFound();
  }

  // Prepare tabs data
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
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Spacer for fixed navbar with dark background for visibility */}
      <div className="w-full h-24 bg-neutral-950" />

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Breadcrumb / Back Button */}
        <div className="mb-8">
          <Link
            href="/planes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors "
          >
            <ArrowLeft size={16} />
            Volver a planes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">
          {/* Left Column: Gallery */}
          <div>
            <PlanGallery
              mainImage={plan.photo}
              gallery={plan.gallery}
              baseUrl={STRAPI_HOST || "http://localhost:1337"}
            />
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {plan.plan_type.type}
                </span>
                {plan.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {tag.element}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {plan.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin size={18} />
                <span className="text-lg">{plan.plan_location.location}</span>
              </div>

              <div className="text-3xl font-bold text-primary mb-8">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  / por persona
                </span>
              </div>

              {/* Quick Info / Benefits */}
              <div className="space-y-3 mb-8 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Confirmación inmediata</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span>Pago seguro garantizado</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <MapPin size={16} className="text-green-500" />
                  <span>Guías locales expertos</span>
                </div>
              </div>

              {/* CTA Actions */}
              <div className="mt-auto space-y-4">
                <ReservationDate />
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-sm cursor-pointer">
                  Reservar Ahora
                </button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  * Precios sujetos a cambios según temporada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="max-w-4xl">
          <PlanTabs items={tabsItems} />
        </div>
      </div>
    </main>
  );
}
