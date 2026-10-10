"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { resolveMedia } from "@/lib/media-url";
import { Image as ImageType } from "@/types/Planes";

interface PlanGalleryProps {
  mainImage: ImageType;
  gallery: ImageType[];
  baseUrl: string;
  title: string;
  /** Tipo del plan, mostrado en la miga de pan ("Planes / Desierto"). */
  typeLabel?: string;
}

// Encabezado del detalle: imagen grande con zoom lento, título encima y
// miniaturas para cambiar la foto.
export function PlanGallery({ mainImage, gallery, baseUrl, title, typeLabel }: PlanGalleryProps) {
  // Imagen principal primero, sin duplicados.
  const allImages = [
    mainImage,
    ...gallery.filter((img) => img.url !== mainImage.url),
  ];

  const [selected, setSelected] = useState(0);
  const current = allImages[selected] ?? mainImage;

  return (
    <div className="anim-rise relative h-[380px] overflow-hidden rounded-[28px] bg-muted md:h-[560px]">
      <Image
        key={current.url}
        src={resolveMedia(current.url, baseUrl)}
        alt={current.name || title}
        fill
        priority
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="anim-zoom object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-noche/0 from-45% to-noche/80" />

      <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-6 text-[#fbf5e9] md:inset-x-10 md:bottom-9">
        <div className="min-w-0">
          <Link href="/planes" className="text-sm font-semibold text-[#efe3cc] hover:text-sol">
            ← Planes{typeLabel ? ` / ${typeLabel}` : ""}
          </Link>
          <h1 className="mt-2.5 text-4xl font-extrabold leading-none tracking-[-0.045em] md:text-[72px]">
            {title}
          </h1>
        </div>

        {allImages.length > 1 && (
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {allImages.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                onClick={() => setSelected(idx)}
                aria-label={`Ver foto ${idx + 1}`}
                aria-pressed={idx === selected}
                className={cn(
                  "relative h-16 w-[84px] shrink-0 overflow-hidden rounded-[14px] border-2 transition-all hover:-translate-y-0.5",
                  idx === selected ? "border-sol" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <Image
                  src={resolveMedia(img.url, baseUrl)}
                  alt=""
                  fill
                  sizes="84px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
