"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Mock Data
const slides = [
  {
    id: 1,
    title: "MONTAÑAS MÁGICAS",
    description:
      "Descubre la serenidad de las cumbres más altas y los paisajes que te dejarán sin aliento.",
    image: "/hero-bg.png", // Existing image
    href: "/montañas-magicas",
  },
  {
    id: 2,
    title: "PLAYAS DORADAS",
    description:
      "Relájate en arenas cálidas y aguas cristalinas donde el sol nunca deja de brillar.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder
    href: "/playas-doradas",
  },
  {
    id: 3,
    title: "BOSQUES ENCANTADOS",
    description:
      "Adéntrate en la naturaleza más pura y conecta con el entorno en una experiencia única.",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf9d4ff1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder
    href: "/bosques-encantados",
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-black">
      {/* Background Image Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* We use unoptimized for the placeholder to work if domain not configured in next.config */}
          {/* For local file /hero-bg.png it works fine. Ideally we configure domains, but unoptimized is safer for placeholders now. */}
          <div className="absolute inset-0">
            <Image
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              fill
              priority
              className="object-cover opacity-90"
              unoptimized={slides[currentIndex].image.startsWith("http")}
            />
            {/* Helper gradient for bottom text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-16 px-6 md:px-12 max-w-[1920px] mx-auto">
        {/* Navigation Arrows (Sides - Vertically Centered) */}
        <button
          onClick={prevSlide}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center text-white/70 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="hidden md:block w-4 h-4 md:w-6 md:h-6 stroke-1" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center text-white/70 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-full"
        >
          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 stroke-1" />
        </button>

        {/* Bottom UI Elements */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full mt-auto pl-4 md:pl-10 pr-4 md:pr-10 gap-6 md:gap-0">
          {/* Bottom Left: Title & Description */}
          <div className="flex flex-col gap-4 max-w-xl min-h-[150px] justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[currentIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-lg md:text-3xl font-bold text-white tracking-wide uppercase font-serif-variation text-left">
                  {slides[currentIndex].title}
                </h2>
                <p className="text-white/80 text-sm md:text-lg font-light tracking-wide mt-2 text-left">
                  {slides[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Right: CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-2 self-start md:self-auto"
          >
            <Link
              href={slides[currentIndex].href}
              className="group relative px-8 py-2 text-sm font-medium overflow-hidden rounded-lg border border-white text-white hover:text-black hover:bg-white transition-all duration-300 inline-block whitespace-nowrap"
            >
              SABER MAS
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
