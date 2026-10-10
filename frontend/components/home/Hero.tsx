"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SunsetScene } from "@/components/ui/SunsetScene";

// Cierre rotativo del titular: "Donde el desierto abraza …"
const WORDS = ["el Caribe", "el cielo", "la noche"];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // La palabra cambia sola; se detiene si el usuario pausa o prefiere menos
  // movimiento (WCAG 2.2.2 / 2.3).
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2800);
    return () => clearInterval(id);
  }, [paused, reduceMotion]);

  return (
    <section className="relative flex min-h-[max(640px,92vh)] flex-col overflow-hidden bg-noche text-[#fbf5e9]">
      <SunsetScene />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-56 pt-36">
        <span className="anim-rise inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#efe3cc]">
          <span className="h-0.5 w-9 rounded-full bg-sol" />
          La Guajira · Colombia
        </span>

        <h1
          className="anim-rise mt-6 max-w-[960px] text-[52px] font-extrabold leading-none tracking-[-0.045em] sm:text-7xl lg:text-[104px]"
          style={{ animationDelay: "100ms" }}
        >
          Donde el desierto
          <br />
          abraza{" "}
          <span className="sr-only">{WORDS[index]}</span>
          <span aria-hidden="true" className="inline-block h-[1.04em] overflow-hidden align-bottom">
            <span
              className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ transform: `translateY(-${index * 1.04}em)` }}
            >
              {WORDS.map((w) => (
                <span key={w} className="h-[1.04em] leading-[1.04em] text-sol">
                  {w}
                </span>
              ))}
            </span>
          </span>
        </h1>

        <p
          className="anim-rise mt-7 max-w-[520px] text-lg leading-relaxed text-[#efe3cc] md:text-[19px]"
          style={{ animationDelay: "220ms" }}
        >
          Viajes auténticos por el rincón más al norte de Suramérica, de la mano
          de guías Wayúu.
        </p>

        <div
          className="anim-rise mt-10 flex flex-wrap items-center gap-3.5"
          style={{ animationDelay: "340ms" }}
        >
          <Link
            href="/planes"
            className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-sol px-7 text-base font-bold text-[#2a1a0a] transition-all hover:-translate-y-0.5 hover:gap-3.5 hover:bg-[#f7b456]"
          >
            Ver planes
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/nosotros"
            className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-[#f4ead6]/45 px-7 text-base font-bold text-[#fbf5e9] transition-all hover:-translate-y-0.5 hover:bg-[#f4ead6]/10"
          >
            Cómo viajamos
          </Link>
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Reanudar animación del titular" : "Pausar animación del titular"}
              aria-pressed={paused}
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-full text-[#efe3cc]/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
