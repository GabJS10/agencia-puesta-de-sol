"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HeroTour } from "@/types/HeroTours";

export function Hero({ slides }: { slides: HeroTour[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-background">
      {/* Background Image Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {/* We use unoptimized for the placeholder to work if domain not configured in next.config */}
          {/* For local file /hero-bg.png it works fine. Ideally we configure domains, but unoptimized is safer for placeholders now. */}
          <div className="absolute inset-0">
            <Image
              src={`${slides[currentIndex].image}`}
              alt={slides[currentIndex].title}
              fill
              priority
              className="object-cover"
            />
            {/* Helper gradient for bottom text readability - Minimalist adjustment */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent dark:from-background dark:via-background/40 dark:to-transparent opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent opacity-20 dark:from-background/60 dark:to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Navigation Arrows (Sides - Vertically Centered) */}
        <button
          onClick={prevSlide}
          className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-300 z-50 hover:bg-surface/20 rounded-full"
        >
          <ArrowLeft className="hidden md:block w-6 h-6 stroke-1" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-300 z-50 hover:bg-surface/20 rounded-full"
        >
          <ArrowRight className="w-6 h-6 stroke-1" />
        </button>

        {/* Bottom UI Elements */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full mt-auto gap-8 md:gap-0">
          {/* Bottom Left: Title & Description */}
          <div className="flex flex-col gap-6 max-w-2xl min-h-[150px] justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[currentIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
                  {slides[currentIndex].title}
                </h2>
                <div className="w-12 h-0.5 bg-primary mt-6 mb-4" />
                <p className="text-foreground/90 text-lg md:text-xl font-light leading-relaxed max-w-lg">
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
            className="mb-4 self-start md:self-auto"
          >
            <Link
              href={slides[currentIndex].url}
              className="group relative px-8 py-3 text-sm font-semibold tracking-wider uppercase rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 inline-flex items-center gap-2"
            >
              Saber Más
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
