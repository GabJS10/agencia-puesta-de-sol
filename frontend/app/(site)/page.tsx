import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Destinations } from "@/components/home/Destinations";
import { Reviews } from "@/components/home/Reviews";
import { CtaBand } from "@/components/home/CtaBand";
import { resolveMedia } from "@/lib/media-url";
//api call
import { getHome } from "@/lib/get-home";
import { getHomeTours } from "@/lib/get-home-tours";
import { getPlanLocations } from "@/lib/get-plan-locations";
//types call
import { Review, UserReview } from "@/types/Reviews";

// Los planes destacados salen de la BD; el build no alcanza el Postgres interno.
export const dynamic = "force-dynamic";

// Destinos de la banda si aún no hay suficientes ubicaciones en la BD.
const FALLBACK_PLACES = [
  "Cabo de la Vela",
  "Punta Gallinas",
  "Dunas de Taroa",
  "Manaure",
  "Riohacha",
  "Bahía Hondita",
];

export default async function Home() {
  const [home, { homeTours }, locations] = await Promise.all([
    getHome(),
    getHomeTours(),
    getPlanLocations(),
  ]);

  const HomeReviews: Review[] = home.HomeReviews.map((review: UserReview) => ({
    description: review.description,
    rating: review.rating,
    photo: resolveMedia(review.photo.url),
    name: review.name,
  }));

  const places =
    locations.length >= 4 ? locations.map((l) => l.location) : FALLBACK_PLACES;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Hero />
      <Marquee items={places} />
      <HowItWorks />
      <Destinations tours={homeTours} />
      <Reviews reviews={HomeReviews} />
      <CtaBand />
    </main>
  );
}
