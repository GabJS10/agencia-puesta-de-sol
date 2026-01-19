import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Destinations } from "@/components/home/Destinations";
import { Location } from "@/components/home/Location";
import { Reviews } from "@/components/home/Reviews";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { QuoteSection } from "@/components/home/QuoteSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navbar />
      <Hero />
      <About />
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
