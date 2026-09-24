import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { Destinations } from "@/components/home/Destinations";
import { Reviews } from "@/components/home/Reviews";
import { resolveMedia } from "@/lib/media-url";
//api call
import { getHome } from "@/lib/get-home";
//types call
import { HeroTour, tour } from "@/types/HeroTours";
import { HomeTour, HTour } from "@/types/HomeTours";
import { Review, UserReview } from "@/types/Reviews";

export default async function Home() {
  const home = await getHome();

  const HeroTours: HeroTour[] = home.HeroTours.map((tour: tour) => ({
    id: tour.id,
    title: tour.title,
    description: tour.description,
    image: resolveMedia(tour.image.url),
    url: tour.url,
  }));

  const HomeTours: HomeTour[] = home.HomeTours.map((tour: HTour) => ({
    id: tour.id,
    title: tour.title,
    price: tour.price,
    location: tour.location,
    image: resolveMedia(tour.image.url),
    url: tour.url,
  }));

  const HomeReviews: Review[] = home.HomeReviews.map((review: UserReview) => ({
    description: review.description,
    rating: review.rating,
    photo: resolveMedia(review.photo.url),
    name: review.name,
  }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Hero slides={HeroTours} />
      <StatsBar stats={home.estadistica} />
      <Destinations tours={HomeTours} />
      <Reviews reviews={HomeReviews} />
    </main>
  );
}
