import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { Destinations } from "@/components/home/Destinations";
import { Reviews } from "@/components/home/Reviews";
import { resolveMedia } from "@/lib/media-url";
//api call
import { getHome } from "@/lib/get-home";
import { getHomeTours } from "@/lib/get-home-tours";
//types call
import { Review, UserReview } from "@/types/Reviews";

// Los planes destacados salen de la BD; el build no alcanza el Postgres interno.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, { heroTours, homeTours }] = await Promise.all([
    getHome(),
    getHomeTours(),
  ]);

  const HomeReviews: Review[] = home.HomeReviews.map((review: UserReview) => ({
    description: review.description,
    rating: review.rating,
    photo: resolveMedia(review.photo.url),
    name: review.name,
  }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Hero slides={heroTours} />
      <StatsBar stats={home.estadistica} />
      <Destinations tours={homeTours} />
      <Reviews reviews={HomeReviews} />
    </main>
  );
}
