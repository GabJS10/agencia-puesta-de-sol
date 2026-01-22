import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Destinations } from "@/components/home/Destinations";
import { Location } from "@/components/home/Location";
import { Reviews } from "@/components/home/Reviews";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { QuoteSection } from "@/components/home/QuoteSection";
import { Footer } from "@/components/layout/Footer";

//api call
import { getHome } from "@/lib/get-home";

const stats = [
  { value: "198+", label: "Clientes Felices" },
  { value: "63+", label: "Hoteles" },
  { value: "248+", label: "Guías Expertos" },
];

export default async function Home() {
  const home = await getHome();

  console.log(home);

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navbar />
      <Hero />
      <About stats={home.estadistica} description={home.sobreNosotros} />
      <ScrollReveal>
        <Destinations />
      </ScrollReveal>
      <ScrollReveal>
        <Reviews />
      </ScrollReveal>
      <Location />
      <QuoteSection />
      <Footer />
    </main>
  );
}
