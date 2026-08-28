import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Destinations } from "@/components/home/Destinations";
import { Location } from "@/components/home/Location";
import { Reviews } from "@/components/home/Reviews";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { QuoteSection } from "@/components/home/QuoteSection";
import { KanasBand } from "@/components/ui/KanasBand";
import { resolveMedia } from "@/lib/media-url";
//api call
import { getHome } from "@/lib/get-home";
//types call
import { HeroTour, tour } from "@/types/HeroTours";
import { HomeTour, HTour } from "@/types/HomeTours";
import { Review, UserReview } from "@/types/Reviews";

export default async function Home() {
  const home = await getHome();

  const HeroTours: HeroTour[] = home.HeroTours.map((tour: tour) => {
    return {
      id: tour.id,
      title: tour.title,
      description: tour.description,
      image: resolveMedia(tour.image.url),
      url: tour.url,
    };
  });

  const HomeTours: HomeTour[] = home.HomeTours.map((tour: HTour) => {
    return {
      id: tour.id,
      title: tour.title,
      price: tour.price,
      location: tour.location,
      image: resolveMedia(tour.image.url),
      url: tour.url,
    };
  });

  const HomeReviews: Review[] = home.HomeReviews.map((review: UserReview) => {
    return {
      description: review.description,
      rating: review.rating,
      photo: resolveMedia(review.photo.url),
      name: review.name,
    };
  });

  const footer: {
    phrase: string;
    author: string;
    image: {
      url: string;
    };
  } = home.Footer;

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Hero slides={HeroTours} />
      <About stats={home.estadistica} description={home.sobreNosotros} />
      <KanasBand height={14} className="opacity-70" />
      <ScrollReveal>
        <Destinations tours={HomeTours} />
      </ScrollReveal>
      <ScrollReveal>
        <Reviews reviews={HomeReviews} />
      </ScrollReveal>
      <KanasBand height={14} className="opacity-70" />
      <Location />
      <QuoteSection
        phrase={footer.phrase}
        author={footer.author}
        image={resolveMedia(footer.image.url)}
      />
    </main>
  );
}
