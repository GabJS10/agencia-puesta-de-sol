import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Destinations } from "@/components/home/Destinations";
import { Location } from "@/components/home/Location";
import { Reviews } from "@/components/home/Reviews";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { QuoteSection } from "@/components/home/QuoteSection";
import { Footer } from "@/components/layout/Footer";
import { STRAPI_HOST } from "@/lib/strapi";
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
      image: `${STRAPI_HOST}${tour.image.url}`,
      url: tour.url,
    };
  });

  const HomeTours: HomeTour[] = home.HomeTours.map((tour: HTour) => {
    return {
      id: tour.id,
      title: tour.title,
      price: tour.price,
      location: tour.location,
      image: `${STRAPI_HOST}${tour.image.url}`,
      url: tour.url,
    };
  });

  const HomeReviews: Review[] = home.HomeReviews.map((review: UserReview) => {
    return {
      description: review.description,
      rating: review.rating,
      photo: `${STRAPI_HOST}${review.photo.url}`,
      name: review.name,
    };
  });

  const footer: {
    phrase: string;
    author: string;
    number: string;
    email: string;
    AboutFooter: string;
    location: string;
    image: {
      url: string;
    };
  } = home.Footer;

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navbar />
      <Hero slides={HeroTours} />
      <About stats={home.estadistica} description={home.sobreNosotros} />
      <ScrollReveal>
        <Destinations tours={HomeTours} />
      </ScrollReveal>
      <ScrollReveal>
        <Reviews reviews={HomeReviews} />
      </ScrollReveal>
      <Location />
      <QuoteSection
        phrase={footer.phrase}
        author={footer.author}
        image={`${STRAPI_HOST}${footer.image.url}`}
      />
      <Footer
        number={footer.number}
        email={footer.email}
        location={footer.location}
        AboutFooter={footer.AboutFooter}
      />
    </main>
  );
}
