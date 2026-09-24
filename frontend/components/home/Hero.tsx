"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroTour } from "@/types/HeroTours";

export function Hero({ slides }: { slides: HeroTour[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fondo que se alterna solo; el copy de marca permanece fijo y centrado.
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-noche">
      {/* Fondo: imágenes que se alternan */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Degradado atardecer: noche → barro → noche para legibilidad */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(23,16,38,0.55) 0%, rgba(184,92,56,0.28) 45%, rgba(23,16,38,0.72) 100%)",
        }}
      />

      {/* Contenido centrado */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[#fbf5e9]">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-block rounded-full border border-[#f4ead6]/50 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm"
        >
          La Guajira · Colombia
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display max-w-[820px] text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
        >
          Donde el desierto abraza el Caribe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-xl text-lg font-light leading-relaxed text-[#efe3cc] md:text-xl"
        >
          Viajes auténticos por el rincón más al norte de Suramérica, de la mano
          de guías Wayúu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/planes"
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-black/20 transition-all hover:bg-primary/90"
          >
            Ver planes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/nosotros"
            className="inline-flex items-center rounded-md border border-[#f4ead6]/55 bg-white/10 px-8 py-3.5 text-base font-bold text-[#fbf5e9] backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Cómo viajamos
          </Link>
        </motion.div>

        {/* Indicadores del carrusel de fondo */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                aria-label={`Ver ${slide.title}`}
                onClick={() => setCurrentIndex(i)}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i === currentIndex
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-white/50 hover:bg-white/80")
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
