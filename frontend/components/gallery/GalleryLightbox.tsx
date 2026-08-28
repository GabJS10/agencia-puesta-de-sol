"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMedia } from "@/lib/media-url";
import { GalleryImage } from "@/types/Gallery";

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setOpenIndex((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, go]);

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      {/* Grid masonry (columns CSS) */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setOpenIndex(idx)}
            className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sol"
          >
            <Image
              src={resolveMedia(img.image.url)}
              alt={img.caption || "Fotografía de La Guajira"}
              width={img.image.width || 800}
              height={img.image.height || 600}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {img.caption && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-noche/80 to-transparent p-4 text-left font-display text-lg text-arena opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-noche/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Cerrar"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-arena/20 text-arena transition-colors hover:bg-arena/10"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Anterior"
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-arena/20 text-arena transition-colors hover:bg-arena/10 md:left-8"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Siguiente"
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-arena/20 text-arena transition-colors hover:bg-arena/10 md:right-8"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <figure
            className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={resolveMedia(current.image.url)}
                alt={current.caption || "Fotografía de La Guajira"}
                width={current.image.width || 1200}
                height={current.image.height || 900}
                className="max-h-[80vh] w-auto object-contain"
                priority
              />
            </div>
            {current.caption && (
              <figcaption className="font-display text-lg text-arena">
                {current.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
