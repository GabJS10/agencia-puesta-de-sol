"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Image as ImageType } from "@/types/Planes";

interface PlanGalleryProps {
  mainImage: ImageType;
  gallery: ImageType[];
  baseUrl: string;
}

export function PlanGallery({ mainImage, gallery, baseUrl }: PlanGalleryProps) {
  // Combine main image and gallery for the thumbnails list, ensuring main image is first
  // Filter out duplicates if main image is also in gallery
  const allImages = [
    mainImage,
    ...gallery.filter((img) => img.url !== mainImage.url),
  ];

  const [selectedImage, setSelectedImage] = useState<string>(mainImage.url);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border border-border cursor-pointer">
        <Image
          src={`${baseUrl}${selectedImage}`}
          alt="Vista del plan"
          fill
          className="object-cover transition-all duration-500 hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              onClick={() => setSelectedImage(img.url)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                selectedImage === img.url
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={`${baseUrl}${img.url}`}
                alt={img.name || `Vista ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
