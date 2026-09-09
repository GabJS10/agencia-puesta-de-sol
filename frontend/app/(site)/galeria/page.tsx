import { getGallery } from "@/lib/get-gallery";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { KanasBand } from "@/components/ui/KanasBand";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Camera } from "lucide-react";

export const metadata = {
  title: "Galería | Puesta del Sol",
  description:
    "Postales de La Guajira: desierto, mar Caribe y atardeceres de nuestros viajeros.",
};

export default async function GaleriaPage() {
  const images = await getGallery();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero oscuro (deja legible el navbar sobre él) */}
      <section className="relative overflow-hidden bg-noche px-6 pb-16 pt-36 text-arena">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brasa/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-sol/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow className="text-sol">Galería</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Postales de <span className="text-atardecer">La Guajira</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg font-light text-arena/70">
            Desierto que toca el Caribe, rancherías Wayúu y atardeceres que no
            caben en una foto. Estas son algunas de nuestras aventuras.
          </p>
        </div>
      </section>

      <KanasBand height={16} className="opacity-90" />

      {/* Contenido */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {images.length > 0 ? (
          <GalleryLightbox images={images} />
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-8 py-16 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sol/10 text-sol">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold">
              La galería está por llenarse
            </h2>
            <p className="mt-2 text-muted-foreground">
              Pronto compartiremos aquí las mejores postales de nuestros
              viajes. Vuelve muy pronto.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
