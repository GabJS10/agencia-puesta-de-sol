"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/helpers/formatPrice";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HomeTour } from "@/types/HomeTours";

const ALL = "__all__";

// Planes destacados como paneles que se expanden al pasar el cursor (o al
// enfocar/tocar). En móvil se apilan como acordeón.
export function Destinations({ tours }: { tours: HomeTour[] }) {
  const types = useMemo(
    () => [...new Set(tours.map((t) => t.type).filter((t): t is string => !!t))],
    [tours],
  );
  const [tab, setTab] = useState(ALL);
  const [openId, setOpenId] = useState<number | null>(null);

  const list = tab === ALL ? tours : tours.filter((t) => t.type === tab);
  const activeId = list.some((t) => t.id === openId) ? openId : list[0]?.id;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      <div className="mb-9 flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <div>
          <Eyebrow>Planes destacados</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.04] tracking-[-0.035em] md:text-[56px]">
            Elige tu próxima aventura
          </h2>
        </div>
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {[ALL, ...types].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn(
                  "min-h-11 rounded-full border-[1.5px] px-5 text-[15px] font-semibold transition-all",
                  tab === t
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground",
                )}
              >
                {t === ALL ? "Todos" : t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3.5 md:h-[520px] md:flex-row">
        {list.map((tour) => {
          const open = tour.id === activeId;
          return (
            <Link
              key={tour.id}
              href={tour.url}
              onMouseEnter={() => setOpenId(tour.id)}
              onFocus={() => setOpenId(tour.id)}
              onClick={(e) => {
                // En táctil el primer toque expande; el segundo navega.
                if (!open) {
                  e.preventDefault();
                  setOpenId(tour.id);
                }
              }}
              aria-label={`${tour.title}, ${tour.location}, desde ${formatPrice(tour.price)}`}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-[22px] text-[#fbf5e9] outline-none transition-[flex-grow,height] duration-700 ease-[cubic-bezier(.6,0,.2,1)] focus-visible:ring-[3px] focus-visible:ring-sol focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "md:h-auto md:flex-1",
                open ? "h-[380px] md:grow-[3.4]" : "h-24 md:grow",
              )}
            >
              <Image
                src={tour.image}
                alt=""
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className={cn(
                  "object-cover transition-transform duration-[1.2s]",
                  open && "scale-105",
                )}
              />
              <span className="absolute inset-0 bg-gradient-to-b from-noche/0 from-40% to-noche/85" />

              {/* Etiqueta vertical (panel cerrado) */}
              <span
                className={cn(
                  "absolute bottom-8 left-6 z-10 text-lg font-bold tracking-[0.04em] transition-opacity duration-300 md:rotate-180 md:[writing-mode:vertical-rl]",
                  open && "opacity-0",
                )}
              >
                {tour.title}
              </span>

              {/* Detalle (panel abierto) */}
              <span
                className={cn(
                  "absolute inset-x-6 bottom-7 z-10 block transition-all delay-150 duration-500 md:inset-x-8",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-noche/55 px-3.5 py-1.5 text-[13px] font-bold">
                  <MapPin className="h-3.5 w-3.5" />
                  {tour.location}
                </span>
                <span className="mt-3.5 block text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[40px]">
                  {tour.title}
                </span>
                <span className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[#efe3cc]">
                    Desde{" "}
                    <strong className="text-[22px] text-[#fbf5e9]">{formatPrice(tour.price)}</strong>
                  </span>
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sol px-5 text-[15px] font-bold text-[#2a1a0a] transition-all group-hover:gap-3">
                    Reservar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-7 text-right">
        <Link href="/planes" className="font-bold text-barro transition-colors hover:text-primary">
          Ver todos los planes →
        </Link>
      </div>
    </section>
  );
}
